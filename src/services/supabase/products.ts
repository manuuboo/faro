import { supabase } from '../../lib/supabase';

export interface Product {
    business_id: string;
    name: string;
    category?: string;
    stock: number;
    minimum_stock: number;
    price: number;
    cost: number;
}

export async function getProducts(businessId: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo productos:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}

export async function createProduct(product: Product) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) {
        console.error('Error creando producto:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}

export async function updateProduct(
    id: string,
    updates: Partial<Product>
) {
    const { data, error } = await supabase
        .from('products')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando producto:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return data;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando producto:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }
}

export async function adjustProductStock(
    id: string,
    delta: number,
    currentStock: number
) {
    const newStock = Math.max(0, currentStock + delta);

    return updateProduct(id, {
        stock: newStock,
    });
}