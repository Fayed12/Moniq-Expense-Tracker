import { supabase } from "../../config/supabase";

// ─────────────────────────────────────────────
// FETCH — all transactions for the user
// supports filters: type, categoryId, accountId, search, tags
// ─────────────────────────────────────────────
export const fetchTransactions = async (userId, filters = {}) => {
    let q = supabase
        .from("transactions")
        .select("*")
        .eq("uid", userId)
        .order("date", { ascending: false });

    if (filters.type) q = q.eq("type", filters.type);
    if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
    if (filters.accountId) q = q.eq("account_id", filters.accountId);
    if (filters.search) q = q.ilike("title", `%${filters.search}%`);
    if (filters.tags?.length) q = q.overlaps("tags", filters.tags);

    const { data, error } = await q;
    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────
// FETCH ONE
// ─────────────────────────────────────────────
export const fetchTransactionById = async (id) => {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────
// INSERT
// Required: userId, title, amount, type, accountId
// Optional: categoryId, date, tags, note, receiptUrl
// ─────────────────────────────────────────────
export const insertTransaction = async (payload) => {
    const { data, error } = await supabase
        .from("transactions")
        .insert({
            uid: payload.userId,
            title: payload.title,
            amount: payload.amount,
            type: payload.type,
            category_id: payload.categoryId ?? null,
            account_id: payload.accountId,
            date: payload.date ?? new Date().toISOString(),
            tags: payload.tags ?? [],
            note: payload.note ?? null,
            receipt_url: payload.receiptUrl ?? null,
            category_name: payload.categoryName ?? null,
            category_icon: payload.categoryIcon ?? null,
            category_color: payload.categoryColor ?? null,
            account_name: payload.accountName ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
export const updateTransaction = async (id, changes) => {
    const { data, error } = await supabase
        .from("transactions")
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

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
export const deleteTransaction = async (id) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) throw error;
    return id;
};

// ─────────────────────────────────────────────
// DELETE MANY (bulk)
// ─────────────────────────────────────────────
export const deleteTransactions = async (ids) => {
    const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", ids);

    if (error) throw error;
    return ids;
};