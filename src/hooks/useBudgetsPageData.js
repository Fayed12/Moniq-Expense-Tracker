import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useBudgetsPageData = () => {
    // ── Raw Redux data ──────────────────────────────────────
    const budgets = useSelector((s) => s.budgets.items);
    const currentMonth = useSelector((s) => s.budgets.currentMonth);
    const categories = useSelector((s) => s.categories.items);
    const transactions = useSelector((s) => s.transactions.items);
    const accounts = useSelector((s) => s.accounts.items);
    const profile = useSelector((s) => s.auth.profile);
    const user = useSelector((s) => s.auth.user);

    const isLoading = {
        budgets: useSelector((s) => s.budgets.loading),
        categories: useSelector((s) => s.categories.loading),
        transactions: useSelector((s) => s.transactions.loading),
        accounts: useSelector((s) => s.accounts.loading),
    };

    // ── User ID ─────────────────────────────────────────────
    const userId = user?.id || null;

    // ── Currency ────────────────────────────────────────────
    const currency = useMemo(() => {
        if (accounts.length > 0) return accounts[0].currency || "EGP";
        return profile?.currency || "EGP";
    }, [accounts, profile]);

    // ── Spent per category this selected month ──────────────
    const spentByCategory = useMemo(() => {
        if (!currentMonth) return {};

        const [year, month] = currentMonth.split("-").map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        const map = {};
        transactions.forEach((t) => {
            if (t.type !== "expense") return;
            const d = new Date(t.date);
            if (d < monthStart || d > monthEnd) return;
            if (!t.category_id) return;
            map[t.category_id] =
                (map[t.category_id] || 0) + Number(t.amount || 0);
        });
        return map;
    }, [transactions, currentMonth]);

    // ── Transaction count per category this month ───────────
    const txCountByCategory = useMemo(() => {
        if (!currentMonth) return {};

        const [year, month] = currentMonth.split("-").map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        const map = {};
        transactions.forEach((t) => {
            const d = new Date(t.date);
            if (d < monthStart || d > monthEnd) return;
            if (!t.category_id) return;
            map[t.category_id] = (map[t.category_id] || 0) + 1;
        });
        return map;
    }, [transactions, currentMonth]);

    // ── Budget enriched with computed fields ─────────────────
    const enrichedBudgets = useMemo(() => {
        return budgets.map((b) => {
            const spent = spentByCategory[b.category_id] || 0;
            const limit = Number(b.limit_amount || 0);
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const txCount = txCountByCategory[b.category_id] || 0;

            let status = "on-track";
            if (limit > 0 && spent > limit) status = "over-budget";
            else if (limit > 0 && pct >= 85) status = "at-risk";

            return { ...b, spent, pct, txCount, status };
        });
    }, [budgets, spentByCategory, txCountByCategory]);

    // ── Overview totals ─────────────────────────────────────
    const totalLimit = useMemo(
        () =>
            enrichedBudgets.reduce(
                (s, b) => s + Number(b.limit_amount || 0),
                0,
            ),
        [enrichedBudgets],
    );

    const totalSpent = useMemo(
        () => enrichedBudgets.reduce((s, b) => s + (b.spent || 0), 0),
        [enrichedBudgets],
    );

    const totalPct = useMemo(
        () =>
            totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0,
        [totalSpent, totalLimit],
    );

    const onTrackCount = useMemo(
        () => enrichedBudgets.filter((b) => b.status === "on-track").length,
        [enrichedBudgets],
    );

    const overBudgetCount = useMemo(
        () => enrichedBudgets.filter((b) => b.status === "over-budget").length,
        [enrichedBudgets],
    );

    const atRiskCount = useMemo(
        () => enrichedBudgets.filter((b) => b.status === "at-risk").length,
        [enrichedBudgets],
    );

    // ── Days remaining in selected month ────────────────────
    const daysRemaining = useMemo(() => {
        if (!currentMonth) return 0;
        const [year, month] = currentMonth.split("-").map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const now = new Date();
        const nowMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        if (nowMonth === currentMonth) {
            return Math.max(0, lastDay - now.getDate());
        }
        // Future month: all days remain
        if (currentMonth > nowMonth) return lastDay;
        // Past month: 0 days remain
        return 0;
    }, [currentMonth]);

    // ── Categories available for new budget ──────────────────
    // Show NON-archived categories that do NOT already have a budget for this month
    const availableCategories = useMemo(() => {
        const budgetedCatIds = new Set(
            budgets.map((b) => String(b.category_id)),
        );
        return categories.filter(
            (c) => !c.is_archived && !budgetedCatIds.has(String(c.id)),
        );
    }, [categories, budgets]);

    // ── Combined loading ────────────────────────────────────
    const loading = Object.values(isLoading).some(Boolean);

    return {
        budgets,
        enrichedBudgets,
        categories,
        transactions,
        accounts,
        currency,
        userId,
        currentMonth,
        loading,
        profile,
        // Overview metrics
        totalLimit,
        totalSpent,
        totalPct,
        onTrackCount,
        overBudgetCount,
        atRiskCount,
        daysRemaining,
        // For the add modal
        availableCategories,
        // Per-category helpers
        spentByCategory,
        txCountByCategory,
    };
};
