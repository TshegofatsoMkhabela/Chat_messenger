import dotenv from "dotenv";
dotenv.config();

const listModels = async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("No API Key");
        return;
    }

    // Direct REST call to be 100% sure what the server sees
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`); // e.g. models/gemini-pro
                }
            });
        } else {
            console.log("Error response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
};

listModels();
