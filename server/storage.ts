import { db } from "./db";
import {
  stories,
  type InsertStory,
  type Story
} from "@shared/schema";
import { eq, desc, ilike } from "drizzle-orm";

export interface IStorage {
  getStories(search?: string): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, updates: Partial<InsertStory>): Promise<Story>;
  deleteStory(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getStories(search?: string): Promise<Story[]> {
    if (search) {
      return await db.select()
        .from(stories)
        .where(ilike(stories.title, `%${search}%`))
        .orderBy(desc(stories.publishedAt));
    }
    return await db.select()
      .from(stories)
      .orderBy(desc(stories.publishedAt));
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story> {
    const [updated] = await db.update(stories)
      .set(updates)
      .where(eq(stories.id, id))
      .returning();
    return updated;
  }

  async deleteStory(id: number): Promise<void> {
    await db.delete(stories).where(eq(stories.id, id));
  }
}

export const storage = new DatabaseStorage();
