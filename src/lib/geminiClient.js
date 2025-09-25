// src/lib/geminiClient.js
import { GoogleGenAI } from "@google/genai";

let ai = null;

function getClient() {
  if (ai) return ai;
  const key = process.env.GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GENAI_API_KEY (or GEMINI_API_KEY) environment variable is required"
    );
  }
  ai = new GoogleGenAI({ apiKey: key });
  return ai;
}

/**
 * Call Gemini with agent details (blocking call, returns full text)
 * @param {Object} options
 * @param {string} options.agentName
 * @param {string} options.systemPrompt
 * @param {Array<{ role: 'user'|'assistant'|'model', content: string }>} options.messages
 * @returns {Promise<string>}
 */
export async function callGeminiAgent({
  agentName = "agent",
  systemPrompt = "",
  messages = [],
} = {}) {
  const client = getClient();

  // keep only last 10 messages (safe simple heuristic)
  const last = messages.slice(-10);

  // map roles to Gemini expected roles: use 'model' for assistant if needed
  const contents = last.map((m) => ({
    role: m.role === "assistant" ? "model" : m.role, // 'user' or 'model'
    parts: [{ text: m.content }],
  }));

  const systemInstruction = systemPrompt
    ? { role: "user", parts: [{ text: systemPrompt }] }
    : undefined;

  const resp = await client.models.generateContent({
    model: "gemini-2.0-flash",
    systemInstruction,
    contents,
    generationConfig: { temperature: 0.7 },
  });

  // resp.text per example; fallback to outputs if shape differs
  const text =
    resp?.text ??
    (Array.isArray(resp?.outputs)
      ? resp.outputs.map((o) => o.text).join("")
      : "");
  return text;
}
