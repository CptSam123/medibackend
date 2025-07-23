import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  code:      { type: String, required: true },
  expiresAt: { type: Date,   required: true },
}, {
  timestamps: true,
});

// Automatically remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);
