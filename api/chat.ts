import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        console.log("=== FARO GEMINI TEST ===");

        const apiKey = process.env.GEMINI_API_KEY;

        console.log(
            "GEMINI_API_KEY presente:",
            apiKey ? "SI" : "NO"
        );

        if (!apiKey) {
            return res.status(500).json({
                ok: false,
                error: "GEMINI_API_KEY no está disponible en Vercel",
            });
        }

        const ai = new GoogleGenAI({
            apiKey,
        });

        console.log("GoogleGenAI inicializado");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: "Respondé solamente: GEMINI OK",
        });

        console.log("Gemini respondió");

        return res.status(200).json({
            ok: true,
            reply: response.text || "Sin texto",
        });
    } catch (error) {
        console.error("=== GEMINI ERROR ===");
        console.error(error);

        return res.status(500).json({
            ok: false,
            error:
                error instanceof Error
                    ? error.message
                    : String(error),
        });
    }
}