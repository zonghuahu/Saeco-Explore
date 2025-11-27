import { GoogleGenAI, Type } from "@google/genai";

export const generateLocationDescription = async (locationName: string, userNotes?: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key not configured.";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a short, evocative, and poetic travel description for ${locationName}.${userNotes ? ` The user also noted: "${userNotes}".` : ''} Keep it under 80 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

export const generatePhotoCaption = async (locationName: string): Promise<string> => {
  if (!process.env.API_KEY) return "";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a creative, short caption for a travel photo taken in ${locationName}. Max 15 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};

export const getCityCoordinates = async (cityName: string): Promise<{lat: number, lng: number} | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Return the latitude and longitude for ${cityName} as a JSON object with keys 'lat' and 'lng'.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (Coordinates):", error);
    return null;
  }
};