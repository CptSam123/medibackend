import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  specialty: String,
  phone: String,
  studies: String,
  bio: String,
  image: String
});

export default mongoose.model("Doctor", doctorSchema);
