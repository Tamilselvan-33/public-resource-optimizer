import {
  analyzeEmergency,
  analyzeDisasterReport,
  adviseResourceAllocation,
  citizenChatAssistant
} from "../services/geminiService.js";

export const emergencyAnalyzer = async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = await analyzeEmergency(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const disasterIntelligence = async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = await analyzeDisasterReport(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const allocationAdvisor = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await adviseResourceAllocation(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const citizenChat = async (req, res, next) => {
  try {
    const { question, context } = req.body;
    const result = await citizenChatAssistant(question, context);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

