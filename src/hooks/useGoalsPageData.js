import { useMemo } from "react";
import { useSelector } from "react-redux";

// Stable reference constants to prevent selector reference invalidation and unnecessary useMemo triggers
const EMPTY_ARRAY = [];
const EMPTY_MAP = {};

export const useGoalsPageData = () => {
    // ── Raw Redux data ──────────────────────────────────────
    const goals = useSelector((s) => s.goals.items) || EMPTY_ARRAY;
    const rawContributions =
        useSelector((s) => s.goals.contributions) || EMPTY_MAP;
    const accounts = useSelector((s) => s.accounts.items) || EMPTY_ARRAY;
    const allTransactions =
        useSelector((s) => s.transactions.items) || EMPTY_ARRAY;
    const budgets = useSelector((s) => s.budgets.items) || EMPTY_ARRAY;
    const categories = useSelector((s) => s.categories.items) || EMPTY_ARRAY;
    const profile = useSelector((s) => s.auth.profile);
    const userId = useSelector((state) => state.auth.profile?.uid);

    const loading = useSelector(
        (s) =>
            s.goals.loading ||
            s.accounts.loading ||
            s.transactions.loading ||
            s.budgets.loading ||
            s.categories.loading,
    );

    // ── Currency ────────────────────────────────────────────
    const currency = useMemo(() => {
        if (accounts.length > 0) return accounts[0].currency || "EGP";
        return profile?.currency || "EGP";
    }, [accounts, profile]);

    // ── Default Account ─────────────────────────────────────
    const defaultAccount = useMemo(
        () => accounts.find((a) => a.is_default) || accounts[0] || null,
        [accounts],
    );

    // ── Budget Lookup Map ───────────────────────────────────
    const budgetByCategory = useMemo(() => {
        const map = {};
        budgets.forEach((b) => {
            map[b.category_id] = b;
        });
        return map;
    }, [budgets]);

    // ── Spent This Month per Category ───────────────────────
    const spentByCategory = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
        );

        const map = {};
        allTransactions.forEach((t) => {
            if (t.type !== "expense") return;
            const d = new Date(t.date);
            if (d < monthStart || d > monthEnd) return;
            if (!t.category_id) return;
            map[t.category_id] =
                (map[t.category_id] || 0) + Number(t.amount || 0);
        });
        return map;
    }, [allTransactions]);

    // ── Active Expense Categories ───────────────────────────
    const activeExpenseCategories = useMemo(() => {
        return categories.filter(
            (c) =>
                !c.is_archived && (c.type === "expense" || c.type === "both"),
        );
    }, [categories]);

    // ── Contributions Summing & Savings Rates ───────────────
    // Calculate total contributions for each goal this current month
    const monthlyContributionPerGoal = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const map = {};

        goals.forEach((g) => {
            const list = rawContributions[g.id] || [];
            let sum = 0;
            list.forEach((c) => {
                const d = new Date(c.date);
                if (d >= monthStart) {
                    sum += Number(c.amount || 0);
                }
            });
            map[g.id] = sum;
        });

        return map;
    }, [goals, rawContributions]);

    // ── Enriched Goals ──────────────────────────────────────
    const enrichedGoals = useMemo(() => {
        return goals.map((g) => {
            const current = Number(g.current_amount || 0);
            const target = Number(g.target_amount || 1);
            const pct = Math.min(Math.round((current / target) * 100), 100);

            // Calculate saving/mo this month
            const monthlySaving = monthlyContributionPerGoal[g.id] || 0;

            // Status logic: if deadline exists, verify if on track
            let status = "On Track";
            if (g.deadline) {
                const deadDate = new Date(g.deadline);
                const today = new Date();
                const diffTime = deadDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // If deadline passed and not completed -> Behind
                if (diffDays <= 0 && pct < 100) {
                    status = "Behind";
                } else if (pct < 40 && diffDays < 90) {
                    // Less than 40% complete and less than 3 months left
                    status = "Slightly Behind";
                } else if (pct < 15 && diffDays < 180) {
                    status = "Slightly Behind";
                }
            }

            return {
                ...g,
                pct,
                monthlySaving,
                status,
            };
        });
    }, [goals, monthlyContributionPerGoal]);

    // ── Totals ──────────────────────────────────────────────
    const { totalTarget, totalAccumulated, overallProgress } = useMemo(() => {
        const active = enrichedGoals.filter((g) => !g.is_paused);
        const target = active.reduce(
            (sum, g) => sum + Number(g.target_amount || 0),
            0,
        );
        const accumulated = active.reduce(
            (sum, g) => sum + Number(g.current_amount || 0),
            0,
        );
        const pct =
            target > 0
                ? Math.min(Math.round((accumulated / target) * 100), 100)
                : 0;

        return {
            totalTarget: target,
            totalAccumulated: accumulated,
            overallProgress: pct,
        };
    }, [enrichedGoals]);

    // ── Milestones (goals completed in last 30 days) ──────────
    const milestones = useMemo(() => {
        const now = new Date();

        return enrichedGoals
            .filter((g) => g.is_completed)
            .map((g) => {
                let compDateStr = "recently";
                if (g.completed_at) {
                    const date = new Date(g.completed_at);
                    const diffDays = Math.ceil(
                        (now - date) / (1000 * 60 * 60 * 24),
                    );
                    if (diffDays <= 1) compDateStr = "today";
                    else if (diffDays <= 7) compDateStr = "this week";
                    else compDateStr = `${Math.floor(diffDays / 7)} weeks ago`;
                }
                return {
                    id: g.id,
                    name: g.name,
                    color: g.color,
                    icon: g.icon,
                    completedAtStr: compDateStr,
                };
            });
    }, [enrichedGoals]);

    // ── Smart Suggestions (mocked dynamically) ───────────────
    const smartSuggestions = useMemo(() => {
        const suggestions = [];
        const behindGoal = enrichedGoals.find(
            (g) =>
                g.status === "Slightly Behind" &&
                !g.is_completed &&
                !g.is_paused,
        );

        if (behindGoal) {
            let monthName = "Mar 2026";
            if (behindGoal.deadline) {
                monthName = new Date(behindGoal.deadline).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        year: "numeric",
                    },
                );
            }
            suggestions.push({
                id: `suggest-${behindGoal.id}`,
                goalId: behindGoal.id,
                title: "Smart Suggestion",
                text: `Increase monthly contribution to '${behindGoal.name}' by ${currency} 500 to get back on track for ${monthName}.`,
                actionLabel: "Apply Change",
            });
        } else {
            // General suggestion
            suggestions.push({
                id: "suggest-general",
                title: "Smart Suggestion",
                text: "Create a recurring savings rule to automate a 10% monthly savings transfer and secure your emergency funds.",
                actionLabel: "Set Automation",
            });
        }
        return suggestions;
    }, [enrichedGoals, currency]);

    return {
        goals: enrichedGoals,
        allGoals: enrichedGoals, // raw lists
        contributions: rawContributions,
        accounts,
        defaultAccount,
        profile,
        currency,
        totalTarget,
        totalAccumulated,
        overallProgress,
        milestones,
        smartSuggestions,
        activeExpenseCategories,
        budgetByCategory,
        spentByCategory,
        userId,
        loading,
    };
};
