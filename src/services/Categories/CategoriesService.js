import { supabase } from "../../config/supabase";

// ===========================================================================
// FETCH — all active categories for the user
// ===========================================================================
export const fetchCategories = async (userId, type = null, includeArchived = true) => {
    let q = supabase
        .from("categories")
        .select("*")
        .eq("uid", userId)
        .order("created_at", { ascending: false });

    if (!includeArchived) q = q.eq("is_archived", false);
    if (type) q = q.eq("type", type);

    const { data, error } = await q;
    if (error) throw error;
    return data;
};

// ===========================================================================
// INSERT — new category
// ===========================================================================
export const insertCategory = async (payload) => {
    const { data, error } = await supabase
        .from("categories")
        .insert({
            uid: payload.userId,
            name: payload.name,
            icon: payload.icon ?? "FaEllipsisH",
            color: payload.color ?? "#9E9E9E",
            type: payload.type,
            is_default: payload.isDefault ?? true,
            is_archived: false,
            sort_order: payload.sortOrder ?? 99,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ===========================================================================
// UPDATE — category
// ===========================================================================
export const updateCategory = async (id, changes) => {
    const { data, error } = await supabase
        .from("categories")
        .update({
            ...changes,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ===========================================================================
// ARCHIVE — category
// ===========================================================================
export const archiveCategory = async (id) => {
    const { data, error } = await supabase
        .from("categories")
        .update({
            is_archived: true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ===========================================================================
// DELETE — category
// ===========================================================================
export const deleteCategory = async (id) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;
    return id;
};

// ===========================================================================
// REORDER — categories
// ===========================================================================
export const reorderCategories = async (orderedIds) => {
    const updates = orderedIds.map((id, index) =>
        supabase
            .from("categories")
            .update({
                sort_order: index + 1,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id),
    );

    const results = await Promise.all(updates);

    const error = results.find((r) => r.error);

    if (error) throw error.error;

    return updates;
};

