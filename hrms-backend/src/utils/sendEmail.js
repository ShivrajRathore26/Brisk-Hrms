const transporter = require("../config/email");

async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
