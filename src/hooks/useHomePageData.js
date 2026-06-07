import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useHomePageData = (selectedMonth = new Date()) => {
    // ── Raw Redux data ──────────────────────────────────────
    const accounts = useSelector((s) => s.accounts.items);
    const allTransactions = useSelector((s) => s.transactions.items);
    const budgets = useSelector((s) => s.budgets.items);
    const goals = useSelector((s) => s.goals.items);
    const profile = useSelector((s) => s.auth.profile);
    const filters = useSelector((s) => s.transactions.filters);

    const loading = {
        accounts: useSelector((s) => s.accounts.loading),
        transactions: useSelector((s) => s.transactions.loading),
        budgets: useSelector((s) => s.budgets.loading),
        goals: useSelector((s) => s.goals.loading),
    };

    // ── Month boundaries ────────────────────────────────────
    const { monthStart, monthEnd, prevMonthStart, prevMonthEnd, monthLabel } =
        useMemo(() => {
            const y = selectedMonth.getFullYear();
            const m = selectedMonth.getMonth();
            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
            const pStart = new Date(y, m - 1, 1);
            const pEnd = new Date(y, m, 0, 23, 59, 59, 999);
            const label = selectedMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
            return {
                monthStart: start,
                monthEnd: end,
                prevMonthStart: pStart,
                prevMonthEnd: pEnd,
                monthLabel: label,
            };
        }, [selectedMonth]);

    // ── Apply topbar search filter ──────────────────────────
    const transactions = useMemo(() => {
        let filtered = allTransactions;

        if (filters?.search) {
            const term = filters.search.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.title?.toLowerCase().includes(term) ||
                    t.category_name?.toLowerCase().includes(term) ||
                    t.account_name?.toLowerCase().includes(term) ||
                    t.tags?.some((tag) => tag.toLowerCase().includes(term)),
            );
        }
        if (filters?.type) {
            filtered = filtered.filter((t) => t.type === filters.type);
        }
        if (filters?.categoryId) {
            filtered = filtered.filter(
                (t) => t.category_id === filters.categoryId,
            );
        }
        if (filters?.accountId) {
            filtered = filtered.filter(
                (t) => t.account_id === filters.accountId,
            );
        }
        if (filters?.tags?.length) {
            filtered = filtered.filter((t) =>
                filters.tags.some((tag) => t.tags?.includes(tag)),
            );
        }

        return filtered;
    }, [allTransactions, filters]);

    // ── Currency from first account ─────────────────────────
    const currency = useMemo(() => {
        return profile?.currency || (accounts.length > 0 ? accounts[0].currency : "EGP");
    }, [accounts, profile]);


    // ── User ────────────────────────────────────────────────
    const userName = profile?.display_name || "User";

    // ── Overview Cards ──────────────────────────────────────
    const totalBalance = useMemo(
        () => accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
        [accounts],
    );

    const totalIncome = useMemo(
        () =>
            accounts.reduce((sum, a) => sum + (Number(a.total_income) || 0), 0),
        [accounts],
    );

    const incomeSources = useMemo(
        () => accounts.filter((a) => Number(a.total_income) > 0).length,
        [accounts],
    );

    const totalExpenses = useMemo(
        () =>
            accounts.reduce(
                (sum, a) => sum + (Number(a.total_expense) || 0),
                0,
            ),
        [accounts],
    );

    // ── Month-filtered transactions ─────────────────────────
    const monthTransactions = useMemo(
        () =>
            transactions.filter((t) => {
                const d = new Date(t.date);
                return d >= monthStart && d <= monthEnd;
            }),
        [transactions, monthStart, monthEnd],
    );

    const prevMonthTransactions = useMemo(
        () =>
            transactions.filter((t) => {
                const d = new Date(t.date);
                return d >= prevMonthStart && d <= prevMonthEnd;
            }),
        [transactions, prevMonthStart, prevMonthEnd],
    );

    const expenseCount = useMemo(
        () => monthTransactions.filter((t) => t.type === "expense").length,
        [monthTransactions],
    );

    // ── % vs last month ────────────────────────────────────
    const balanceChangePercent = useMemo(() => {
        const currIncome = monthTransactions
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + Number(t.amount), 0);
        const currExpense = monthTransactions
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + Number(t.amount), 0);
        const currNet = currIncome - currExpense;

        const prevIncome = prevMonthTransactions
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + Number(t.amount), 0);
        const prevExpense = prevMonthTransactions
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + Number(t.amount), 0);
        const prevNet = prevIncome - prevExpense;

        if (prevNet === 0) return null;
        return (((currNet - prevNet) / Math.abs(prevNet)) * 100).toFixed(1);
    }, [monthTransactions, prevMonthTransactions]);

    // ── Savings & Goals ─────────────────────────────────────
    const activeGoals = useMemo(
        () => goals.filter((g) => !g.is_completed && !g.is_paused),
        [goals],
    );

    const totalSavings = useMemo(
        () =>
            activeGoals.reduce(
                (sum, g) => sum + (Number(g.current_amount) || 0),
                0,
            ),
        [activeGoals],
    );

    const activeGoalsCount = activeGoals.length;

    // ── Cash Flow Chart (weekly for selected month) ─────────
    const cashFlowData = useMemo(() => {
        const weeks = [];
        const y = selectedMonth.getFullYear();
        const m = selectedMonth.getMonth();

        // Calculate weeks in the month
        const lastDay = new Date(y, m + 1, 0);
        const totalDays = lastDay.getDate();

        // Create week buckets
        let weekNum = 1;
        let weekStart = 1;
        while (weekStart <= totalDays) {
            const weekEnd = Math.min(weekStart + 6, totalDays);
            weeks.push({
                label: `Week ${weekNum}`,
                start: weekStart,
                end: weekEnd,
            });
            weekStart = weekEnd + 1;
            weekNum++;
        }

        return weeks.map((w) => {
            const weekTx = monthTransactions.filter((t) => {
                const day = new Date(t.date).getDate();
                return day >= w.start && day <= w.end;
            });

            return {
                week: w.label,
                income: weekTx
                    .filter((t) => t.type === "income")
                    .reduce((s, t) => s + Number(t.amount), 0),
                expense: weekTx
                    .filter((t) => t.type === "expense")
                    .reduce((s, t) => s + Number(t.amount), 0),
            };
        });
    }, [monthTransactions, selectedMonth]);

    // ── Budget Health ───────────────────────────────────────
    const { budgetUsedPercent, budgetRemaining, budgetTotal, budgetSpent } =
        useMemo(() => {
            if (!budgets.length)
                return {
                    budgetUsedPercent: 0,
                    budgetRemaining: 0,
                    budgetTotal: 0,
                    budgetSpent: 0,
                };

            const total = budgets.reduce(
                (s, b) => s + (Number(b.limit_amount) || 0),
                0,
            );

            // Calculate spent from transactions matching budget categories this month
            const budgetCategoryIds = budgets.map((b) => b.category_id);
            const spent = monthTransactions
                .filter(
                    (t) =>
                        t.type === "expense" &&
                        budgetCategoryIds.includes(t.category_id),
                )
                .reduce((s, t) => s + Number(t.amount), 0);

            return {
                budgetTotal: total,
                budgetSpent: spent,
                budgetUsedPercent:
                    total > 0 ? Math.round((spent / total) * 100) : 0,
                budgetRemaining: Math.max(total - spent, 0),
            };
        }, [budgets, monthTransactions]);

    // ── Recent Transactions (last 5 from filtered) ──────────
    const recentTransactions = useMemo(() => {
        const sorted = [...transactions].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
        );
        return sorted.slice(0, 5);
    }, [transactions]);

    // ── Top Categories (expense, selected month) ────────────
    const topCategories = useMemo(() => {
        const expenseTx = monthTransactions.filter((t) => t.type === "expense");
        const totalExp = expenseTx.reduce((s, t) => s + Number(t.amount), 0);
        if (totalExp === 0) return [];

        // Group by category
        const catMap = {};
        expenseTx.forEach((t) => {
            const name = t.category_name || "Other";
            if (!catMap[name]) {
                catMap[name] = {
                    name,
                    amount: 0,
                    color: t.category_color || "#9E9E9E",
                    icon: t.category_icon || "FaEllipsisH",
                };
            }
            catMap[name].amount += Number(t.amount);
        });

        // Sort by amount, take top 4
        return Object.values(catMap)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4)
            .map((cat) => ({
                ...cat,
                percent: Math.round((cat.amount / totalExp) * 100),
            }));
    }, [monthTransactions]);

    // ── Loading state ───────────────────────────────────────
    const isLoading = Object.values(loading).some(Boolean);

    return {
        // Overview Cards
        totalBalance,
        totalIncome,
        incomeSources,
        totalExpenses,
        expenseCount,
        totalSavings,
        activeGoalsCount,
        balanceChangePercent,

        // Cash Flow
        cashFlowData,

        // Budget Health
        budgetUsedPercent,
        budgetRemaining,
        budgetTotal,
        budgetSpent,

        // Lists
        recentTransactions,
        topCategories,
        activeGoals,

        // User
        userName,
        currency,
        monthLabel,

        // Loading
        isLoading,
        loading,
    };
};
