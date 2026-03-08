import express from "express";
import {
  emergencyAnalyzer,
  disasterIntelligence,
  allocationAdvisor,
  citizenChat
} from "../controllers/aiController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/emergency-analyzer", authRequired, emergencyAnalyzer);
router.post("/disaster-intel", authRequired, adminOnly, disasterIntelligence);
router.post("/allocation-advisor", authRequired, adminOnly, allocationAdvisor);
router.post("/citizen-chat", citizenChat);

export default router;

