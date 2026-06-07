// react
import { useMemo } from "react";

// react-redux
import { useSelector } from "react-redux";

const EMPTY_ARRAY = [];

export const useAnalysisPageData = (selectedPeriod = "this-month", customRange = { from: null, to: null }, selectedAccountIds = EMPTY_ARRAY) => {
    // ── Raw Redux Selectors ──────────────────────────────────
    const accounts = useSelector((s) => s.accounts.items) || EMPTY_ARRAY;
    const transactions = useSelector((s) => s.transactions.items) || EMPTY_ARRAY;
    const profile = useSelector((s) => s.auth.profile) || null;

    const isLoadingAccounts = useSelector((s) => s.accounts.loading);
    const isLoadingTransactions = useSelector((s) => s.transactions.loading);
    const isLoadingCategories = useSelector((s) => s.categories.loading);

    const isAppLoading = isLoadingAccounts || isLoadingTransactions || isLoadingCategories;

    // ── Currency Resolution ──────────────────────────────────
    const currency = useMemo(() => {
        return profile?.currency || (accounts.length > 0 ? accounts[0].currency : "EGP");
    }, [accounts, profile]);

    // ── Date Range and Comparison Ranges Calculation ──────────
    const dateRanges = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let start, end;
        let prevStart, prevEnd;

        switch (selectedPeriod) {
            case "this-week": {
                // Monday of current week
                const day = today.getDay();
                const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
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
                // Last 90 days ending end of today
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);

                prevEnd = new Date(start.getTime() - 1);
                prevStart = new Date(prevEnd.getTime() - 90 * 24 * 60 * 60 * 1000);
                prevStart.setHours(0, 0, 0, 0);
                break;
            }

            case "last-6-months": {
                // Last 180 days ending end of today
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                start = new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);

                prevEnd = new Date(start.getTime() - 1);
                prevStart = new Date(prevEnd.getTime() - 180 * 24 * 60 * 60 * 1000);
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
                start = customRange.from ? new Date(customRange.from) : new Date(today);
                start.setHours(0, 0, 0, 0);

                end = customRange.to ? new Date(customRange.to) : new Date(today);
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

    // ── Current Period Filtered Transactions ──────────────────
    const { filteredTx, prevFilteredTx } = useMemo(() => {
        const { start, end, prevStart, prevEnd } = dateRanges;

        const matchesAccount = (tx) => {
            if (selectedAccountIds.length === 0) return true;
            return selectedAccountIds.includes(tx.account_id);
        };

        const current = [];
        const previous = [];

        transactions.forEach((tx) => {
            const txDate = new Date(tx.date);
            if (matchesAccount(tx)) {
                if (txDate >= start && txDate <= end) {
                    current.push(tx);
                } else if (txDate >= prevStart && txDate <= prevEnd) {
                    previous.push(tx);
                }
            }
        });

        return { filteredTx: current, prevFilteredTx: previous };
    }, [transactions, dateRanges, selectedAccountIds]);

    // ── SECTION 2: KPI Metrics Calculation ──────────────────
    const kpis = useMemo(() => {
        let currentIncome = 0;
        let currentExpense = 0;
        let prevIncome = 0;
        let prevExpense = 0;

        filteredTx.forEach((tx) => {
            if (tx.type === "income") currentIncome += Number(tx.amount) || 0;
            else if (tx.type === "expense") currentExpense += Number(tx.amount) || 0;
        });

        prevFilteredTx.forEach((tx) => {
            if (tx.type === "income") prevIncome += Number(tx.amount) || 0;
            else if (tx.type === "expense") prevExpense += Number(tx.amount) || 0;
        });

        const currentNet = currentIncome - currentExpense;
        const prevNet = prevIncome - prevExpense;

        // Savings rates
        const currentSavingsRate = currentIncome > 0 ? (currentNet / currentIncome) * 100 : 0;
        const prevSavingsRate = prevIncome > 0 ? (prevNet / prevIncome) * 100 : 0;

        // Percentage changes helper
        const getPctChange = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        const incomeTrend = getPctChange(currentIncome, prevIncome).toFixed(1);
        // Note: For expenses, decreasing is a positive trend
        const expenseTrend = getPctChange(currentExpense, prevExpense).toFixed(1);
        const netTrend = getPctChange(currentNet, prevNet).toFixed(1);
        const savingsRateTrend = (currentSavingsRate - prevSavingsRate).toFixed(1);

        // Savings habit recommendation
        let savingsRateBenchmark = "🔴 Low savings rate";
        if (currentSavingsRate >= 20) {
            savingsRateBenchmark = "🎯 Great savings habit";
        } else if (currentSavingsRate >= 10) {
            savingsRateBenchmark = "⚠️ Room to improve";
        }

        return {
            income: {
                value: currentIncome,
                trend: incomeTrend,
                isPositive: Number(incomeTrend) >= 0,
            },
            expense: {
                value: currentExpense,
                trend: expenseTrend,
                isPositive: Number(expenseTrend) <= 0, // decrease is good
            },
            net: {
                value: currentNet,
                trend: netTrend,
                isPositive: currentNet >= prevNet,
            },
            savingsRate: {
                value: Math.max(0, currentSavingsRate), // display rate >= 0
                trend: savingsRateTrend,
                isPositive: currentSavingsRate >= prevSavingsRate,
                benchmark: savingsRateBenchmark,
            },
        };
    }, [filteredTx, prevFilteredTx]);

    // ── SECTION 3: Income vs Expenses Chart Data ──────────────────
    const cashFlowData = useMemo(() => {
        const { start, end } = dateRanges;
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // 1. Weekly grouping (default for months)
        if (selectedPeriod === "this-month" || selectedPeriod === "last-month" || (diffDays > 7 && diffDays <= 31)) {
            const weeks = [];
            let weekStart = new Date(start);
            let weekIndex = 1;

            while (weekStart <= end) {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                const wEndBounded = weekEnd > end ? new Date(end) : weekEnd;

                weeks.push({
                    label: `Week ${weekIndex}`,
                    start: new Date(weekStart),
                    end: wEndBounded,
                    income: 0,
                    expense: 0,
                });

                weekStart.setDate(weekStart.getDate() + 7);
                weekIndex++;
            }

            filteredTx.forEach((tx) => {
                const txDate = new Date(tx.date);
                const week = weeks.find((w) => txDate >= w.start && txDate <= w.end);
                if (week) {
                    if (tx.type === "income") week.income += Number(tx.amount) || 0;
                    if (tx.type === "expense") week.expense += Number(tx.amount) || 0;
                }
            });

            return weeks.map((w) => ({
                period: w.label,
                Income: Math.round(w.income),
                Expense: Math.round(w.expense),
                Net: Math.round(w.income - w.expense),
            }));
        }

        // 2. Daily grouping (for single week or small range)
        if (selectedPeriod === "this-week" || diffDays <= 7) {
            const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const days = [];
            let d = new Date(start);

            while (d <= end) {
                days.push({
                    dateStr: d.toDateString(),
                    label: dayLabels[d.getDay()],
                    dateObj: new Date(d),
                    income: 0,
                    expense: 0,
                });
                d.setDate(d.getDate() + 1);
            }

            filteredTx.forEach((tx) => {
                const txDate = new Date(tx.date).toDateString();
                const day = days.find((day) => day.dateStr === txDate);
                if (day) {
                    if (tx.type === "income") day.income += Number(tx.amount) || 0;
                    if (tx.type === "expense") day.expense += Number(tx.amount) || 0;
                }
            });

            return days.map((day) => ({
                period: day.label,
                Income: Math.round(day.income),
                Expense: Math.round(day.expense),
                Net: Math.round(day.income - day.expense),
            }));
        }

        // 3. Monthly grouping (for this year or long ranges)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const months = {};

        // Seed active months in range
        let mDate = new Date(start);
        while (mDate <= end) {
            const key = `${mDate.getFullYear()}-${mDate.getMonth()}`;
            if (!months[key]) {
                months[key] = {
                    label: `${monthNames[mDate.getMonth()]} ${String(mDate.getFullYear()).slice(-2)}`,
                    income: 0,
                    expense: 0,
                    sortKey: mDate.getFullYear() * 100 + mDate.getMonth(),
                };
            }
            mDate.setMonth(mDate.getMonth() + 1);
        }

        filteredTx.forEach((tx) => {
            const txDate = new Date(tx.date);
            const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
            if (months[key]) {
                if (tx.type === "income") months[key].income += Number(tx.amount) || 0;
                if (tx.type === "expense") months[key].expense += Number(tx.amount) || 0;
            }
        });

        return Object.values(months)
            .sort((a, b) => a.sortKey - b.sortKey)
            .map((m) => ({
                period: m.label,
                Income: Math.round(m.income),
                Expense: Math.round(m.expense),
                Net: Math.round(m.income - m.expense),
            }));
    }, [filteredTx, dateRanges, selectedPeriod]);

    // ── SECTION 4: Category Breakdown Donut Data ──────────────────
    const categoryBreakdown = useMemo(() => {
        const getBreakdown = (type = "expense") => {
            const txs = filteredTx.filter((t) => t.type === type);
            const totalSum = txs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

            const groups = {};
            txs.forEach((tx) => {
                const name = tx.category_name || "Other";
                if (!groups[name]) {
                    groups[name] = {
                        name,
                        value: 0,
                        color: tx.category_color || "#9E9E9E",
                        icon: tx.category_icon || "FaEllipsisH",
                        txCount: 0,
                    };
                }
                groups[name].value += Number(tx.amount) || 0;
                groups[name].txCount += 1;
            });

            const sorted = Object.values(groups).sort((a, b) => b.value - a.value);

            // Calculate percentage
            const breakdown = sorted.map((g) => ({
                ...g,
                value: Math.round(g.value),
                percentage: totalSum > 0 ? Number(((g.value / totalSum) * 100).toFixed(1)) : 0,
            }));

            return { items: breakdown, total: Math.round(totalSum) };
        };

        return {
            expense: getBreakdown("expense"),
            income: getBreakdown("income"),
        };
    }, [filteredTx]);

    // ── SECTION 4: Ranked Categories List (Top Spending) ──────────────────
    const rankedCategories = useMemo(() => {
        const expenseItems = [...categoryBreakdown.expense.items];
        const maxVal = expenseItems.length > 0 ? Math.max(...expenseItems.map((e) => e.value)) : 1;

        return expenseItems.slice(0, 6).map((item, index) => ({
            ...item,
            rank: String(index + 1).padStart(2, "0"),
            progressPercent: Math.round((item.value / maxVal) * 100),
        }));
    }, [categoryBreakdown]);

    // ── SECTION 5: Daily Spending Heatmap Data ──────────────────
    const dailyHeatmap = useMemo(() => {
        const { start, end } = dateRanges;
        const expenseTx = filteredTx.filter((t) => t.type === "expense");

        const daysMap = {};
        let d = new Date(start);
        while (d <= end) {
            const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
            daysMap[dateStr] = {
                dateStr,
                dateObj: new Date(d),
                amount: 0,
                count: 0,
            };
            d.setDate(d.getDate() + 1);
        }

        expenseTx.forEach((tx) => {
            const dateStr = new Date(tx.date).toISOString().split("T")[0];
            if (daysMap[dateStr]) {
                daysMap[dateStr].amount += Number(tx.amount) || 0;
                daysMap[dateStr].count += 1;
            }
        });

        const dayList = Object.values(daysMap);
        const maxSpend = dayList.length > 0 ? Math.max(...dayList.map((x) => x.amount)) : 1;

        // Assign levels (0-4 intensity)
        const cellData = dayList.map((day) => {
            let intensity = 0;
            if (day.amount > 0) {
                const ratio = day.amount / maxSpend;
                if (ratio > 0.75) intensity = 4;
                else if (ratio > 0.5) intensity = 3;
                else if (ratio > 0.25) intensity = 2;
                else intensity = 1;
            }
            return {
                ...day,
                amount: Math.round(day.amount),
                intensity,
            };
        });

        // Highlights calculation
        const sortedSpend = [...dayList].sort((a, b) => b.amount - a.amount);
        const mostExpensiveCell = sortedSpend[0]?.amount > 0 ? sortedSpend[0] : null;

        const totalDays = dayList.length || 1;
        const totalSpent = cellData.reduce((sum, item) => sum + item.amount, 0);
        const avgDailySpending = Math.round(totalSpent / totalDays);

        const mostExpensiveDay = mostExpensiveCell ? {
            amount: Math.round(mostExpensiveCell.amount),
            dateStr: mostExpensiveCell.dateObj.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            txCount: mostExpensiveCell.count,
        } : null;

        return {
            cells: cellData,
            mostExpensiveDay,
            avgDailySpending,
        };
    }, [filteredTx, dateRanges]);

    // ── SECTION 6: Income Sources Breakdown (Horizontal Bar Chart) ──────
    const incomeSources = useMemo(() => {
        return categoryBreakdown.income.items.slice(0, 5);
    }, [categoryBreakdown]);

    // ── SECTION 6: Spending Pattern by Time of Day ──────────────────
    const spendingTimePattern = useMemo(() => {
        const expenseTx = filteredTx.filter((t) => t.type === "expense");
        const totalExpenses = expenseTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const totalCount = expenseTx.length || 1;

        const buckets = {
            Morning: { label: "Morning (6am–12pm)", startHour: 6, endHour: 12, amount: 0, count: 0 },
            Afternoon: { label: "Afternoon (12pm–6pm)", startHour: 12, endHour: 18, amount: 0, count: 0 },
            Evening: { label: "Evening (6pm–10pm)", startHour: 18, endHour: 22, amount: 0, count: 0 },
            Night: { label: "Night (10pm–6am)", startHour: 22, endHour: 6, amount: 0, count: 0 },
        };

        expenseTx.forEach((tx) => {
            const hour = new Date(tx.date).getHours();
            const amount = Number(tx.amount) || 0;

            if (hour >= 6 && hour < 12) {
                buckets.Morning.amount += amount;
                buckets.Morning.count += 1;
            } else if (hour >= 12 && hour < 18) {
                buckets.Afternoon.amount += amount;
                buckets.Afternoon.count += 1;
            } else if (hour >= 18 && hour < 22) {
                buckets.Evening.amount += amount;
                buckets.Evening.count += 1;
            } else {
                buckets.Night.amount += amount;
                buckets.Night.count += 1;
            }
        });

        return Object.values(buckets).map((b) => ({
            label: b.label,
            amount: Math.round(b.amount),
            count: b.count,
            percentAmount: totalExpenses > 0 ? Math.round((b.amount / totalExpenses) * 100) : 0,
            percentCount: Math.round((b.count / totalCount) * 100),
            avgAmount: b.count > 0 ? Math.round(b.amount / b.count) : 0,
        }));
    }, [filteredTx]);

    // ── SECTION 7: Account Performance ──────────────────
    const accountPerformance = useMemo(() => {
        const { start, end } = dateRanges;

        // Filter accounts to active ones
        const activeAccounts = accounts.filter((a) => !a.is_archived);

        return activeAccounts.map((a) => {
            // Filter transactions for this account in this period
            const accTx = filteredTx.filter((t) => t.account_id === a.id);
            const periodIncome = accTx.filter((t) => t.type === "income").reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const periodExpense = accTx.filter((t) => t.type === "expense").reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const netChange = periodIncome - periodExpense;

            // Compute sparkline daily balance trend
            const sparklinePoints = [];

            // In order to plot cumulative daily change, first map all transactions for this account sorted DESC
            const sortedAccTx = [...transactions]
                .filter((t) => t.account_id === a.id)
                .sort((x, y) => new Date(y.date) - new Date(x.date));

            // Create steps of day balances
            const daysInPeriod = [];
            let runnerDate = new Date(start);
            while (runnerDate <= end) {
                daysInPeriod.push(new Date(runnerDate));
                runnerDate.setDate(runnerDate.getDate() + 1);
            }

            // Group all account txs outside this period to compute opening balance relative to today
            // We want to find daily closing balances for each day inside the period.
            // A precise and simple sparkline is to step through the days in period and aggregate cumulative net change.
            let openingBalance = Number(a.balance) || 0;

            // Subtract all net changes from now to the start of the period to get opening balance
            sortedAccTx.forEach((tx) => {
                const txDate = new Date(tx.date);
                if (txDate > start) {
                    // Reverse the effect
                    if (tx.type === "income") openingBalance -= Number(tx.amount) || 0;
                    else if (tx.type === "expense") openingBalance += Number(tx.amount) || 0;
                }
            });

            let running = openingBalance;
            daysInPeriod.forEach((day) => {
                const dateStr = day.toDateString();
                const dayTxs = accTx.filter((t) => new Date(t.date).toDateString() === dateStr);

                dayTxs.forEach((tx) => {
                    if (tx.type === "income") running += Number(tx.amount) || 0;
                    else if (tx.type === "expense") running -= Number(tx.amount) || 0;
                });

                sparklinePoints.push(Math.round(running));
            });

            return {
                id: a.id,
                name: a.name,
                type: a.type,
                color: a.color,
                icon: a.icon,
                currentBalance: Number(a.balance) || 0,
                income: Math.round(periodIncome),
                expense: Math.round(periodExpense),
                netChange: Math.round(netChange),
                txCount: accTx.length,
                sparklinePoints, // Array of balance numbers
            };
        });
    }, [accounts, filteredTx, transactions, dateRanges]);

    // ── SECTION 8: Transaction Tags Analysis ──────────────────
    const tagAnalysis = useMemo(() => {
        const tagMap = {};

        filteredTx.forEach((tx) => {
            const amount = Number(tx.amount) || 0;
            if (tx.tags && Array.isArray(tx.tags)) {
                tx.tags.forEach((tag) => {
                    const tagKey = tag.toLowerCase().trim();
                    if (!tagMap[tagKey]) {
                        tagMap[tagKey] = {
                            name: tagKey,
                            count: 0,
                            amount: 0,
                            expenseTotal: 0,
                        };
                    }
                    tagMap[tagKey].count += 1;
                    tagMap[tagKey].amount += amount;
                    if (tx.type === "expense") {
                        tagMap[tagKey].expenseTotal += amount;
                    }
                });
            }
        });

        return Object.values(tagMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((tag) => ({
                ...tag,
                amount: Math.round(tag.amount),
                isMostlyExpense: tag.expenseTotal > (tag.amount - tag.expenseTotal),
            }));
    }, [filteredTx]);

    // ── SECTION 8: Period Highlights ──────────────────
    const periodHighlights = useMemo(() => {
        const expenseTxs = filteredTx.filter((t) => t.type === "expense");
        const incomeTxs = filteredTx.filter((t) => t.type === "income");

        const largestExpense = expenseTxs.length > 0 
            ? [...expenseTxs].sort((a, b) => Number(b.amount) - Number(a.amount))[0] 
            : null;

        const largestIncome = incomeTxs.length > 0 
            ? [...incomeTxs].sort((a, b) => Number(b.amount) - Number(a.amount))[0] 
            : null;

        // Most active weekday
        const weekdayCounts = Array(7).fill(0);
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        filteredTx.forEach((tx) => {
            const day = new Date(tx.date).getDay();
            weekdayCounts[day] += 1;
        });

        let maxDayIndex = 0;
        let maxCount = 0;
        weekdayCounts.forEach((count, i) => {
            if (count > maxCount) {
                maxCount = count;
                maxDayIndex = i;
            }
        });

        const totalSpent = expenseTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const avgExpenseAmt = expenseTxs.length > 0 ? Math.round(totalSpent / expenseTxs.length) : 0;

        const totalEarned = incomeTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const avgIncomeAmt = incomeTxs.length > 0 ? Math.round(totalEarned / incomeTxs.length) : 0;

        return {
            largestExpense: largestExpense ? {
                title: largestExpense.title,
                amount: Math.round(largestExpense.amount),
                dateStr: new Date(largestExpense.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            } : null,
            largestIncome: largestIncome ? {
                title: largestIncome.title,
                amount: Math.round(largestIncome.amount),
                dateStr: new Date(largestIncome.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            } : null,
            mostActiveDay: maxCount > 0 ? {
                name: dayNames[maxDayIndex],
                count: maxCount,
            } : null,
            avgExpense: avgExpenseAmt,
            avgIncome: avgIncomeAmt,
        };
    }, [filteredTx]);

    return {
        isAppLoading,
        currency,
        dateRanges,
        kpis,
        cashFlowData,
        categoryBreakdown,
        rankedCategories,
        dailyHeatmap,
        incomeSources,
        spendingTimePattern,
        accountPerformance,
        tagAnalysis,
        periodHighlights,
        accountsList: accounts.filter((a) => !a.is_archived),
    };
};
