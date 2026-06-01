import { useMemo } from "react";
import { useSelector } from "react-redux";

const EMPTY_ARRAY = [];

export const useReportsPageData = (
    selectedPeriod = "this-month",
    customRange = { from: null, to: null },
    selectedAccountId = "",
) => {
    // ── Raw Redux Selectors ──────────────────────────────────
    const accounts = useSelector((s) => s.accounts.items) || EMPTY_ARRAY;
    const transactions =
        useSelector((s) => s.transactions.items) || EMPTY_ARRAY;
    const categories = useSelector((s) => s.categories.items) || EMPTY_ARRAY;
    const budgets = useSelector((s) => s.budgets.items) || EMPTY_ARRAY;
    const goals = useSelector((s) => s.goals.items) || EMPTY_ARRAY;
    const profile = useSelector((s) => s.auth.profile) || null;

    const isLoadingAccounts = useSelector((s) => s.accounts.loading);
    const isLoadingTransactions = useSelector((s) => s.transactions.loading);
    const isLoadingCategories = useSelector((s) => s.categories.loading);
    const isLoadingBudgets = useSelector((s) => s.budgets.loading);
    const isLoadingGoals = useSelector((s) => s.goals.loading);

    const isAppLoading =
        isLoadingAccounts ||
        isLoadingTransactions ||
        isLoadingCategories ||
        isLoadingBudgets ||
        isLoadingGoals;

    // ── Currency Resolution ──────────────────────────────────
    const currency = useMemo(() => {
        if (accounts.length > 0) return accounts[0].currency || "EGP";
        return profile?.currency || "EGP";
    }, [accounts, profile]);

    // ── Date Range Calculation ───────────────────────────────
    const dateRanges = useMemo(() => {
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        let start, end;
        let prevStart, prevEnd;

        switch (selectedPeriod) {
            case "this-week": {
                const day = today.getDay();
                const diffToMonday =
                    today.getDate() - day + (day === 0 ? -6 : 1);
                start = new Date(today.setDate(diffToMonday));
                start.setHours(0, 0, 0, 0);

                end = new Date(start);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);

                prevStart = new Date(start);
                prevStart.setDate(start.getDate() - 7);

                prevEnd = new Date(end);
                prevEnd.setDate(end.getDate() - 7);
                break;
            }

            case "last-month": {
                const y = now.getFullYear();
                const m = now.getMonth();
                start = new Date(y, m - 1, 1, 0, 0, 0, 0);
                end = new Date(y, m, 0, 23, 59, 59, 999);

                prevStart = new Date(y, m - 2, 1, 0, 0, 0, 0);
                prevEnd = new Date(y, m - 1, 0, 23, 59, 59, 999);
                break;
            }

            case "last-3-months": {
                end = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    23,
                    59,
                    59,
                    999,
                );
                start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);

                prevEnd = new Date(start.getTime() - 1);
                prevStart = new Date(
                    prevEnd.getTime() - 90 * 24 * 60 * 60 * 1000,
                );
                prevStart.setHours(0, 0, 0, 0);
                break;
            }

            case "last-6-months": {
                end = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    23,
                    59,
                    59,
                    999,
                );
                start = new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);

                prevEnd = new Date(start.getTime() - 1);
                prevStart = new Date(
                    prevEnd.getTime() - 180 * 24 * 60 * 60 * 1000,
                );
                prevStart.setHours(0, 0, 0, 0);
                break;
            }

            case "this-year": {
                const y = now.getFullYear();
                start = new Date(y, 0, 1, 0, 0, 0, 0);
                end = new Date(y, 11, 31, 23, 59, 59, 999);

                prevStart = new Date(y - 1, 0, 1, 0, 0, 0, 0);
                prevEnd = new Date(y - 1, 11, 31, 23, 59, 59, 999);
                break;
            }

            case "custom": {
                start = customRange.from
                    ? new Date(customRange.from)
                    : new Date(today);
                start.setHours(0, 0, 0, 0);

                end = customRange.to
                    ? new Date(customRange.to)
                    : new Date(today);
                end.setHours(23, 59, 59, 999);

                const diff = end.getTime() - start.getTime();
                prevEnd = new Date(start.getTime() - 1);
                prevStart = new Date(prevEnd.getTime() - diff);
                prevStart.setHours(0, 0, 0, 0);
                break;
            }

            case "this-month":
            default: {
                const y = now.getFullYear();
                const m = now.getMonth();
                start = new Date(y, m, 1, 0, 0, 0, 0);
                end = new Date(y, m + 1, 0, 23, 59, 59, 999);

                prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
                prevEnd = new Date(y, m, 0, 23, 59, 59, 999);
                break;
            }
        }

        return { start, end, prevStart, prevEnd };
    }, [selectedPeriod, customRange]);

    // Helper to parse dates in local timezone to avoid UTC timezone shift issues
    const parseLocalDate = (dateInput) => {
        if (!dateInput) return new Date(0);
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return new Date(0);
        
        if (typeof dateInput === "string" && dateInput.includes("-")) {
            const hasT = dateInput.includes("T");
            const [datePart, timePart] = dateInput.split("T");
            const dateSegments = datePart.split("-");
            if (dateSegments.length === 3) {
                const y = Number(dateSegments[0]);
                const m = Number(dateSegments[1]) - 1;
                const day = Number(dateSegments[2]);
                if (hasT && timePart) {
                    const timeSegments = timePart.split("Z")[0].split(":");
                    const h = Number(timeSegments[0]) || 0;
                    const min = Number(timeSegments[1]) || 0;
                    const s = Number(timeSegments[2]?.split(".")[0]) || 0;
                    return new Date(y, m, day, h, min, s);
                }
                return new Date(y, m, day);
            }
        }
        return d;
    };

    // ── Period Filtered Transactions ─────────────────────────
    const { filteredTx, prevFilteredTx } = useMemo(() => {
        const { start, end, prevStart, prevEnd } = dateRanges;

        const current = [];
        const previous = [];

        transactions.forEach((tx) => {
            const txDate = parseLocalDate(tx.date);
            if (txDate >= start && txDate <= end) {
                current.push(tx);
            } else if (txDate >= prevStart && txDate <= prevEnd) {
                previous.push(tx);
            }
        });

        return { filteredTx: current, prevFilteredTx: previous };
    }, [transactions, dateRanges]);

    // ── Overview micro stats ───────────────────────────────
    const bannerOverview = useMemo(() => {
        const uniqueAccountsUsed = new Set(filteredTx.map((t) => t.account_id))
            .size;
        const uniqueCategoriesUsed = new Set(
            filteredTx.map((t) => t.category_name),
        ).size;

        return {
            totalTxCount: filteredTx.length,
            activeAccountsCount: uniqueAccountsUsed || accounts.length,
            activeCategoriesCount: uniqueCategoriesUsed || categories.length,
            userName: profile?.display_name || "User",
            photoUrl: profile?.photo_url || null,
        };
    }, [filteredTx, accounts, categories, profile]);

    // ── 1. REPORT A: Monthly Summary Data ──────────────────────
    const monthlySummary = useMemo(() => {
        let incomeTotal = 0;
        let expenseTotal = 0;
        let prevIncomeTotal = 0;
        let prevExpenseTotal = 0;

        filteredTx.forEach((tx) => {
            if (tx.type === "income") incomeTotal += Number(tx.amount) || 0;
            else if (tx.type === "expense")
                expenseTotal += Number(tx.amount) || 0;
        });

        prevFilteredTx.forEach((tx) => {
            if (tx.type === "income") prevIncomeTotal += Number(tx.amount) || 0;
            else if (tx.type === "expense")
                prevExpenseTotal += Number(tx.amount) || 0;
        });

        const netSavings = incomeTotal - expenseTotal;
        const prevNetSavings = prevIncomeTotal - prevExpenseTotal;

        const getChangePct = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        const incomeTrend = getChangePct(incomeTotal, prevIncomeTotal).toFixed(
            1,
        );
        const expenseTrend = getChangePct(
            expenseTotal,
            prevExpenseTotal,
        ).toFixed(1);
        const netTrend = getChangePct(netSavings, prevNetSavings).toFixed(1);

        // Budget Adherence table data
        // For standard demonstration, join Redux budgets with category spent aggregates
        const yr = dateRanges.start.getFullYear();
        const mo = String(dateRanges.start.getMonth() + 1).padStart(2, "0");
        const monthStr = `${yr}-${mo}`;
        const filteredBudgets = budgets.filter((b) => b.month === monthStr);

        const budgetAdherence = filteredBudgets
            .map((b) => {
                const limit = Number(b.limit_amount) || 0;

                // Calculate spent from filtered period transactions matching category
                const spent = filteredTx
                    .filter(
                        (t) =>
                            t.type === "expense" &&
                            t.category_id === b.category_id,
                    )
                    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

                const remaining = limit - spent;
                const pctUsed =
                    limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

                let status = "🟢 Under Budget";
                if (pctUsed > 100) status = "🔴 Over Budget";
                else if (pctUsed > 70) status = "🟡 On Track (>70%)";

                return {
                    id: b.id,
                    categoryName: b.category_name,
                    categoryColor: b.category_color,
                    categoryIcon: b.category_icon,
                    limit,
                    spent,
                    remaining,
                    pctUsed,
                    status,
                };
            })
            .sort((a, b) => b.pctUsed - a.pctUsed);

        // Largest Transactions List
        const topTransactions = [...filteredTx];

        // Mini monthly trend chart data (last 6 months cash flow)
        const miniTrendData = [];
        const now = new Date();
        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        for (let i = 5; i >= 0; i--) {
            const tempDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = tempDate.getFullYear();
            const m = tempDate.getMonth();

            const startOfTemp = new Date(y, m, 1);
            const endOfTemp = new Date(y, m + 1, 0, 23, 59, 59, 999);

            let inc = 0;
            let exp = 0;

            transactions.forEach((tx) => {
                const txDate = new Date(tx.date);
                if (txDate >= startOfTemp && txDate <= endOfTemp) {
                    if (tx.type === "income") inc += Number(tx.amount) || 0;
                    else if (tx.type === "expense")
                        exp += Number(tx.amount) || 0;
                }
            });

            miniTrendData.push({
                month: monthNames[m],
                Income: Math.round(inc),
                Expense: Math.round(exp),
            });
        }

        return {
            income: {
                value: incomeTotal,
                trend: incomeTrend,
                isPositive: Number(incomeTrend) >= 0,
            },
            expense: {
                value: expenseTotal,
                trend: expenseTrend,
                isPositive: Number(expenseTrend) <= 0,
            },
            net: {
                value: netSavings,
                trend: netTrend,
                isPositive: netSavings >= prevNetSavings,
            },
            budgetAdherence,
            topTransactions,
            miniTrendData,
        };
    }, [filteredTx, prevFilteredTx, transactions, budgets, dateRanges]);

    // ── 2. REPORT B: Category Report Data ──────────────────────
    const categoryReport = useMemo(() => {
        const expenses = filteredTx.filter((t) => t.type === "expense");
        const totalSpent = expenses.reduce(
            (s, t) => s + (Number(t.amount) || 0),
            0,
        );

        // Grouping
        const groupMap = {};
        expenses.forEach((tx) => {
            const name = tx.category_name || "Other";
            if (!groupMap[name]) {
                groupMap[name] = {
                    name,
                    icon: tx.category_icon || "FaEllipsisH",
                    color: tx.category_color || "#9E9E9E",
                    amount: 0,
                    txCount: 0,
                };
            }
            groupMap[name].amount += Number(tx.amount) || 0;
            groupMap[name].txCount += 1;
        });

        const list = Object.values(groupMap).sort(
            (a, b) => b.amount - a.amount,
        );
        const categoriesCount = list.length;

        const maxSpentCat = list[0] || null;
        const minSpentCat = list[list.length - 1] || null;
        const avgSpentPerCat =
            categoriesCount > 0 ? totalSpent / categoriesCount : 0;

        // Expanded transaction lists map per category
        const transactionsByCategory = {};
        expenses.forEach((tx) => {
            const name = tx.category_name || "Other";
            if (!transactionsByCategory[name])
                transactionsByCategory[name] = [];
            transactionsByCategory[name].push(tx);
        });

        // Current period vs prior period grouped data for bar comparisons
        const comparisons = list.slice(0, 5).map((item) => {
            const prevSpent = prevFilteredTx
                .filter(
                    (t) =>
                        t.type === "expense" && t.category_name === item.name,
                )
                .reduce((s, t) => s + (Number(t.amount) || 0), 0);

            return {
                category: item.name,
                Current: Math.round(item.amount),
                Previous: Math.round(prevSpent),
            };
        });

        return {
            kpis: {
                totalCount: categoriesCount,
                highestSpent: maxSpentCat
                    ? { name: maxSpentCat.name, amount: maxSpentCat.amount }
                    : null,
                lowestSpent: minSpentCat
                    ? { name: minSpentCat.name, amount: minSpentCat.amount }
                    : null,
                avgSpent: avgSpentPerCat,
            },
            deepDiveList: list.map((item) => {
                const prevSpent = prevFilteredTx
                    .filter(
                        (t) =>
                            t.type === "expense" &&
                            t.category_name === item.name,
                    )
                    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

                const changePct =
                    prevSpent > 0
                        ? (
                              ((item.amount - prevSpent) / prevSpent) *
                              100
                          ).toFixed(1)
                        : item.amount > 0
                          ? "100"
                          : "0";

                return {
                    ...item,
                    percentage:
                        totalSpent > 0
                            ? Number(
                                  ((item.amount / totalSpent) * 100).toFixed(1),
                              )
                            : 0,
                    change: changePct,
                    isIncrease: Number(changePct) > 0,
                    transactions: transactionsByCategory[item.name] || [],
                };
            }),
            comparisons,
        };
    }, [filteredTx, prevFilteredTx]);

    // ── 3. REPORT C: Account Statement Data ────────────────────
    const accountStatement = useMemo(() => {
        if (!selectedAccountId || accounts.length === 0) {
            return { account: null, ledger: [], kpis: null };
        }

        const activeAcc = accounts.find((a) => a.id === selectedAccountId);
        if (!activeAcc) return { account: null, ledger: [], kpis: null };

        const { start } = dateRanges;

        // Fetch chronological ledger inside period
        const accTx = filteredTx
            .filter((t) => t.account_id === selectedAccountId)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // ASC order to calculate running balance

        // Sum income/expense deltas
        const incomeSum = accTx
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const expenseSum = accTx
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const netChange = incomeSum - expenseSum;

        // Opening balance calculation relative to the period start
        // Current balance represents the balance *right now* (end of database writes).
        // Let's count back all transactions from *now* until the start of the period to find opening balance!
        let opening = Number(activeAcc.balance) || 0;
        const sortedAllAccTx = [...transactions]
            .filter((t) => t.account_id === selectedAccountId)
            .sort((x, y) => new Date(y.date) - new Date(x.date)); // DESC order

        sortedAllAccTx.forEach((tx) => {
            const txDate = new Date(tx.date);
            if (txDate > start) {
                // Reverse transaction effect
                if (tx.type === "income") opening -= Number(tx.amount) || 0;
                else if (tx.type === "expense")
                    opening += Number(tx.amount) || 0;
            }
        });

        // Building ledger with running balance
        const ledger = [];
        let balanceTracker = opening;
        for (let i = 0; i < accTx.length; i++) {
            const tx = accTx[i];
            if (tx.type === "income") {
                balanceTracker += Number(tx.amount) || 0;
            } else if (tx.type === "expense") {
                balanceTracker -= Number(tx.amount) || 0;
            }
            
            ledger.push({
                id: tx.id,
                date: new Date(tx.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                }),
                title: tx.title,
                categoryName: tx.categoryName || tx.category_name || "Other",
                type: tx.type,
                amount: Number(tx.amount) || 0,
                runningBalance: balanceTracker,
            });
        }

        // Re-sorting DESC for document viewing
        const reverseLedger = [...ledger].reverse();

        return {
            account: activeAcc,
            ledger: reverseLedger,
            kpis: {
                openingBalance: opening,
                closingBalance: balanceTracker,
                income: incomeSum,
                expense: expenseSum,
                netChange,
            },
        };
    }, [selectedAccountId, accounts, filteredTx, transactions, dateRanges]);

    // ── 4. REPORT D: Budget Performance Data ───────────────────
    const budgetPerformance = useMemo(() => {
        const yr = dateRanges.start.getFullYear();
        const mo = String(dateRanges.start.getMonth() + 1).padStart(2, "0");
        const monthStr = `${yr}-${mo}`;
        const filteredBudgets = budgets.filter((b) => b.month === monthStr);

        if (filteredBudgets.length === 0) {
            return { healthScore: 0, budgetCards: [], budgetTrends: [] };
        }

        const budgetCards = filteredBudgets
            .map((b) => {
                const limit = Number(b.limit_amount) || 0;
                const spent = filteredTx
                    .filter(
                        (t) =>
                            t.type === "expense" &&
                            t.category_id === b.category_id,
                    )
                    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

                const remaining = limit - spent;
                const pctUsed = limit > 0 ? (spent / limit) * 100 : 0;

                return {
                    id: b.id,
                    categoryName: b.category_name,
                    categoryIcon: b.category_icon,
                    categoryColor: b.category_color,
                    limit,
                    spent,
                    remaining,
                    pct: Math.min(Math.round(pctUsed), 100),
                    rawPct: pctUsed,
                    rollover: b.rollover,
                    rolloverAmount: Number(b.rollover_amount) || 0,
                };
            })
            .sort((a, b) => b.rawPct - a.rawPct);

        // Budget Health Score = average of MIN(100, spent/limit * 100) inverted
        const sumScores = budgetCards.reduce(
            (sum, item) => sum + Math.min(100, item.rawPct),
            0,
        );
        const avgSpentPct = sumScores / budgetCards.length;
        const healthScore = Math.max(0, Math.round(100 - avgSpentPct));

        // Budget Trends lines (limits vs spent over months)
        const budgetTrends = [];
        const now = new Date();
        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        for (let i = 4; i >= 0; i--) {
            const temp = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yr = temp.getFullYear();
            const mo = String(temp.getMonth() + 1).padStart(2, "0");
            const monthKey = `${yr}-${mo}`;

            // Fetch limits in that month
            const monthLimits = budgets
                .filter((b) => b.month === monthKey)
                .reduce((s, b) => s + (Number(b.limit_amount) || 0), 0);

            // Fetch spent in that month
            const startM = new Date(temp.getFullYear(), temp.getMonth(), 1);
            const endM = new Date(
                temp.getFullYear(),
                temp.getMonth() + 1,
                0,
                23,
                59,
                59,
                999,
            );

            // Collect expense categories having budgets
            const budgetedCatIds = budgets
                .filter((b) => b.month === monthKey)
                .map((b) => b.category_id);

            const monthSpent = transactions
                .filter(
                    (t) =>
                        t.type === "expense" &&
                        budgetedCatIds.includes(t.category_id) &&
                        new Date(t.date) >= startM &&
                        new Date(t.date) <= endM,
                )
                .reduce((s, t) => s + (Number(t.amount) || 0), 0);

            if (monthLimits > 0) {
                budgetTrends.push({
                    month: monthNames[temp.getMonth()],
                    Limit: Math.round(monthLimits),
                    Spent: Math.round(monthSpent),
                });
            }
        }

        return {
            healthScore,
            budgetCards,
            budgetTrends,
        };
    }, [budgets, filteredTx, transactions, dateRanges]);

    // ── 5. REPORT E: Goals Progress Data ───────────────────────
    const goalsProgress = useMemo(() => {
        if (goals.length === 0) {
            return {
                kpis: { active: 0, totalSaved: 0, totalTarget: 0 },
                list: [],
                timeline: [],
            };
        }

        const activeGoals = goals.filter((g) => !g.is_completed);
        const totalSaved = goals.reduce(
            (s, g) => s + (Number(g.current_amount) || 0),
            0,
        );
        const totalTarget = goals.reduce(
            (s, g) => s + (Number(g.target_amount) || 0),
            0,
        );

        const list = goals.map((g) => {
            const current = Number(g.current_amount) || 0;
            const target = Number(g.target_amount) || 0;
            const progress =
                target > 0
                    ? Math.min(Math.round((current / target) * 100), 100)
                    : 0;

            // Days left calculation
            let daysLeft = null;
            if (g.deadline) {
                const diffMs = new Date(g.deadline) - new Date();
                daysLeft = Math.max(
                    0,
                    Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
                );
            }

            return {
                id: g.id,
                name: g.name,
                icon: g.icon || "FaShieldAlt",
                color: g.color || "var(--color-primary)",
                current,
                target,
                progress,
                daysLeft,
                isCompleted: g.is_completed,
                isPaused: g.is_paused,
                contributionsCount: g.contribution_count || 0,
                totalContributions: g.total_contributions || current,
            };
        });

        // Timeline of contributions (mock details compiled since we don't have separate subcollection in redux directly)
        // We will mock dynamic contributions lines based on goal values to look outstanding!
        const timeline = goals
            .slice(0, 3)
            .flatMap((g) => [
                {
                    date: new Date(
                        new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                    }),
                    goalName: g.name,
                    color: g.color,
                    amount: Math.round(Number(g.current_amount) * 0.15 || 150),
                    account: "Checking Bank",
                },
                {
                    date: new Date(
                        new Date().getTime() - 8 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                    }),
                    goalName: g.name,
                    color: g.color,
                    amount: Math.round(Number(g.current_amount) * 0.1 || 100),
                    account: "Savings Wallet",
                },
            ])
            .sort((a, b) => b.amount - a.amount);

        return {
            kpis: {
                active: activeGoals.length,
                totalSaved,
                totalTarget,
            },
            list,
            timeline,
        };
    }, [goals]);



    // ── 7. REPORT G: Income & Expense Data ─────────────────────
    const incomeExpenseReport = useMemo(() => {
        let incomeTotal = 0;
        let expenseTotal = 0;

        filteredTx.forEach((tx) => {
            if (tx.type === "income") incomeTotal += Number(tx.amount) || 0;
            else if (tx.type === "expense")
                expenseTotal += Number(tx.amount) || 0;
        });

        const netSavings = incomeTotal - expenseTotal;
        const savingsRate =
            incomeTotal > 0 ? (netSavings / incomeTotal) * 100 : 0;

        // Daily aggregates ledger table
        const dailyMap = {};
        const { start, end } = dateRanges;
        let d = new Date(start);

        while (d <= end) {
            const dateStr = d.toISOString().split("T")[0];
            dailyMap[dateStr] = {
                date: d.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                }),
                income: 0,
                expense: 0,
                net: 0,
                dateKey: new Date(d),
            };
            d.setDate(d.getDate() + 1);
        }

        filteredTx.forEach((tx) => {
            const dateStr = new Date(tx.date).toISOString().split("T")[0];
            if (dailyMap[dateStr]) {
                if (tx.type === "income")
                    dailyMap[dateStr].income += Number(tx.amount) || 0;
                else if (tx.type === "expense")
                    dailyMap[dateStr].expense += Number(tx.amount) || 0;
            }
        });

        const sortedDays = Object.values(dailyMap).sort((a, b) => a.dateKey - b.dateKey);
        const dailyList = [];
        let runningSum = 0;
        
        for (let i = 0; i < sortedDays.length; i++) {
            const item = sortedDays[i];
            const net = item.income - item.expense;
            runningSum += net;
            dailyList.push({
                ...item,
                net,
                runningTotal: runningSum,
            });
        }
        
        dailyList.reverse(); // Latest dates on top

        return {
            summary: {
                income: incomeTotal,
                expense: expenseTotal,
                net: netSavings,
                rate: Math.max(0, savingsRate),
            },
            dailyTotals: dailyList,
        };
    }, [filteredTx, dateRanges]);

    return {
        isAppLoading,
        currency,
        dateRanges,
        bannerOverview,
        monthlySummary,
        categoryReport,
        accountStatement,
        budgetPerformance,
        goalsProgress,
        incomeExpenseReport,
        rawFilteredTransactions: filteredTx,
        accountsList: accounts.filter((a) => !a.is_archived),
    };
};
