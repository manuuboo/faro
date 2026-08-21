import { supabase } from '../../lib/supabase';

export interface ActivityRow {
    id: string;
    business_id: string;
    type: string;
    title: string;
    description: string | null;
    amount: number | null;
    created_at: string;
}

/**
 * Obtiene las actividades de un negocio.
 * Las devuelve de la más reciente a la más antigua.
 */
export async function getActivities(
    businessId: string
): Promise<ActivityRow[]> {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(
            'Error cargando actividades desde Supabase:',
            error
        );
        throw error;
    }

    return data || [];
}

/**
 * Crea una nueva actividad para un negocio.
 */
export async function createActivity(activity: {
    business_id: string;
    type: string;
    title: string;
    description?: string | null;
    amount?: number | null;
}): Promise<ActivityRow> {
    const { data, error } = await supabase
        .from('activities')
        .insert({
            business_id: activity.business_id,
            type: activity.type,
            title: activity.title,
            description: activity.description ?? null,
            amount: activity.amount ?? null,
        })
        .select()
        .single();

    if (error) {
        console.error(
            'Error creando actividad en Supabase:',
            error
        );
        throw error;
    }

    return data;
}