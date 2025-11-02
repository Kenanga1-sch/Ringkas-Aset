import { GoogleGenAI } from "@google/genai";
import { Asset } from '../types';

// The API key is handled by the environment and should not be hardcoded.
// The build system (Vite) is configured to replace `process.env.API_KEY`
// with the actual environment variable at build time.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventorySummary = async (query: string, inventoryData: Asset[]): Promise<string> => {
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
