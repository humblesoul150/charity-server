const nodemailer = require("nodemailer");

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_PORT) === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function requireMailConfig() {
  const transporter = getTransporter();
  if (!transporter || !process.env.MAIL_FROM) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM are required");
  }
  return transporter;
}

async function sendContactEmails(contact) {
  const transporter = requireMailConfig();
  const from = process.env.MAIL_FROM;
  const recipient = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER;

  await Promise.all([
    transporter.sendMail({
      from,
      to: contact.email,
      subject: "We received your message",
      text: `Hello ${contact.name},\n\nThank you for contacting Seeds of Love Foundation. We have received your message and will get back to you as soon as possible.\n\nYour subject: ${contact.subject}`,
    }),
    transporter.sendMail({
      from,
      to: recipient,
      replyTo: contact.email,
      subject: `New contact message: ${contact.subject}`,
      text: `From: ${contact.name} <${contact.email}>\nSubject: ${contact.subject}\n\n${contact.message}`,
    }),
  ]);

  return { sent: true };
}

async function sendReplyEmail(contact, reply) {
  const transporter = requireMailConfig();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: contact.email,
    subject: `Re: ${contact.subject}`,
    text: `Hello ${contact.name},\n\n${reply}\n\nSeeds of Love Foundation`,
  });
  return { sent: true };
}

module.exports = { sendContactEmails, sendReplyEmail };