// server/utils/email.js
import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,            // e.g. "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT),    // e.g. 465 or 587
  secure: process.env.SMTP_PORT === '465',// true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,          // your Gmail address
    pass: process.env.SMTP_PASS,          // your App Password
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `"MindCare" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
