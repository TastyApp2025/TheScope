import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  category: text("category").default("Politics"),
  audioUrl: text("audio_url"),
  authorName: text("author_name").notNull(),
  authorProfileImage: text("author_profile_image"),
  isBreaking: boolean("is_breaking").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStorySchema = createInsertSchema(stories)
  .omit({ id: true, createdAt: true })
  .refine(
    (data) => {
      try {
        new URL(data.coverImageUrl);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Cover image must be a valid URL",
      path: ["coverImageUrl"],
    }
  )
  .refine(
    (data) => data.title.length <= 120,
    {
      message: "Title must be 120 characters or less",
      path: ["title"],
    }
  )
  .refine(
    (data) => data.summary.length <= 250,
    {
      message: "Summary must be 250 characters or less",
      path: ["summary"],
    }
  )
  .refine(
    (data) => data.content.length <= 5000,
    {
      message: "Content must be 5000 characters or less",
      path: ["content"],
    }
  );

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
