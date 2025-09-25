// server/models/Otp.js
import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  codeHash: { type: String, required: true }, // store hashed OTP
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

// Optional: create a TTL index to auto-delete expired OTPs (Mongo will remove documents after `expiresAt`)
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
