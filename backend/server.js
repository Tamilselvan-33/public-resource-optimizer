import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import ambulanceRoutes from "./routes/ambulanceRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import disasterRoutes from "./routes/disasterRoutes.js";
import optimizationRoutes from "./routes/optimizationRoutes.js";
import villageRoutes from "./routes/villageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/resource_engine";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.use("/api", authRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/disaster", disasterRoutes);
app.use("/api/optimize-resources", optimizationRoutes);
app.use("/api/villages", villageRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

