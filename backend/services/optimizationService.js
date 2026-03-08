import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const aiEngineBaseUrl = process.env.AI_ENGINE_BASE_URL || "http://localhost:8000";

export async function optimizeResources(payload) {
  const res = await fetch(`${aiEngineBaseUrl}/optimize/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI engine error: ${res.status} ${text}`);
  }

  return res.json();
}

