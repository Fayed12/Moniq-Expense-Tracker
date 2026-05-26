import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useAccountsPageData = () => {
    // ── Raw Redux data ──────────────────────────────────────
    const accounts = useSelector((s) => s.accounts.items);
    const archivedAccounts = useSelector((s) => s.accounts.archivedItems);
    const isLoading = useSelector((s) => s.accounts.loading);
    const error = useSelector((s) => s.accounts.error);
    const user = useSelector((s) => s.auth.user);
    const profile = useSelector((s) => s.auth.profile);
    const categories = useSelector((s) => s.categories.items);

    // ── User ID ─────────────────────────────────────────────
    const userId = user?.id || null;

    // ── Currency ────────────────────────────────────────────
    const currency = useMemo(() => {
        if (accounts.length > 0) return accounts[0].currency || "EGP";
        return profile?.currency || "EGP";
    }, [accounts, profile]);

    // ── Overview Computations ───────────────────────────────
    const totalBalance = useMemo(
        () => accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
        [accounts],
    );

    const totalIncome = useMemo(
        () => accounts.reduce((sum, a) => sum + (Number(a.total_income) || 0), 0),
        [accounts],
    );

    const totalExpenses = useMemo(
        () => accounts.reduce((sum, a) => sum + (Number(a.total_expenses) || 0), 0),
        [accounts],
    );

    const totalTransactions = useMemo(
        () => accounts.reduce((sum, a) => sum + (Number(a.transaction_count) || 0), 0),
        [accounts],
    );

    // ── Default Account ─────────────────────────────────────
    const defaultAccount = useMemo(
        () => accounts.find((a) => a.is_default) || null,
        [accounts],
    );

    // ── Transfer category lookup ────────────────────────────
    const transferCategory = useMemo(
        () => categories.find((c) =>
            c.name?.toLowerCase() === "transfer" ||
            c.name?.toLowerCase() === "transfers"
        ) || null,
        [categories],
    );

    return {
        accounts,
        archivedAccounts,
        totalBalance,
        totalIncome,
        totalExpenses,
        totalTransactions,
        defaultAccount,
        currency,
        isLoading,
        error,
        userId,
        categories,
        transferCategory,
    };
};
