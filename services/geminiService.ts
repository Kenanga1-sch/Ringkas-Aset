
import { GoogleGenAI } from "@google/genai";
import { Asset } from '../types';

// The API key is handled by the environment and should not be hardcoded.
// FIX: Initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventorySummary = async (query: string, inventoryData: Asset[]): Promise<string> => {
  // FIX: Replace mock implementation with a real call to the Gemini API.
  const prompt = `
    Based on the following inventory data in JSON format, answer the user's question.
    User Question: "${query}"
    Inventory Data: ${JSON.stringify(inventoryData, null, 2)}
    
    Provide a concise and friendly answer in Indonesian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.";
  }
};
