import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
};

export const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  const appName = "AI Learning Assistant";
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const subject = "Reset your password";
  const text = `Hi ${username || "there"},\n\nWe received a request to reset your password.\nUse this link to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour.\nIf you didn't request this, you can ignore this email.`;
  const html = `
    <p>Hi ${username || "there"},</p>
    <p>We received a request to reset your password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, you can ignore this email.</p>
  `;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[${appName}] Password reset URL for ${to}: ${resetUrl}`);
  }

  const emailTransporter = getTransporter();
  if (!emailTransporter) {
    console.warn(`[${appName}] SMTP not configured. Password reset email not sent.`);
    return;
  }

  await emailTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
