// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "express-async-handler";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/email.js"; // your nodemailer wrapper

const BCRYPT_ROUNDS = +(process.env.BCRYPT_ROUNDS || 10);
const JWT_EXPIRES = process.env.JWT_EXPIRES || "2h";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

/**
 * REGISTER
 * - creates user (password hashed)
 * - does NOT require OTP by default (server-side). If you want to enforce OTP
 *   at registration, update frontend to call send-otp/verify-otp and change logic accordingly.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email and password required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role && role.toLowerCase() === "doctor" ? "doctor" : "user",
    isVerified: false, // default - set to true via verifyOtp if you want verification flow
  });

  res.status(201).json({ message: "Registered successfully", userId: user._id });
});

/**
 * LOGIN
 * - standard flow: find user, optional isVerified check, bcrypt.compare, issue JWT
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Admin override (optional)
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken("admin-id", "admin");
    return res.json({
      token,
      user: { id: "admin-id", name: "Administrator", role: "admin", email },
    });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  // If you want to block unverified accounts from logging in, enable this:
  if (process.env.ENFORCE_EMAIL_VERIFICATION === "true" && !user.isVerified) {
    return res.status(403).json({ error: "Email not verified" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = generateToken(user._id.toString(), user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, email: user.email },
  });
});

/**
 * SEND OTP
 * - stores a HASHED OTP in Otp collection (better security)
 * - responds quickly and sends email asynchronously (fire-and-forget)
 */
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // generate numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // hash OTP before saving
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  await Otp.findOneAndUpdate(
    { email },
    { codeHash, expiresAt },
    { upsert: true, new: true }
  );

  // respond immediately to caller
  res.json({ message: "OTP sent" });
  console.log("Generated OTP for", email, "is", code);

  // send email asynchronously (do not block response)
  sendEmail({
    to: email,
    subject: "Your Verification Code",
    text: `Your OTP code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your OTP code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  }).catch((err) => {
    // log but don't break the API response
    console.error("sendEmail error (async):", err);
  });
});

/**
 * VERIFY OTP
 * - verifies hashed OTP from Otp collection
 * - marks user.isVerified = true if verification success (optional)
 * - removes the OTP document after verification
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and otp required" });

  const codeHash = crypto.createHash("sha256").update(otp).digest("hex");
  const record = await Otp.findOne({ email, codeHash });
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // delete OTP record
  await Otp.deleteOne({ _id: record._id });

  // mark user as verified (create field on User schema if not present)
  await User.updateOne({ email }, { $set: { isVerified: true } });

  res.json({ message: "OTP verified" });
});

/**
 * FORGOT PASSWORD - send OTP for password reset (stores hashed code in user document)
 */
export const forgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No account with that email" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // store hashed OTP on user (so we avoid plain text in DB)
  user.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");
  user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  res.json({ message: "OTP sent to email" });

  // send email async
  const text = `Your password reset code is: ${otp}. It expires in 10 minutes.`;
  sendEmail({ to: user.email, subject: "Your OTP Code", text }).catch((err) =>
    console.error("sendEmail (forgotPassword) error:", err)
  );
});

/**
 * RESET PASSWORD WITH OTP
 * - verifies hashed OTP on user
 * - hashes the new password before saving (CRITICAL fix)
 */
export const resetPasswordWithOTP = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ message: "email, otp and password required" });

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    passwordResetOTP: hashedOTP,
    passwordResetOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // hash new password before saving (important)
  user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset" });
});
