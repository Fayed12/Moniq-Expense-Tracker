// local
import styles from "./IncomeExpenseReport.module.css";

// react icons
import {
    FiTrendingUp,
    FiTrendingDown,
    FiPercent,
    FiInbox,
} from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";

// recharts imports
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function IncomeExpenseReport({ data, currency }) {
    const { summary, dailyTotals } = data;

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    // Calculate benchmark text for savings rate
    let savingsRateLabel = "🔴 Low savings rate";
    let savingsRateColor = "var(--color-danger)";
    if (summary.rate >= 20) {
        savingsRateLabel = "🎯 Great savings habit";
        savingsRateColor = "var(--color-success)";
    } else if (summary.rate >= 10) {
        savingsRateLabel = "⚠️ Room to improve";
        savingsRateColor = "var(--color-warning)";
    }

    return (
        <div className={styles.reportWrapper}>
            {/* Section G1 — Summary KPI Strip */}
            <div className={styles.summaryStrip}>
                <div
                    className={styles.stripItem}
                    style={{ "--accent": "var(--color-income)" }}
                >
                    <div className={styles.stripMeta}>
                        <FiTrendingUp className={styles.incomeIcon} size={16} />
                        <span className={styles.stripLabel}>Total Income</span>
                    </div>
                    <span className={styles.stripVal}>
                        {formatMoney(summary.income)}
                    </span>
                </div>
                <div className={styles.stripDivider} />

                <div
                    className={styles.stripItem}
                    style={{ "--accent": "var(--color-expense)" }}
                >
                    <div className={styles.stripMeta}>
                        <FiTrendingDown
                            className={styles.expenseIcon}
                            size={16}
                        />
                        <span className={styles.stripLabel}>
                            Total Expenses
                        </span>
                    </div>
                    <span className={styles.stripVal}>
                        {formatMoney(summary.expense)}
                    </span>
                </div>
                <div className={styles.stripDivider} />

                <div
                    className={styles.stripItem}
                    style={{ "--accent": "var(--color-transfer)" }}
                >
                    <div className={styles.stripMeta}>
                        <FaScaleBalanced
                            className={styles.violetIcon}
                            size={14}
                        />
                        <span className={styles.stripLabel}>Net Savings</span>
                    </div>
                    <span
                        className={`${styles.stripVal} ${summary.net >= 0 ? styles.positiveText : styles.negativeText}`}
                    >
                        {formatMoney(summary.net)}
                    </span>
                </div>
                <div className={styles.stripDivider} />

                <div
                    className={styles.stripItem}
                    style={{ "--accent": savingsRateColor }}
                >
                    <div className={styles.stripMeta}>
                        <FiPercent className={styles.percentIcon} size={14} />
                        <span className={styles.stripLabel}>Savings Rate</span>
                    </div>
                    <div className={styles.rateBlock}>
                        <span className={styles.stripVal}>
                            {summary.rate.toFixed(1)}%
                        </span>
                        <span
                            className={styles.rateStatus}
                            style={{ color: savingsRateColor }}
                        >
                            {savingsRateLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Recharts chart showing Daily net savings flow */}
            <div className={`${styles.sectionCard} glass-card`}>
                <h3 className={styles.sectionTitle}>
                    Daily Cash Flow Cumulative Trend
                </h3>
                <p className={styles.sectionSubtitle}>
                    Shows the chronological cumulative running savings balance
                    over time
                </p>

                <div className={styles.chartWrapper}>
                    {dailyTotals.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            {/* Reverse to show chronological left-to-right path in chart */}
                            <AreaChart
                                data={[...dailyTotals].reverse()}
                                margin={{
                                    top: 20,
                                    right: 10,
                                    left: -10,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="netSavingsGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-transfer)"
                                            stopOpacity={0.15}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-transfer)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--color-border-subtle)"
                                />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "var(--color-text-secondary)",
                                        fontSize: 11,
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "var(--color-text-secondary)",
                                        fontSize: 11,
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--color-bg-elevated)",
                                        borderColor:
                                            "var(--color-border-strong)",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        boxShadow: "var(--shadow-md)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    name="Running Net Savings"
                                    dataKey="runningTotal"
                                    stroke="var(--color-transfer)"
                                    strokeWidth={2}
                                    fill="url(#netSavingsGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyChartState}>
                            <p className={styles.emptyText}>
                                No cash flow events to trace
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Section G4 — Daily Totals Ledger Table */}
            <div className={`${styles.sectionCard} glass-card`}>
                <h3 className={styles.sectionTitle}>Daily Net Aggregates</h3>
                <p className={styles.sectionSubtitle}>
                    Summarized transactional income, expenses, and net change
                    per calendar day (latest on top)
                </p>

                <div className={styles.tableWrapper}>
                    {dailyTotals.length > 0 ? (
                        <table className={styles.dailyTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th className={styles.rightAlign}>
                                        Daily Income
                                    </th>
                                    <th className={styles.rightAlign}>
                                        Daily Expense
                                    </th>
                                    <th className={styles.rightAlign}>
                                        Net Change
                                    </th>
                                    <th className={styles.rightAlign}>
                                        Running Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyTotals.map((row, idx) => {
                                    const hasFlow =
                                        row.income > 0 || row.expense > 0;
                                    return (
                                        <tr
                                            key={idx}
                                            className={
                                                hasFlow ? "" : styles.idleRow
                                            }
                                        >
                                            <td className={styles.boldText}>
                                                {row.date}
                                            </td>
                                            <td
                                                className={`${styles.rightAlign} ${styles.mono} ${row.income > 0 ? styles.positiveText : ""}`}
                                            >
                                                {row.income > 0
                                                    ? `+${formatMoney(row.income)}`
                                                    : "—"}
                                            </td>
                                            <td
                                                className={`${styles.rightAlign} ${styles.mono} ${row.expense > 0 ? styles.negativeText : ""}`}
                                            >
                                                {row.expense > 0
                                                    ? `-${formatMoney(row.expense)}`
                                                    : "—"}
                                            </td>
                                            <td
                                                className={`${styles.rightAlign} ${styles.mono} ${row.net > 0 ? styles.positiveText : row.net < 0 ? styles.negativeText : ""}`}
                                            >
                                                {row.net > 0
                                                    ? `+${formatMoney(row.net)}`
                                                    : row.net < 0
                                                      ? `-${formatMoney(Math.abs(row.net))}`
                                                      : "—"}
                                            </td>
                                            <td
                                                className={`${styles.rightAlign} ${styles.mono} ${styles.boldText}`}
                                            >
                                                {formatMoney(row.runningTotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyTableState}>
                            <FiInbox size={24} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>
                                No cash flow events to display
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
