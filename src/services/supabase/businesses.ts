import { supabase } from '../../lib/supabase';

export interface Business {
    id?: string;
    business_name: string;
    owner_name: string;
    category: string;
    main_problem?: string;
    email?: string;
    description?: string;
}

export async function createBusiness(business: Business) {
    const { data, error } = await supabase
        .from('businesses')
        .insert(business)
        .select()
        .single();

    if (error) {
        console.error('Error creando negocio:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}