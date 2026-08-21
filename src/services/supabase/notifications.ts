import { supabase } from '../../lib/supabase';

export interface NotificationRow {
    id: string;
    business_id: string;
    type: string;
    title: string;
    description: string;
    read: boolean;
    created_at: string;
}

export interface CreateNotificationData {
    business_id: string;
    type: string;
    title: string;
    description: string;
}

export async function getNotifications(
    businessId: string
): Promise<NotificationRow[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(
            'Error obteniendo notificaciones:',
            error
        );
        throw error;
    }

    return data || [];
}

export async function createNotification(
    notification: CreateNotificationData
): Promise<NotificationRow> {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

    if (error) {
        console.error(
            'Error creando notificación:',
            error
        );
        throw error;
    }

    return data;
}

export async function markNotificationAsRead(
    id: string
): Promise<NotificationRow> {
    const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(
            'Error marcando notificación como leída:',
            error
        );
        throw error;
    }

    return data;
}

export async function markAllNotificationsAsRead(
    businessId: string
): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('business_id', businessId)
        .eq('read', false);

    if (error) {
        console.error(
            'Error marcando todas las notificaciones como leídas:',
            error
        );
        throw error;
    }
}

export async function deleteAllNotifications(
    businessId: string
): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('business_id', businessId);

    if (error) {
        console.error(
            'Error eliminando notificaciones:',
            error
        );
        throw error;
    }
}