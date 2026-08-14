const Notification = require("../models/Notification");
const sendEmail = require("./sendEmail");

async function notify({ userId, message, link = "", email, emailSubject }) {
  await Notification.create({ user: userId, message, link });
  if (email && emailSubject) {
    sendEmail({ to: email, subject: emailSubject, html: `<p>${message}</p>` }).catch((err) =>
      console.error("Email notification failed:", err.message)
    );
  }
}

module.exports = notify;
