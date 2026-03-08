import express from "express";
import {
  createRequest,
  getRequests,
  assignResource,
  optimizeActiveRequests
} from "../controllers/requestController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authRequired, createRequest);
router.get("/", authRequired, adminOnly, getRequests);
router.patch("/:id/assign", authRequired, adminOnly, assignResource);
router.post("/optimize", authRequired, adminOnly, optimizeActiveRequests);

export default router;

