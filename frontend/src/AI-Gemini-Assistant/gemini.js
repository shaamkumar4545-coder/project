import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_KEY;
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates content using the Gemini AI model.
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<string>} - The AI's response text.
 */
export async function generateContent(prompt, context = "") {
    try {
        const systemInstruction = `
            You are a Financial Command Center AI.
            User's Current Financial Context:
            ${context}

            Rules:
            1. For Logging Transactions: If the user says "log X for Y", "spent X on Y", or "got X salary", you MUST respond with a JSON block followed by a brief confirmation.
               Example response format:
               {"action": "LOG_TRANSACTION", "data": {"title": "Coffee", "amount": 50, "category": "Food", "type": "expense"}}
               I've logged your ₹50 expense for Coffee. 
            
            2. For Queries: Use the provided "Financial Context" to answer questions like "How much did I spend?". If the context is empty or data is missing, inform the user you need more information.
            3. BE CONCISE. Use the ₹ symbol for currency.
            4. If using JSON, ensure it is a single valid JSON block.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return response.text;
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw error;
    }
}
