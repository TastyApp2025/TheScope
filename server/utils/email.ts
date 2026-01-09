import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }: { to?: string; subject: string; text?: string; html?: string }) {
  // Use provided 'to' or fallback to environment variable
  const recipient = to || process.env.ADMIN_EMAIL || process.env.USER_EMAIL; 

  // Fallback to console log if no SMTP configured
  if (!process.env.SMTP_HOST) {
    console.log("SMTP not configured. Email content:");
    console.log("Subject:", subject);
    console.log("To:", to);
    console.log("Body:", text || html);
    return { messageId: "mock-id" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@thescope.com",
    to: recipient,
    subject,
    text,
    html,
  });
}
