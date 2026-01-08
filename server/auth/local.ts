import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "./utils";
import type { User } from "@shared/models/auth";

/**
 * Configure session management with PostgreSQL store
 * Sessions persist across server restarts and are scalable
 */
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      maxAge: sessionTtl,
    },
  });
}

/**
 * Configure Passport.js with local strategy
 * Uses username/email and password for authentication
 */
export async function setupAuth(app: Express) {
  // Trust proxy headers (important for Render, Heroku, etc.)
  app.set("trust proxy", 1);

  // Setup session middleware
  app.use(getSession());

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  /**
   * Local Strategy - verify user with email/username and password
   */
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          if (!user) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          // Verify password
          const isValid = await verifyPassword(password, user.passwordHash);

          if (!isValid) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  /**
   * Serialize user to session
   * Stores user ID in session cookie
   */
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  /**
   * Deserialize user from session
   * Retrieves full user object when session is restored
   */
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

/**
 * Register a new user with email and password
 * @param email User's email (must be unique)
 * @param username Username (must be unique)
 * @param password Plain text password (will be hashed)
 * @param firstName Optional first name
 * @param lastName Optional last name
 * @returns Created user object (without password hash)
 */
export async function registerUser(
  email: string,
  username: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<User | null> {
  try {
    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Check if username already exists
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        passwordHash,
        firstName,
        lastName,
      })
      .returning();

    return newUser;
  } catch (err) {
    console.error("Registration error:", err);
    throw err;
  }
}

/**
 * Middleware to check if user is authenticated
 * Returns 401 if not authenticated
 */
export const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

/**
 * Optional auth middleware - doesn't fail if not authenticated
 * Sets req.user to null if not authenticated
 */
export const optionalAuth = (req: any, res: any, next: any) => {
  next();
};
