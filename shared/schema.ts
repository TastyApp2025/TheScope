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

export const insertStorySchema = createInsertSchema(stories).omit({ id: true, createdAt: true });

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
