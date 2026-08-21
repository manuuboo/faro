import { supabase } from '../../lib/supabase';

export interface Customer {
    business_id: string;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
}

export async function getCustomers(businessId: string) {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo clientes:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}

export async function createCustomer(customer: Customer) {
    const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

    if (error) {
        console.error('Error creando cliente:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}

export async function updateCustomer(
    id: string,
    updates: Partial<Customer>
) {
    const { data, error } = await supabase
        .from('customers')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando cliente:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}

export async function deleteCustomer(id: string) {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando cliente:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }
}