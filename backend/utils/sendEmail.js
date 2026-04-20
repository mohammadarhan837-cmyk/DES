const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 587,
  secure: false, // true only for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Escrow Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;