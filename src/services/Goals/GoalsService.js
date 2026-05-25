import { supabase } from "../../config/supabase";

// =========================================================================
// fetch Goals
// =========================================================================
export const fetchGoals = async (userId) => {
    const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("uid", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

// =========================================================================
// fetch Goal by Id
// =========================================================================
export const fetchGoalById = async (id) => {
    const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

// =========================================================================
// insert Goal
// =========================================================================
export const insertGoal = async (payload) => {
    const { data, error } = await supabase
        .from("goals")
        .insert({
            uid: payload.userId,
            name: payload.name,
            description: payload.description ?? null,
            target_amount: payload.targetAmount,
            current_amount: 0,
            deadline: payload.deadline ?? null,
            linked_account_id: payload.linkedAccountId ?? null,
            color: payload.color ?? "#4CAF82",
            icon: payload.icon ?? "FaFlag",
            is_completed: false,
            completed_at: null,
            is_paused: false,
            total_contributions: 0,
            contribution_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// =========================================================================
// update Goal
// =========================================================================
export const updateGoal = async (id, changes) => {
    const { data, error } = await supabase
        .from("goals")
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

// =========================================================================
// delete Goal
// =========================================================================
export const deleteGoal = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) throw error;
    return id;
};

// =========================================================================
// fetch Contributions
// =========================================================================
export const fetchContributions = async (goalId) => {
    const { data, error } = await supabase
        .from("goal_contributions")
        .select("*")
        .eq("goal_id", goalId)
        .order("date", { ascending: false });

    if (error) throw error;
    return data;
};

// =========================================================================
// insert Contribution
// =========================================================================
export const insertContribution = async (payload) => {
    // 1. Insert contribution row
    const { data: contribution, error: cErr } = await supabase
        .from("goal_contributions")
        .insert({
            uid: payload.userId,
            goal_id: payload.goalId,
            amount: payload.amount,
            note: payload.note ?? null,
            date: payload.date ?? new Date().toISOString(),
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (cErr) throw cErr;

    // 2. Update goal current_amount, total_contributions, contribution_count
    const { data: goal, error: gErr } = await supabase
        .from("goals")
        .select(
            "current_amount, target_amount, total_contributions, contribution_count",
        )
        .eq("id", payload.goalId)
        .single();

    if (gErr) throw gErr;

    const newAmount = Number(goal.current_amount) + Number(payload.amount);
    const isCompleted = newAmount >= Number(goal.target_amount);

    const { data: updatedGoal, error: uErr } = await supabase
        .from("goals")
        .update({
            current_amount: newAmount,
            total_contributions: Number(goal.total_contributions) + Number(payload.amount),
            contribution_count: Number(goal.contribution_count) + 1,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", payload.goalId)
        .select()
        .single();

    if (uErr) throw uErr;
    return { contribution, goal: updatedGoal };
};

// =========================================================================
// delete Contribution
// =========================================================================
export const deleteContribution = async (id) => {
    const { error } = await supabase
        .from("goal_contributions")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return id;
};