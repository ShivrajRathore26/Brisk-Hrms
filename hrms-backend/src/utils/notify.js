const Notification = require("../models/Notification");
const sendEmail = require("./sendEmail");
const { buildEmailHtml } = require("./emailTemplate");

async function notify({ userId, message, link = "", email, emailSubject, emailBodyHtml }) {
  await Notification.create({ user: userId, message, link });
  if (email && emailSubject) {
    const html = buildEmailHtml({
      heading: emailSubject,
      bodyHtml: emailBodyHtml || `<p>${message}</p>`,
      ctaText: link ? "View in HRMS" : undefined,
      ctaUrl: link ? `${process.env.CLIENT_URL}${link}` : undefined,
    });
    sendEmail({ to: email, subject: emailSubject, html }).catch((err) =>
      console.error("Email notification failed:", err.message)
    );
  }
}

module.exports = notify;
