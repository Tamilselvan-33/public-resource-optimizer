import express from "express";
import {
  getVillages,
  createVillage,
  updateVillage
} from "../controllers/villageController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authRequired, getVillages);
router.post("/", authRequired, adminOnly, createVillage);
router.patch("/:id", authRequired, adminOnly, updateVillage);

export default router;

