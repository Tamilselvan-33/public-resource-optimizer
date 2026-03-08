import express from "express";
import {
  getAmbulances,
  createAmbulance,
  updateAmbulanceStatus
} from "../controllers/ambulanceController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authRequired, getAmbulances);
router.post("/", authRequired, adminOnly, createAmbulance);
router.patch("/:id/status", authRequired, updateAmbulanceStatus);

export default router;

