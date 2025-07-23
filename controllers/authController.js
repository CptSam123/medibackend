// server/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "2h" });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role.toLowerCase() === "doctor" ? "doctor" : "user",  // Ensure role is saved properly
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Admin login check
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = generateToken("admin-id", "admin");
    return res.json({
      token,
      user: { id: "admin-id", name: "Administrator", role: "admin", email },
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user._id.toString(), user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, email: user.email },
  });
};

import Otp from '../models/Otp.js';
import { sendEmail } from '../utils/email.js'; // your nodemailer wrapper

// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    // Optionally: check email format or if already registered
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP for this email
    await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Send email
    await sendEmail({
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your OTP code is <strong>${code}</strong>. It expires in 10 minutes.</p>`
    });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('sendOtp error', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, code: otp });
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    // OTP is valid — remove it
    await Otp.deleteOne({ _id: record._id });
    res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error('verifyOtp error', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
// server/controllers/authController.js
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';


// 1) Request OTP
export const forgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No account with that email' });
  }

  // generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // hash & save
  user.passwordResetOTP = crypto.createHash('sha256').update(otp).digest('hex');
  user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10m
  await user.save();

  // send OTP via email
  const text = `Your MindCare password reset code is:\n\n${otp}\n\nThis expires in 10 minutes.`;
  try {
    await sendEmail({ to: user.email, subject: 'Your OTP Code', text });
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    // rollback
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// 2) Verify OTP & set new password
export const resetPasswordWithOTP = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    passwordResetOTP: hashedOTP,
    passwordResetOTPExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.password = password;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset' });
});