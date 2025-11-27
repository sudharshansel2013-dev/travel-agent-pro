import { GoogleGenAI } from "@google/genai";
import { Document, Customer, AppSettings } from "../types";

const apiKey = process.env.API_KEY || ''; 

export const isAiAvailable = () => !!apiKey;

export const generateEmailDraft = async (
    doc: Document, 
    customer: Customer, 
    settings: AppSettings
): Promise<string> => {
    if (!apiKey) return "AI API Key not configured.";

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a travel agent assistant. Write a professional and polite email to a client.
      Agency Name: ${settings.agencyName}
      Customer Name: ${customer.name}
      Document Type: ${doc.type} (Number: ${doc.number})
      Total Amount: ${settings.currency}${doc.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
      Return ONLY the body of the email.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Could not generate draft.";
    } catch (error) {
        console.error("AI Error", error);
        return "Error generating email draft. Please try again.";
    }
};

export const enhanceItineraryDescription = async (text: string): Promise<string> => {
    if (!apiKey) return text;
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Improve the following travel itinerary description to make it sound more exciting and professional.
        Original text: "${text}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || text;
    } catch (e) {
        return text;
    }
}
