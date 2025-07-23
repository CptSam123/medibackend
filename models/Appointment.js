import mongoose from 'mongoose';
const appointmentSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:   { type: Date, required: true },
  reason: { type: String },
  status: { type: String, default: 'Confirmed' },
});
export default mongoose.model('Appointment', appointmentSchema);
