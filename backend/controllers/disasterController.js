import { DisasterEvent } from "../models/DisasterEvent.js";
import { analyzeDisasterReport } from "../services/geminiService.js";

export const createDisasterEvent = async (req, res, next) => {
  try {
    const { type, location, severity, description } = req.body;

    let aiAnalysis = null;
    if (description) {
      try {
        aiAnalysis = await analyzeDisasterReport(description);
      } catch (e) {
        console.warn("Gemini disaster analysis failed:", e.message);
      }
    }

    const requiredResources = aiAnalysis?.estimatedRequiredResources || {};

    const event = await DisasterEvent.create({
      type,
      location,
      severity,
      description,
      requiredResources,
      aiAnalysis
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const getDisasterEvents = async (_req, res, next) => {
  try {
    const events = await DisasterEvent.find();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

