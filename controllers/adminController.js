// server/controllers/adminController.js
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

export const listUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.json(users);
};

export const listDoctors = async (req, res) => {
  const doctors = await Doctor.find().select('-password');
  res.json(doctors);
};

export const getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const appointmentsCount = await Appointment.countDocuments({ user: user._id });
  res.json({ user, appointmentsCount });
};

export const getDoctorDetail = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).select('-password');
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  const appointmentsCount = await Appointment.countDocuments({ doctor: doctor._id });
  res.json({ doctor, appointmentsCount });
};

export const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    { new: true }
  ).select('-password');
  res.json(updated);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};
export const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    console.error('Delete doctor error:', err);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
};
// (Optional) you can add updateDoctor / deleteDoctor similarly
