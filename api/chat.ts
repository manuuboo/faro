import { GoogleGenAI } from "@google/genai";
import { supabaseServer } from "../src/lib/supabaseServer";

export default async function handler(req: any, res: any) {
    console.log("========== FARO API START ==========");

    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: "Method not allowed",
        });
    }

    try {
        console.log("STEP 1 - Request recibido");

        const { message, businessId } = req.body;

        console.log("STEP 2 - Body recibido");
        console.log("message:", message);
        console.log("businessId:", businessId);

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                ok: false,
                error: "Message is required",
            });
        }

        if (!businessId || typeof businessId !== "string") {
            return res.status(400).json({
                ok: false,
                error: "Business ID is required",
            });
        }

        // --------------------------------------------------
        // SUPABASE
        // --------------------------------------------------

        console.log("STEP 3 - Probando Supabase");

        const {
            data: business,
            error: businessError,
        } = await supabaseServer
            .from("businesses")
            .select("*")
            .eq("id", businessId)
            .single();

        console.log("STEP 4 - Supabase respondió");

        if (businessError) {
            console.error("SUPABASE ERROR:", businessError);

            return res.status(500).json({
                ok: false,
                error: "Supabase error",
                details: businessError.message,
                code: businessError.code,
            });
        }

        if (!business) {
            return res.status(404).json({
                ok: false,
                error: "Business not found",
            });
        }

        console.log("STEP 5 - Business encontrado");

        // --------------------------------------------------
        // GEMINI
        // --------------------------------------------------

        console.log("STEP 6 - Inicializando Gemini");

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY NO EXISTE");

            return res.status(500).json({
                ok: false,
                error: "GEMINI_API_KEY is missing",
            });
        }

        console.log("STEP 7 - GEMINI_API_KEY existe");

        const ai = new GoogleGenAI({
            apiKey,
        });

        console.log("STEP 8 - Cliente Gemini creado");

        const prompt = `
Sos Faro AI, el asistente administrativo inteligente del negocio.

DATOS DEL NEGOCIO:

${JSON.stringify(business, null, 2)}

MENSAJE DEL USUARIO:

${message}

Respondé en español, de forma breve, clara y natural.
No inventes información.
`;

        console.log("STEP 9 - Enviando consulta a Gemini");

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
        });

        console.log("STEP 10 - Gemini respondió");

        const reply =
            response.text || "No pude generar una respuesta.";

        console.log("RESPUESTA:", reply);
        console.log("========== FARO API END ==========");

        return res.status(200).json({
            ok: true,
            reply,
        });

    } catch (error) {
        console.error("========== FARO API ERROR ==========");

        console.error("ERROR COMPLETO:", error);

        if (error instanceof Error) {
            console.error("ERROR MESSAGE:", error.message);
            console.error("ERROR STACK:", error.stack);
        }

        return res.status(500).json({
            ok: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown server error",
        });
    }
}