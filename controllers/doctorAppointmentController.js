import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// GET: All appointments for the logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("user", "name email")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("getDoctorAppointments failed:", err);
    res.status(500).json({ error: "Failed to fetch doctor appointments" });
  }
};

// PUT: Update appointment status (accept/reject, add videoRoom, etc.)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, videoRoom } = req.body;
    const appt = await Appointment.findById(req.params.id);

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Ensure this appointment belongs to the logged-in doctor
    if (appt.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) appt.status = status;
    if (videoRoom) appt.videoRoom = videoRoom;

    await appt.save();
    res.json(appt);
  } catch (err) {
    console.error("updateAppointmentStatus failed:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
};
