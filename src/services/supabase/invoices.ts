import { supabase } from '../../lib/supabase';

export interface InvoiceRow {
    id: string;
    business_id: string;
    type: string | null;
    number: string;
    client_id: string | null;
    client_name: string;
    client_cuit: string | null;
    client_email: string | null;
    client_phone: string | null;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    issue_date: string;
    due_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateInvoiceInput {
    business_id: string;
    type?: string | null;
    number: string;
    client_id?: string | null;
    client_name: string;
    client_cuit?: string | null;
    client_email?: string | null;
    client_phone?: string | null;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    issue_date?: string;
    due_date?: string | null;
    notes?: string | null;
}

export async function getInvoices(
    businessId: string
): Promise<InvoiceRow[]> {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('business_id', businessId)
        .order('issue_date', { ascending: false });

    if (error) {
        console.error('Error obteniendo facturas:', error);
        throw error;
    }

    return (data || []) as InvoiceRow[];
}

export async function createInvoice(
    invoice: CreateInvoiceInput
): Promise<InvoiceRow> {
    const { data, error } = await supabase
        .from('invoices')
        .insert({
            business_id: invoice.business_id,
            type: invoice.type ?? null,
            number: invoice.number,
            client_id: invoice.client_id ?? null,
            client_name: invoice.client_name,
            client_cuit: invoice.client_cuit ?? null,
            client_email: invoice.client_email ?? null,
            client_phone: invoice.client_phone ?? null,
            items: invoice.items,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            status: invoice.status,
            issue_date: invoice.issue_date ?? new Date().toISOString(),
            due_date: invoice.due_date ?? null,
            notes: invoice.notes ?? null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creando factura:', error);
        throw error;
    }

    return data as InvoiceRow;
}

export async function updateInvoice(
    id: string,
    updates: Partial<CreateInvoiceInput>
): Promise<InvoiceRow> {
    const { data, error } = await supabase
        .from('invoices')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando factura:', error);
        throw error;
    }

    return data as InvoiceRow;
}

export async function deleteInvoice(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando factura:', error);
        throw error;
    }
}