import { supabase } from "../../config/supabase";
import { insertNotification } from "./NotificationsService";

// Helper to format currency values cleanly
function formatCurrency(amount, currency = "EGP") {
    return `${currency} ${(Number(amount) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

// Check if a similar notification was already sent today
async function alreadyNotifiedToday(userId, type, relatedId) {
    if (!relatedId) return false;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select("id")
            .eq("uid", userId)
            .eq("type", type)
            .eq("related_id", relatedId)
            .gte("created_at", twentyFourHoursAgo)
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error("[NotificationTriggers] Duplicate check failed:", error.message);
        return false;
    }
}

/**
 * Checks budget spent percentage and triggers alert if >= 75% or >= 100%.
 */
export async function checkBudgetAlert(userId, budget, userPrefs) {
    if (!userPrefs?.notify_budget_alert) return;

    const { id, limit_amount, spent, category_name } = budget;
    const limit = Number(limit_amount) || 0;
    const spentVal = Number(spent) || 0;
    const pct = limit > 0 ? spentVal / limit : 0;

    if (pct >= 1.0) {
        const alreadySent = await alreadyNotifiedToday(userId, "budget_alert", id);
        if (alreadySent) return;

        await insertNotification({
            userId,
            type: "budget_alert",
            title: `Budget Exceeded: ${category_name}`,
            message: `You've spent 100% of your ${category_name} budget (${formatCurrency(spentVal)} of ${formatCurrency(limit)}).`,
            priority: "high",
            relatedType: "budget",
            relatedId: id,
        });
    } else if (pct >= 0.75) {
        const alreadySent = await alreadyNotifiedToday(userId, "budget_alert", id);
        if (alreadySent) return;

        await insertNotification({
            userId,
            type: "budget_alert",
            title: `Budget Alert: ${category_name}`,
            message: `You've used ${Math.round(pct * 100)}% of your ${category_name} budget (${formatCurrency(spentVal)} of ${formatCurrency(limit)}).`,
            priority: "normal",
            relatedType: "budget",
            relatedId: id,
        });
    }
}

/**
 * Checks savings goal progress and triggers milestone alerts (25%, 50%, 75%) or goal completion (100%).
 */
export async function checkGoalNotifications(userId, goal, previousAmount, userPrefs) {
    if (!userPrefs?.notify_goal_reached) return;

    const { id, name, target_amount, current_amount } = goal;
    const target = Number(target_amount) || 0;
    const current = Number(current_amount) || 0;
    const prev = Number(previousAmount) || 0;

    if (target <= 0) return;

    // Goal Reached (100% or more)
    if (current >= target && prev < target) {
        await insertNotification({
            userId,
            type: "goal_reached",
            title: `Goal Achieved: ${name} 🎉`,
            message: `Congratulations! You've reached your savings goal of ${formatCurrency(target)} for "${name}".`,
            priority: "high",
            relatedType: "goal",
            relatedId: id,
        });
        return;
    }

    // Crossed milestones: 75%, 50%, 25%
    const milestones = [75, 50, 25];
    const prevPct = (prev / target) * 100;
    const newPct = (current / target) * 100;

    for (const milestone of milestones) {
        if (prevPct < milestone && newPct >= milestone) {
            const alreadySent = await alreadyNotifiedToday(userId, "goal_milestone", id);
            if (alreadySent) break;

            await insertNotification({
                userId,
                type: "goal_milestone",
                title: `Goal Milestone: ${name}`,
                message: `You've reached ${milestone}% of your goal for "${name}" (${formatCurrency(current)} of ${formatCurrency(target)}). Keep it up!`,
                priority: "low",
                relatedType: "goal",
                relatedId: id,
            });
            break;
        }
    }
}

/**
 * Checks if account balance drops below the danger threshold and triggers low balance warning.
 */
export async function checkLowBalance(userId, account) {
    const LOW_BALANCE_THRESHOLD = 50;
    const { id, name, balance, currency } = account;
    const bal = Number(balance) || 0;

    if (bal < LOW_BALANCE_THRESHOLD) {
        const alreadySent = await alreadyNotifiedToday(userId, "low_balance", id);
        if (alreadySent) return;

        await insertNotification({
            userId,
            type: "low_balance",
            title: `Low Balance Alert: ${name}`,
            message: `Your "${name}" balance is down to ${formatCurrency(bal, currency)}. Consider replenishing your funds.`,
            priority: "high",
            relatedType: "account",
            relatedId: id,
        });
    }
}

/**
 * Triggers a notification when a successful transfer transaction completes.
 */
export async function notifyTransferComplete(userId, fromAccount, toAccount, amount) {
    await insertNotification({
        userId,
        type: "transfer_complete",
        title: "Transfer Completed Successfully",
        message: `${formatCurrency(amount, fromAccount.currency)} has been transferred from "${fromAccount.name}" to "${toAccount.name}".`,
        priority: "normal",
        relatedType: "account",
        relatedId: fromAccount.id,
    });
}

/**
 * Generates a weekly financial summary digest if user settings enable it and one hasn't been sent in 7 days.
 */
export async function checkWeeklyDigest(userId, userPrefs) {
    if (!userPrefs?.notify_weekly_digest) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
        const { data: lastDigest, error: checkError } = await supabase
            .from("notifications")
            .select("created_at")
            .eq("uid", userId)
            .eq("type", "weekly_digest")
            .gte("created_at", sevenDaysAgo)
            .order("created_at", { ascending: false })
            .limit(1);

        if (checkError) throw checkError;
        if (lastDigest && lastDigest.length > 0) return; // Already sent recently

        const { data: txns, error: txError } = await supabase
            .from("transactions")
            .select("type, amount")
            .eq("uid", userId)
            .gte("date", sevenDaysAgo);

        if (txError) throw txError;
        if (!txns || txns.length === 0) return;

        let income = 0;
        let expenses = 0;
        txns.forEach((t) => {
            const amt = Number(t.amount) || 0;
            if (t.type === "income") income += amt;
            else if (t.type === "expense") expenses += amt;
        });

        const net = income - expenses;
        const count = txns.length;

        await insertNotification({
            userId,
            type: "weekly_digest",
            title: "Your Weekly Financial Digest",
            message: `Summary for the last 7 days: logged ${count} transactions. Total Income: ${formatCurrency(income)}, Total Expenses: ${formatCurrency(expenses)}. Net: ${formatCurrency(net)}.`,
            priority: "low",
            relatedType: null,
            relatedId: null,
        });
    } catch (error) {
        console.error("[NotificationTriggers] Weekly digest calculation failed:", error.message);
    }
}
