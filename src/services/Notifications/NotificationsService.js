import { supabase } from "../../config/supabase";

// ==============================================================================
// Notifications Service
// ==============================================================================
export const fetchNotifications = async (userId, limit = 30) => {
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("uid", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};



// ==============================================================================
// Insert Notification
// ==============================================================================
export const insertNotification = async (payload) => {
    const { data, error } = await supabase
        .from("notifications")
        .insert({
            uid: payload.userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            is_read: false,
            related_type: payload.relatedType ?? null,
            related_id: payload.relatedId ?? null,
            priority: payload.priority ?? "normal",
            created_at: new Date().toISOString(),
            read_at: null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==============================================================================
// Mark Notification Read
// ==============================================================================
export const markNotificationRead = async (id) => {
    const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==============================================================================
// Mark All Notifications Read
// ==============================================================================
export const markAllNotificationsRead = async (userId) => {
    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("uid", userId)
        .eq("is_read", false);

    if (error) throw error;
};

// ==============================================================================
// Delete Notification
// ==============================================================================
export const deleteNotification = async (id) => {
    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return id;
};

// ==============================================================================
// Delete All Notifications
// ==============================================================================
export const deleteAllNotifications = async (userId) => {
    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("uid", userId);

    if (error) throw error;
};