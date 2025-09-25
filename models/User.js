// server/models/User.js (excerpt)
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true, index: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false }, // used if you want email verification
  // fields for password reset
  passwordResetOTP: { type: String }, // hashed OTP for reset
  passwordResetOTPExpires: { type: Date },
  // add other fields...
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
