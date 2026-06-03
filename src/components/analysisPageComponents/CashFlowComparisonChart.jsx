// local
import styles from "./CashFlowComparisonChart.module.css";

// react
import { useState } from "react";

// recharts
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area,
} from "recharts";

// react icons
import { FiBarChart2, FiActivity } from "react-icons/fi";

// Premium custom tooltip component
const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        const income = payload.find((p) => p.name === "Income")?.value || 0;
        const expense = payload.find((p) => p.name === "Expense")?.value || 0;
        const net = income - expense;

        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <div className={styles.tooltipRow} style={{ "--bullet-color": "var(--color-income)" }}>
                    <span className={styles.tooltipDot} />
                    <span className={styles.tooltipName}>Income:</span>
                    <span className={styles.tooltipVal}>{currency} {income.toLocaleString()}</span>
                </div>
                <div className={styles.tooltipRow} style={{ "--bullet-color": "var(--color-expense)" }}>
                    <span className={styles.tooltipDot} />
                    <span className={styles.tooltipName}>Expense:</span>
                    <span className={styles.tooltipVal}>{currency} {expense.toLocaleString()}</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.tooltipRow} style={{ "--bullet-color": net >= 0 ? "var(--color-income)" : "var(--color-expense)" }}>
                    <span className={styles.tooltipDot} />
                    <span className={styles.tooltipName}>Savings:</span>
                    <span className={`${styles.tooltipVal} ${net >= 0 ? styles.positiveText : styles.negativeText}`}>
                        {currency} {net.toLocaleString()}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export default function CashFlowComparisonChart({ data, currency }) {
    const [chartType, setChartType] = useState("bar"); // "bar" | "line"

    return (
        <article className={`${styles.chartCard} glass-card`} data-anim="charts-row">
            <div className={styles.chartHeader}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.chartTitle}>Income vs Expenses</h2>
                    <p className={styles.chartSubtitle}>Cash flow pattern over the selected period</p>
                </div>
                <div className={styles.toggleGroup} role="group" aria-label="Toggle chart type">
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${chartType === "bar" ? styles.activeToggle : ""}`}
                        onClick={() => setChartType("bar")}
                        aria-label="Show Bar Chart"
                    >
                        <FiBarChart2 size={16} />
                        <span>Bar</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${chartType === "line" ? styles.activeToggle : ""}`}
                        onClick={() => setChartType("line")}
                        aria-label="Show Line Chart"
                    >
                        <FiActivity size={16} />
                        <span>Line</span>
                    </button>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                                <XAxis
                                    dataKey="period"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                                />
                                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: "rgba(160, 82, 45, 0.05)" }} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconSize={8}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: 11, paddingBottom: 15 }}
                                />
                                <Bar
                                    name="Income"
                                    dataKey="Income"
                                    fill="var(--color-income)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={30}
                                />
                                <Bar
                                    name="Expense"
                                    dataKey="Expense"
                                    fill="var(--color-expense)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={30}
                                />
                            </BarChart>
                        ) : (
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                                <XAxis
                                    dataKey="period"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                                />
                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconSize={8}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: 11, paddingBottom: 15 }}
                                />
                                <Area
                                    name="Income"
                                    type="monotone"
                                    dataKey="Income"
                                    stroke="var(--color-income)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#incomeGrad)"
                                />
                                <Area
                                    name="Expense"
                                    type="monotone"
                                    dataKey="Expense"
                                    stroke="var(--color-expense)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#expenseGrad)"
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>No data available for this range</p>
                    </div>
                )}
            </div>
        </article>
    );
}
