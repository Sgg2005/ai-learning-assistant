import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

// Debug env load (remove later)
console.log("ENV CHECK SUPABASE_URL:", process.env.SUPABASE_URL ? "loaded" : "missing");
console.log("ENV CHECK SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "loaded" : "missing");
console.log("ENV CHECK JWT_SECRET:", process.env.JWT_SECRET ? "loaded" : "missing");

// modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create uploads directory if it doesn't exist
fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

// initialize express app
const app = express();

// connect MongoDB
connectDB();

// middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    statusCode: 404,
  });
});

// global error handler
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});