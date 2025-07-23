// server/controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    // Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointmentDate = new Date(date);
    const now = new Date();

    // ✅ Prevent booking in the past
    if (appointmentDate < now) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past' });
    }

    // ✅ Check for overlapping appointments (1-hour duration)
    const oneHourLater = new Date(appointmentDate.getTime() + 60 * 60 * 1000);

    const conflict = await Appointment.findOne({
      doctor: doctor._id,
      date: {
        $gte: appointmentDate,
        $lt: oneHourLater
      }
    });

    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' });
    }

    const appointment = new Appointment({
      user: req.user._id,
      doctor: doctor._id,
      date: appointmentDate,
      reason,
      status: 'Confirmed',
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};


// GET /api/appointments/mine (For logged-in user)
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email' }
      });

    const now = new Date();

    // Update status to 'Completed' for past appointments
    for (let appt of appointments) {
      if (appt.status === 'Confirmed' && new Date(appt.date) < now) {
        appt.status = 'Completed';
        await appt.save();
      }
    }

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// DELETE /api/appointments/:id
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

   if (
  appt.user.toString() !== req.user._id.toString() &&
  appt.doctor.toString() !== req.user._id.toString()
) {
  return res.status(403).json({ message: 'Forbidden' });
}
if (new Date(appt.date) < new Date()) {
  return res.status(400).json({ message: 'Cannot delete past appointment' });
}


    await appt.deleteOne();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};
