import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import connectDB from "./config/connectDB.js";
import { seedDatabase } from "./seedData.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Connect Database & seed demo data
connectDB().then(() => {
    seedDatabase();
});

// Security Middleware (as required by Hitbullseye Project 10)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// Rate Limiting on Authentication and Application endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per window
    message: { error: 'Too many authentication attempts, please try again later.' }
});

const applyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Too many job applications submitted. Please slow down.' }
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applyLimiter, applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", fileRoutes);
app.use("/api/analytics", analyticsRoutes);

// Backward Compatibility Aliases for Legacy Code
app.use("/jobs", jobRoutes);
app.use("/application", applicationRoutes);
app.use("/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.send("ATS API Server is running smoothly.");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack || err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: err.message || "An unexpected internal server error occurred."
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
