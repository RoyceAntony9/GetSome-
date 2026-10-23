import { GoogleGenAI } from '@google/genai';
import { db } from './db';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI();
  }
  return genAIClient;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
}

export async function generateStructuredJson<T>(
  prompt: string,
  options: AICompletionOptions = {},
  fallback: () => T
): Promise<T> {
  const settings = db.getSettings();
  const provider = settings.activeProvider;

  if (provider === 'gemini') {
    const client = getGeminiClient();
    if (client) {
      try {
        const modelName = options.model || settings.geminiModel || 'gemini-2.5-flash';
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: options.temperature ?? 0.2,
            responseMimeType: 'application/json',
            systemInstruction: options.systemInstruction || 'You are an elite B2B sales intelligence researcher and copywriter. Always output valid JSON strictly matching the requested structure without markdown formatting or code fences.',
          },
        });

        const text = response.text?.trim() || '';
        db.recordUsage(Math.round(prompt.length / 4), Math.round(text.length / 4));

        if (text) {
          const cleanJson = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleanJson);
          return parsed as T;
        }
      } catch (err: any) {
        console.warn('Gemini API call failed or timed out, utilizing deterministic research synthesis:', err.message || err);
      }
    }
  } else if (provider === 'ollama') {
    try {
      const endpoint = `${settings.ollamaEndpoint.replace(/\/$/, '')}/api/generate`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.ollamaModel || 'llama3:8b',
          prompt: `${options.systemInstruction ? options.systemInstruction + '\n\n' : ''}${prompt}`,
          format: 'json',
          stream: false,
        }),
      });
      if (res.ok) {
        const data: any = await res.json();
        db.recordUsage(Math.round(prompt.length / 4), Math.round((data.response?.length || 0) / 4));
        const parsed = JSON.parse(data.response);
        return parsed as T;
      }
    } catch (err: any) {
      console.warn('Ollama API failed:', err.message || err);
    }
  }

  // Graceful deterministic fallback
  return fallback();
}
