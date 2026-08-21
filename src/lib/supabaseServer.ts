import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error(
        "SUPABASE: VITE_SUPABASE_URL no está configurada"
    );
}

if (!supabaseKey) {
    throw new Error(
        "SUPABASE: SUPABASE_SERVICE_ROLE_KEY no está configurada"
    );
}

export const supabaseServer = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);