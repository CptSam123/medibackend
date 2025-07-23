import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";               // handles doctor profile (GET /profile)
import doctorAppointmentRoutes from "./routes/doctorAppointmentRoutes.js"; // handles appointments for doctors
import appointmentRoutes from "./routes/appointmentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from './routes/userRoutes.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Auth & general
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/quiz", quizRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Doctor-specific
app.use("/api/doctors", doctorRoutes);             // ✅ Handles /profile, /:id, etc.
app.use("/api/doctor", doctorAppointmentRoutes);   // ✅ Handles /appointments for logged-in doctor

app.use('/api/users', userRoutes);
// inside app.use(...)

// Fallback for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT}`);
});
