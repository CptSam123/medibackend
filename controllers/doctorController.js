// server/controllers/doctorController.js
import Doctor from "../models/Doctor.js";

// GET all doctors
export const getAllDoctors = async (req, res) => {
  const doctors = await Doctor.find().populate("userId", "name email");
  res.json(doctors);
};

// POST: Create Doctor Profile
export const createDoctorProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ userId: req.user._id });
    if (existing) return res.status(400).json({ message: "Profile already exists" });

    const data = { ...req.body, userId: req.user._id };
    const profile = await Doctor.create(data);
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to create doctor profile" });
  }
};

// GET: Doctor Profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate("userId", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// PUT: Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const update = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true }
    ).populate("userId", "name email");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
