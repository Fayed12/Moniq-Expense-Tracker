import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useCategoriesPageData = () => {
    // ── Raw Redux data ──────────────────────────────────────
    const categories = useSelector((s) => s.categories.items);
    const transactions = useSelector((s) => s.transactions.items);
    const budgets = useSelector((s) => s.budgets.items);
    const accounts = useSelector((s) => s.accounts.items);
    const profile = useSelector((s) => s.auth.profile);
    const user = useSelector((s) => s.auth.user);

    const isLoading = {
        categories: useSelector((s) => s.categories.loading),
        transactions: useSelector((s) => s.transactions.loading),
        budgets: useSelector((s) => s.budgets.loading),
        accounts: useSelector((s) => s.accounts.loading),
    };

    // ── User ID ─────────────────────────────────────────────
    const userId = user?.id || null;

    // ── Currency ────────────────────────────────────────────
    const currency = useMemo(() => {
        return profile?.currency || (accounts.length > 0 ? accounts[0].currency : "EGP");
    }, [accounts, profile]);

    // ── Per-Category Computed Statistics ─────────────────────
    const categoryStats = useMemo(() => {
        const stats = {};

        // 1. Initialize stats for all categories
        categories.forEach((c) => {
            stats[c.id] = {
                transactionCount: 0,
                spentThisMonth: 0,
                budgetLimit: 0,
                budgetId: null,
            };
        });

        // 2. Calculate transaction counts and monthly spent
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

        transactions.forEach((t) => {
            if (!t.category_id) return;
            // If the category was deleted but transaction still has it, ignore or handle
            if (!stats[t.category_id]) {
                stats[t.category_id] = {
                    transactionCount: 0,
                    spentThisMonth: 0,
                    budgetLimit: 0,
                    budgetId: null,
                };
            }

            stats[t.category_id].transactionCount += 1;

            if (t.type === "expense") {
                const tDate = new Date(t.date);
                if (tDate >= startOfMonth && tDate <= endOfMonth) {
                    stats[t.category_id].spentThisMonth += Number(t.amount || 0);
                }
            }
        });

        // 3. Map budget limits and budgetIds
        budgets.forEach((b) => {
            if (!b.category_id) return;
            if (!stats[b.category_id]) {
                stats[b.category_id] = {
                    transactionCount: 0,
                    spentThisMonth: 0,
                    budgetLimit: 0,
                    budgetId: null,
                };
            }
            stats[b.category_id].budgetLimit = Number(b.limit_amount || 0);
            stats[b.category_id].budgetId = b.id;
        });

        return stats;
    }, [categories, transactions, budgets]);

    // ── Combined loading ────────────────────────────────────
    const loading = Object.values(isLoading).some(Boolean);

    return {
        categories,
        transactions,
        budgets,
        accounts,
        currency,
        userId,
        categoryStats,
        loading,
        profile,
    };
};
