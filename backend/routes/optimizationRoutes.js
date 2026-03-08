import express from "express";
import { runOptimization } from "../controllers/optimizationController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authRequired, adminOnly, runOptimization);

export default router;

