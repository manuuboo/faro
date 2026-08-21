import { supabase } from '../../lib/supabase';

export interface SupabasePurchase {
    id: string;
    business_id: string;
    description: string;
    amount: number;
    category: string | null;
    expense_date: string | null;
    created_at: string;
    product_id: string | null;
    quantity: number | null;
    unit_price: number | null;
}

export interface CreatePurchaseData {
    business_id: string;
    description: string;
    amount: number;
    category?: string | null;
    expense_date?: string | null;
    product_id?: string | null;
    quantity?: number | null;
    unit_price?: number | null;
}

export async function getExpenses(
    businessId: string
): Promise<SupabasePurchase[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId)
        .order('expense_date', { ascending: false });

    if (error) {
        console.error('Error obteniendo compras:', error);
        throw error;
    }

    return data ?? [];
}

export async function createExpense(
    purchase: CreatePurchaseData
): Promise<SupabasePurchase> {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            business_id: purchase.business_id,
            description: purchase.description,
            amount: purchase.amount,
            category: purchase.category ?? null,
            expense_date:
                purchase.expense_date ?? new Date().toISOString(),
            product_id: purchase.product_id ?? null,
            quantity: purchase.quantity ?? null,
            unit_price: purchase.unit_price ?? null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creando compra:', error);
        throw error;
    }

    return data;
}

export async function deleteExpense(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando compra:', error);
        throw error;
    }
}