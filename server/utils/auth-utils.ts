import crypto from "crypto";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword } from "../auth/utils";
import { sendEmail } from "./email";

export async function createResetToken(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await db.update(users)
    .set({ resetToken: token, resetTokenExpires: expires })
    .where(eq(users.id, user.id));

  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const [user] = await db.select().from(users).where(
    and(
      eq(users.resetToken, token),
      gt(users.resetTokenExpires, new Date())
    )
  );

  if (!user) return false;

  const passwordHash = await hashPassword(newPassword);
  await db.update(users)
    .set({ 
      passwordHash, 
      resetToken: null, 
      resetTokenExpires: null 
    })
    .where(eq(users.id, user.id));

  return true;
}
