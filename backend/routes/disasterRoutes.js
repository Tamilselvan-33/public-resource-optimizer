import express from "express";
import {
  createDisasterEvent,
  getDisasterEvents
} from "../controllers/disasterController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authRequired, createDisasterEvent);
router.get("/", authRequired, adminOnly, getDisasterEvents);

export default router;

