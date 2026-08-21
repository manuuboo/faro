import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required",
            });
        }

        console.log("FARO GEMINI TEST");
        console.log("Mensaje recibido:", message);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: message,
        });

        const reply =
            response.text || "Gemini no devolvió respuesta.";

        console.log("Gemini respondió correctamente");

        return res.status(200).json({
            reply,
        });
    } catch (error) {
        console.error("GEMINI ERROR:", error);

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Error conectando con Gemini",
        });
    }
}