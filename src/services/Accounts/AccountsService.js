import { supabase } from "../../config/supabase";
import { notifyTransferComplete } from "../Notifications/NotificationTriggers";

// ==============================================================
// fetch accounts with is_archived = false
// ==============================================================
export const fetchAccounts = async (userId) => {
    const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("uid", userId)
        .eq("is_archived", false)
        .order("is_default", { ascending: false });

    if (error) throw error;
    return data;
};

// ==============================================================
// fetch all accounts with is_archived = true and false
// ==============================================================
export const fetchAllAccounts = async (userId) => {
    const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("uid", userId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
};

// ==============================================================
// fetch account by id
// ==============================================================
export const fetchAccountById = async (id) => {
    const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

// ==============================================================
// insert account
// ==============================================================
export const insertAccount = async (payload) => {
    const { data, error } = await supabase
        .from("accounts")
        .insert({
            uid: payload.userId,
            name: payload.name,
            type: payload.type,
            balance: payload.balance ?? 0,
            currency: payload.currency ?? "EGP",
            color: payload.color ?? "#A0522D",
            icon: payload.icon ?? "FaUniversity",
            is_archived: payload.isArchived ?? false,
            is_default: payload.isDefault ?? false,
            transaction_count: 0,
            total_income: 0,
            total_expense: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==============================================================
// update account
// ==============================================================
export const updateAccount = async (id, changes) => {
    const { data, error } = await supabase
        .from("accounts")
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

// ==============================================================
// archive account
// ==============================================================
export const archiveAccount = async (id) => {
    const { data, error } = await supabase
        .from("accounts")
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ==============================================================
// delete account
// ==============================================================
export const deleteAccount = async (id) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) throw error;
    return id;
};

// ==============================================================
// transfer between accounts using the DB RPC
// ==============================================================
export const transferBetweenAccounts = async ({
    accountId,
    toAccountId,
    categoryId,
    categoryName,
    categoryIcon,
    categoryColor,
    amount,
    accountName,
    userId,
    note,
    date,
}) => {
    // 1. Insert transfer transaction record
    const { data: tx, error: txError } = await supabase
        .from("transactions")
        .insert({
            uid: userId,
            title: "Transfer Money",
            amount: amount,
            type: "transfer",
            category_id: categoryId ?? null,
            account_name:accountName,
            account_id: accountId,
            date: date ?? new Date().toISOString(),
            tags: ["transfer"],
            note: note ?? null,
            receipt_url: null,
            category_name: categoryName,
            category_icon: categoryIcon,
            category_color: categoryColor,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (txError) throw txError;

    // 2. Update both balances atomically via RPC
    const { error: rpcError } = await supabase.rpc("apply_transfer", {
        p_from: accountId,
        p_to: toAccountId,
        p_amount: amount,
    });

    if (rpcError) throw rpcError;

    // Trigger Notification
    try {
        const { data: fromAcc } = await supabase.from("accounts").select("*").eq("id", accountId).single();
        const { data: toAcc } = await supabase.from("accounts").select("*").eq("id", toAccountId).single();
        if (fromAcc && toAcc) {
            await notifyTransferComplete(userId, fromAcc, toAcc, amount);
        }
    } catch (err) {
        console.error("[AccountsService] Failed to send transfer complete notification:", err.message);
    }

    return tx;
};