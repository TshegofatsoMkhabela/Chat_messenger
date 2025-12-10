import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Debug script to list models
const debugModels = async () => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log("NO API KEY FOUND IN .env");
            return;
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Note: listModels is on the genAI instance or manager?
        // Actually, looking at docs, usually it's hard to list without specific client method, 
        // but let's try a safe known model first: 'gemini-pro'.

        console.log("Trying to use 'gemini-1.5-flash'...");
        let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a simple listModels exposed in the high-level SDK easily in one line 
        // without looking up the specific manager pattern, 
        // but we can try to infer from error or just try 'gemini-pro'.

        // Let's try to verify if gemini-pro works, as a fallback.
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro:", result.response.text());

    } catch (error) {
        console.error("Error:", error.message);
    }
};

debugModels();
