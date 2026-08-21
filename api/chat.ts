import { supabaseServer } from "../src/lib/supabaseServer";

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const { businessId } = req.body;

        return res.status(200).json({
            reply: `Supabase server cargó correctamente. Business ID recibido: ${businessId ? "sí" : "no"}`,
        });
    } catch (error) {
        console.error("SUPABASE SERVER ERROR:", error);

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Error cargando Supabase server",
        });
    }
}