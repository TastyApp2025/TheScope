import nodemailer from "nodemailer";

export async function sendEmail({ subject, text, html }: { subject: string; text?: string; html?: string }) {
  // Use environment variable for the recipient if available, otherwise it will need to be provided in the call
  // For a generic reset system, we should allow passing 'to'
  const to = process.env.ADMIN_EMAIL || process.env.USER_EMAIL; 

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
    to: to,
    subject,
    text,
    html,
  });
}
