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
import userRoutes from "./routes/userRoutes.js";

const app = express();
connectDB();

// ✅ CORS configuration to allow local + deployed frontend
app.use(cors({
  origin: [
    'http://localhost:5173' // 🔁 Replace with your actual Vercel frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ✅ Parses incoming JSON
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor", doctorAppointmentRoutes);
app.use("/api/users", userRoutes);

// ❌ Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start the server
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT}`);
});
