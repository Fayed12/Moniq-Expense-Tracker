import { supabase } from "../../config/supabase";

// ============================================================================
// FETCH BUDGETS data 
// ============================================================================
export const fetchBudgets = async (userId, month = null) => {
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);

    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("uid", userId)
        .eq("month", targetMonth)
        .order("category_name", { ascending: true });

    if (error) throw error;
    return data;
};

// ============================================================================
// FETCH BUDGETS HISTORY data 
// ============================================================================
export const fetchBudgetHistory = async (userId, monthsBack = 6) => {
    const months = [];
    for (let i = 0; i < monthsBack; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toISOString().slice(0, 7));
    }

    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("uid", userId)
        .in("month", months)
        .order("month", { ascending: false });

    if (error) throw error;
    return data;
};

// ============================================================================
// UPSERT BUDGETS data 
// ============================================================================
export const upsertBudget = async (payload) => {
    const { data, error } = await supabase
        .from("budgets")
        .upsert(
            {
                uid: payload.userId,
                category_id: payload.categoryId,
                month: payload.month ?? new Date().toISOString().slice(0, 7),
                limit_amount: payload.limitAmount,
                rollover: payload.rollover ?? false,
                rollover_amount: payload.rolloverAmount ?? 0,
                category_name: payload.categoryName ?? null,
                category_icon: payload.categoryIcon ?? null,
                category_color: payload.categoryColor ?? null,
                created_at: new Date().toISOString(),   
                updated_at: new Date().toISOString(),
            },
            { onConflict: "uid,category_id,month" },
        )
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ============================================================================
// UPDATE BUDGETS 
// ============================================================================
export const updateBudget = async (id, changes) => {
    const { data, error } = await supabase
        .from("budgets")
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

// ============================================================================
// DELETE BUDGETS 
// ============================================================================
export const deleteBudget = async (id) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) throw error;
    return id;
};

// ============================================================================
// RECALCULATE BUDGET SPENT via RPC, use with any transaction change 
// ============================================================================
export const recalculateBudgetSpent = async (userId, categoryId, month) => {
    const { error } = await supabase.rpc("recalculate_budget_spent", {
        p_uid: userId,
        p_category_id: categoryId,
        p_month: month,
    });
    if (error) throw error;
};