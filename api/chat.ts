import { supabaseServer } from "../src/lib/supabaseServer";

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const { businessId } = req.body;

        console.log("Business ID:", businessId);

        if (!businessId) {
            return res.status(400).json({
                error: "Business ID is required",
            });
        }

        const { data: business, error } = await supabaseServer
            .from("businesses")
            .select("*")
            .eq("id", businessId)
            .single();

        console.log("Business:", business);
        console.log("Supabase error:", error);

        if (error) {
            return res.status(500).json({
                error: error.message,
            });
        }

        return res.status(200).json({
            reply: `Supabase funciona. Negocio: ${business.business_name || business.id}`,
        });
    } catch (error) {
        console.error("SUPABASE TEST ERROR:", error);

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Supabase test failed",
        });
    }
}