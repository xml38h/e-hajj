
import { GoogleGenAI } from "@google/genai";
import { PilgrimProfile, Language } from "../types";

export const getEmergencyBrief = async (profile: PilgrimProfile, targetLang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an emergency medical assistant for Hajj. 
    Summarize the following medical profile into a short, critical emergency brief in ${targetLang}.
    Focus on life-saving information: Allergies, Chronic Diseases, and current medications.
    
    Profile:
    Name: ${profile.fullName}
    Conditions: ${profile.medicalHistory.chronicDiseases.join(", ")}
    Allergies: ${profile.medicalHistory.allergies.join(", ")}
    Meds: ${profile.medicationHistory.map(m => `${m.name} (${m.dosage})`).join(", ")}
    
    Output strictly the summary text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 200,
      }
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI summary.";
  }
};
