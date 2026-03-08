import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Gemini features will be disabled.");
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const getModel = () => {
  if (!genAI) {
    throw new Error("Gemini client not initialized");
  }
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

async function callGemini(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeEmergency(text) {
  const prompt = `
You are an emergency triage AI. Analyze the following emergency description and respond ONLY with a JSON object in this exact schema:
{
  "emergencyType": "string",
  "severityLevel": 0-4,
  "recommendedResources": ["ambulances", "medical teams"],
  "keywords": ["..."]
}

Description:
${text}
`;
  const raw = await callGemini(prompt);
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonText = raw.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText);
    return { ...parsed, raw };
  } catch {
    return {
      emergencyType: "Unknown",
      severityLevel: 1,
      recommendedResources: [],
      keywords: [],
      raw
    };
  }
}

export async function analyzeDisasterReport(text) {
  const prompt = `
You are a disaster intelligence assistant. Summarize and analyze the report below.
Respond ONLY with JSON in this schema:
{
  "summary": "string",
  "affectedRegions": ["string"],
  "estimatedSeverity": 1-5,
  "estimatedRequiredResources": {
    "ambulances": number,
    "medicalTeams": number,
    "reliefUnits": number
  },
  "responseStrategy": "string"
}

Report:
${text}
`;
  const raw = await callGemini(prompt);
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonText = raw.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText);
    return { ...parsed, raw };
  } catch {
    return {
      summary: raw.slice(0, 500),
      affectedRegions: [],
      estimatedSeverity: 3,
      estimatedRequiredResources: {
        ambulances: 0,
        medicalTeams: 0,
        reliefUnits: 0
      },
      responseStrategy: "",
      raw
    };
  }
}

export async function adviseResourceAllocation(data) {
  const prompt = `
You are a public resource allocation advisor. Given the structured data below about villages, populations, elderly, distance from hospitals, severity, and available resources, suggest an optimal allocation strategy.

Return ONLY JSON with this schema:
{
  "recommendations": "string",
  "warnings": ["string"],
  "allocationPlan": [
    {
      "villageName": "string",
      "recommendedAmbulances": number,
      "recommendedMedicalTeams": number,
      "notes": "string"
    }
  ]
}

Data:
${JSON.stringify(data)}
`;
  const raw = await callGemini(prompt);
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonText = raw.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText);
    return { ...parsed, raw };
  } catch {
    return {
      recommendations: raw.slice(0, 500),
      warnings: [],
      allocationPlan: [],
      raw
    };
  }
}

export async function citizenChatAssistant(question, context = "") {
  const prompt = `
You are a helpful citizen-facing assistant for rural public emergencies, ambulances, disasters, and health education.
User question:
${question}

Context (may be empty):
${context}

Answer clearly and concisely in plain language suitable for non-technical citizens.
`;
  const raw = await callGemini(prompt);
  return { answer: raw };
}

