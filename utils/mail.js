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

function getBrandConfig() {
  return {
    orgName: process.env.ORG_NAME || "Seeds of Love Foundation",
    orgTagline: process.env.ORG_TAGLINE || "We Rise By Lifting Others",
    logoUrl: process.env.ORG_LOGO_URL || "https://res.cloudinary.com/ghost150/image/upload/v1740000000/logo.png",
    facebookUrl: process.env.FACEBOOK_URL || "https://facebook.com",
    xUrl: process.env.X_URL || "https://x.com",
    tiktokUrl: process.env.TIKTOK_URL || "https://tiktok.com",
    websiteUrl: process.env.WEBSITE_URL || "https://www.seedsoflovefoundation.org",
  };
}

function buildNewsletterWelcomeHtml(name, email, verificationToken, unsubscribeToken) {
  const brand = getBrandConfig();
  const verifyUrl = `${brand.websiteUrl}/newsletter/verify/${verificationToken}`;
  const unsubscribeUrl = `${brand.websiteUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken || '')}`;

  return `
    <div style="font-family: Arial, sans-serif; background: #f4f7f5; padding: 32px 0; color: #1f2937;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: #0d5f39; padding: 28px 24px; text-align: center;">
          <img src="${brand.logoUrl}" alt="${brand.orgName} Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto 12px; border-radius: 12px; background: white; padding: 8px;" />
          <h1 style="margin: 0; color: #ffffff; font-size: 28px;">${brand.orgName}</h1>
          <p style="margin: 8px 0 0; color: #d9fbe3; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">${brand.orgTagline}</p>
        </div>

        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 16px; font-size: 24px; color: #0d5f39;">Thank you for joining our newsletter, ${name || 'friend'}!</h2>
          <p style="margin: 0 0 16px; line-height: 1.6; font-size: 16px;">
            We are grateful you chose to stay connected with us. To confirm your subscription, please verify your email below.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #2eb872; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: bold; font-size: 15px;">
              Confirm subscription
            </a>
          </div>

          <div style="background: #eefaf2; border-left: 4px solid #2eb872; padding: 16px 18px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1f2937;">
              Once confirmed, you’ll receive inspiring stories, impact updates, and opportunities to support our work.
            </p>
          </div>

          <p style="margin: 0 0 10px; font-size: 14px; color: #4b5563;">
            Need to change your mind? You can unsubscribe anytime using the secure link below.
          </p>
          <p style="margin: 0; font-size: 14px; color: #4b5563;">
            <a href="${unsubscribeUrl}" style="color: #0d5f39;">Unsubscribe from newsletter</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 18px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #374151;">Follow us</p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <a href="${brand.facebookUrl}" style="color: #0d5f39; text-decoration: none; font-weight: bold;">Facebook</a>
            <a href="${brand.xUrl}" style="color: #0d5f39; text-decoration: none; font-weight: bold;">X</a>
            <a href="${brand.tiktokUrl}" style="color: #0d5f39; text-decoration: none; font-weight: bold;">TikTok</a>
          </div>
        </div>
      </div>
    </div>
  `;
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

async function sendNewsletterWelcomeEmail({ email, name, verificationToken, unsubscribeToken }) {
  const transporter = requireMailConfig();
  const brand = getBrandConfig();

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    replyTo: process.env.CONTACT_RECIPIENT || process.env.SMTP_USER,
    subject: `Confirm your ${brand.orgName} newsletter subscription`,
    html: buildNewsletterWelcomeHtml(name, email, verificationToken, unsubscribeToken),
    text: `Hello ${name || 'friend'},\n\nThank you for subscribing to ${brand.orgName}. Please confirm your subscription here: ${brand.websiteUrl}/newsletter/verify/${verificationToken}\n\nUnsubscribe here: ${brand.websiteUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken || '')}\n\n${brand.orgName}`,
  });

  return { sent: true };
}

module.exports = { sendContactEmails, sendReplyEmail, sendNewsletterWelcomeEmail };