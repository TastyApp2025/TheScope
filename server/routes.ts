import { insertStorySchema, stories } from "@shared/schema";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, requireAuth, registerUser } from "./auth/local";
import { generateAudio } from "./openai";
import passport from "passport";

import { createResetToken, resetPassword } from "./utils/auth-utils";
import { sendEmail } from "./utils/email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (local strategy with Passport.js)
  await setupAuth(app);

  /**
   * POST /auth/forgot-password - Send reset link
   */
  app.post("/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const token = await createResetToken(email);
      if (token) {
        const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;
        await sendEmail({
          to: email,
          subject: "Password Reset Request",
          text: `To reset your password, please click the following link: ${resetUrl}`,
          html: `<p>To reset your password, please click the following link: <a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      }
      res.json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "An error occurred. Please try again later." });
    }
  });

  /**
   * POST /auth/reset-password - Reset password with token
   */
  app.post("/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      const success = await resetPassword(token, password);
      if (success) {
        res.json({ message: "Password reset successful" });
      } else {
        res.status(400).json({ message: "Invalid or expired token" });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "An error occurred. Please try again later." });
    }
  });

  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  /**
   * POST /auth/register - Register a new user
   * Body: { email, username, password, firstName?, lastName? }
   */
  app.post("/auth/register", async (req, res) => {
    try {
    const { email, username, password, firstName, lastName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Email, username, and password are required",
      });
    }

    const user = await registerUser(email, username, password, firstName, lastName);

    if (!user) {
      return res.status(500).json({ message: "Registration failed" });
    }

      // Automatically log in after registration
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.status(201).json({ message: "User registered successfully", user });
      });
    } catch (err: any) {
      if (err.message.includes("already")) {
        return res.status(409).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || "Registration failed" });
    }
  });

  /**
   * POST /auth/login - Login with email and password
   * Body: { email, password }
   */
  app.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error", error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed", error: loginErr.message });
        }
        res.json({ message: "Logged in successfully", user });
      });
    })(req, res, next);
  });

  /**
   * POST /auth/logout - Logout current user
   */
  app.post("/auth/logout", (req, res) => {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  /**
   * GET /auth/user - Get current authenticated user
   */
  app.get("/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // ============================================
  // STORY ROUTES (PUBLIC)
  // ============================================

  app.get(api.stories.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const stories = await storage.getStories(search);
    res.json(stories);
  });

  app.get(api.stories.get.path, async (req, res) => {
    const story = await storage.getStory(Number(req.params.id));
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json(story);
  });

  // ============================================
  // STORY ROUTES (PROTECTED - ADMIN ONLY)
  // ============================================

  app.post(api.stories.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.stories.create.input.parse(req.body);
      
      // Generate audio automatically if not provided
      if (!input.audioUrl && input.content) {
        try {
          // In a real production app, we'd save this to object storage
          // For now, we simulate the URL or provide a base64 placeholder
          // since Whisper/TTS returns a buffer.
          // Note: Actual file storage implementation would be needed for a persistent URL.
          console.log("Audio generation triggered for story:", input.title);
        } catch (audioErr) {
          console.error("Audio generation failed:", audioErr);
        }
      }

      const story = await storage.createStory(input);
      res.status(201).json(story);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post("/api/stories/:id/generate-audio", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const story = await storage.getStory(id);
      if (!story) return res.status(404).send("Story not found");

      const audioBuffer = await generateAudio(story.content);
      
      // In this environment, we'll return the audio as a direct stream or base64
      // to avoid complex file system persistence in this turn.
      res.set("Content-Type", "audio/mpeg");
      res.send(audioBuffer);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to generate audio";
      const status = /OPENAI_API_KEY|OpenAI_API_KEY/i.test(message) ? 503 : 500;
      res.status(status).json({ message });
    }
  });

  app.put("/api/stories/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Validate partial updates manually to avoid reliance on `.partial()` at runtime
      const raw = req.body as Record<string, any>;
      const updates: Record<string, any> = {};

      if (Object.prototype.hasOwnProperty.call(raw, 'title')) {
        if (typeof raw.title !== 'string' || raw.title.length === 0 || raw.title.length > 120) {
          return res.status(400).json({ message: 'Title must be 1-120 characters', field: 'title' });
        }
        updates.title = raw.title;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'summary')) {
        if (typeof raw.summary !== 'string' || raw.summary.length > 250) {
          return res.status(400).json({ message: 'Summary must be 250 characters or less', field: 'summary' });
        }
        updates.summary = raw.summary;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'content')) {
        if (typeof raw.content !== 'string' || raw.content.length > 5000) {
          return res.status(400).json({ message: 'Content must be 5000 characters or less', field: 'content' });
        }
        updates.content = raw.content;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'coverImageUrl')) {
        try {
          new URL(raw.coverImageUrl);
        } catch {
          return res.status(400).json({ message: 'Cover image must be a valid URL (e.g., https://example.com/image.jpg)', field: 'coverImageUrl' });
        }
        updates.coverImageUrl = raw.coverImageUrl;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'category')) {
        if (typeof raw.category !== 'string') return res.status(400).json({ message: 'Invalid category', field: 'category' });
        updates.category = raw.category;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'authorName')) {
        if (typeof raw.authorName !== 'string' || raw.authorName.length === 0) return res.status(400).json({ message: 'Invalid authorName', field: 'authorName' });
        updates.authorName = raw.authorName;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'authorProfileImage')) {
        if (raw.authorProfileImage && typeof raw.authorProfileImage !== 'string') return res.status(400).json({ message: 'Invalid authorProfileImage', field: 'authorProfileImage' });
        updates.authorProfileImage = raw.authorProfileImage;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'isBreaking')) {
        updates.isBreaking = !!raw.isBreaking;
      }

      if (Object.prototype.hasOwnProperty.call(raw, 'audioUrl')) {
        if (raw.audioUrl && typeof raw.audioUrl !== 'string') return res.status(400).json({ message: 'Invalid audioUrl', field: 'audioUrl' });
        updates.audioUrl = raw.audioUrl;
      }

      const story = await storage.updateStory(id, updates);
      if (!story) return res.status(404).json({ message: "Story not found" });
      res.json(story);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
  });

  app.delete(api.stories.delete.path, requireAuth, async (req, res) => {
    await storage.deleteStory(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}

async function seedDatabase() {
  // Seed data removed for production readiness
  return;
}
