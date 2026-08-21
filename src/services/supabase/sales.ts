import { supabase } from '../../lib/supabase';

export interface SaleRow {
    id: string;
    business_id: string;
    product_id: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    sold_at: string;
    created_at: string;
}

interface CreateSaleInput {
    business_id: string;
    product_id?: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    sold_at?: string;
}

// ─── Obtener ventas ──────────────────────────────────────────────────────────

export async function getSales(businessId: string): Promise<SaleRow[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('business_id', businessId)
        .order('sold_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo ventas:', error);
        throw error;
    }

    return data || [];
}

// ─── Crear venta ─────────────────────────────────────────────────────────────

export async function createSale(
    sale: CreateSaleInput
): Promise<SaleRow> {
    const { data, error } = await supabase
        .from('sales')
        .insert({
            business_id: sale.business_id,
            product_id: sale.product_id ?? null,
            quantity: sale.quantity,
            unit_price: sale.unit_price,
            total: sale.total,
            sold_at: sale.sold_at || new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creando venta:', error);
        throw error;
    }

    return data;
}

// ─── Eliminar venta ─────────────────────────────────────────────────────────

export async function deleteSale(id: string): Promise<void> {
    const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando venta:', error);
        throw error;
    }
}