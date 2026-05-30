import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useTransactionsPageData = () => {
    // ── Raw Redux data ──────────────────────────────────────
    const transactions = useSelector((s) => s.transactions.items);
    const accounts = useSelector((s) => s.accounts.items);
    const rawCategories = useSelector((s) => s.categories.items);
    const categories = useMemo(() => {
        return rawCategories.filter((c) => c.is_default && !c.is_archived);
    }, [rawCategories]);
    const budgets = useSelector((s) => s.budgets.items);
    const profile = useSelector((s) => s.auth.profile);
    const user = useSelector((s) => s.auth.user);

    const isLoading = {
        transactions: useSelector((s) => s.transactions.loading),
        accounts: useSelector((s) => s.accounts.loading),
        categories: useSelector((s) => s.categories.loading),
    };

    // ── User ID ─────────────────────────────────────────────
    const userId = user?.id || null;

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

    // ── Total count ─────────────────────────────────────────
    const totalCount = transactions.length;

    // ── Unique tags from all transactions ────────────────────
    const uniqueTags = useMemo(() => {
        const tagSet = new Set();
        transactions.forEach((t) => {
            t.tags?.forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [transactions]);

    // ── Budget lookup: categoryId → budget object ───────────
    const budgetByCategory = useMemo(() => {
        const map = {};
        budgets.forEach((b) => {
            map[b.category_id] = b;
        });
        return map;
    }, [budgets]);

    // ── Spent this month per category (for budget checks) ───
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
        transactions.forEach((t) => {
            if (t.type !== "expense") return;
            const d = new Date(t.date);
            if (d < monthStart || d > monthEnd) return;
            if (!t.category_id) return;
            map[t.category_id] = (map[t.category_id] || 0) + Number(t.amount);
        });
        return map;
    }, [transactions]);

    // ── Combined loading ────────────────────────────────────
    const loading = Object.values(isLoading).some(Boolean);

    return {
        transactions,
        accounts,
        categories,
        budgets,
        currency,
        userId,
        defaultAccount,
        totalCount,
        uniqueTags,
        budgetByCategory,
        spentByCategory,
        loading,
        profile,
    };
};
