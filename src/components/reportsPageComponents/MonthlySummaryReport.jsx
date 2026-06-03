// local
import styles from "./MonthlySummaryReport.module.css";

// react
import { useState } from "react";

// react icons
import { FiArrowUpRight, FiArrowDownRight, FiInbox } from "react-icons/fi";

// recharts
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Dynamic Icon rendering helper
import { FaEllipsisH } from "react-icons/fa";
import {
    FaWallet,
    FaShoppingBag,
    FaUtensils,
    FaCar,
    FaHome,
    FaHeartbeat,
    FaFilm,
    FaBook,
    FaPlane,
    FaBolt,
    FaSpa,
    FaGift,
    FaBriefcase,
    FaLaptopCode,
    FaChartLine,
    FaPlusCircle,
    FaUniversity,
    FaMoneyBillWave,
    FaCreditCard,
    FaFlag,
    FaShieldAlt,
    FaLaptop,
} from "react-icons/fa";
import { FaScaleBalanced } from "react-icons/fa6";

const ICON_MAP = {
    FaWallet,
    FaShoppingBag,
    FaUtensils,
    FaCar,
    FaHome,
    FaHeartbeat,
    FaFilm,
    FaBook,
    FaPlane,
    FaBolt,
    FaSpa,
    FaGift,
    FaBriefcase,
    FaLaptopCode,
    FaChartLine,
    FaPlusCircle,
    FaUniversity,
    FaMoneyBillWave,
    FaCreditCard,
    FaFlag,
    FaShieldAlt,
    FaLaptop,
    FaEllipsisH,
};

function DynamicIcon({ name, size = 14, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

export default function MonthlySummaryReport({ data, currency }) {
    const {
        income,
        expense,
        net,
        budgetAdherence,
        topTransactions,
        miniTrendData,
    } = data;
    const [txTypeFilter, setTxTypeFilter] = useState("expense"); // "expense" | "income"

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    const filteredTxList = [...topTransactions]
        .filter((t) => t.type === txTypeFilter)
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10);

    return (
        <div className={styles.reportWrapper}>
            {/* Section A1 — Executive Summary Cards */}
            <div className={styles.executiveRow}>
                {/* Income */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-income)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Total Income</span>
                        <div className={`${styles.iconBg} ${styles.greenBg}`}>
                            <FiArrowUpRight
                                className={styles.greenIcon}
                                size={18}
                            />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {formatMoney(income.value)}
                    </p>
                    <div className={styles.trendRow}>
                        <span
                            className={`${styles.trendBadge} ${income.isPositive ? styles.trendUp : styles.trendDown}`}
                        >
                            {income.isPositive ? "▲" : "▼"}{" "}
                            {Math.abs(income.trend)}%
                        </span>
                        <span className={styles.subtext}>vs last period</span>
                    </div>
                </div>

                {/* Expense */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-expense)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Total Expenses</span>
                        <div className={`${styles.iconBg} ${styles.redBg}`}>
                            <FiArrowDownRight
                                className={styles.redIcon}
                                size={18}
                            />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {formatMoney(expense.value)}
                    </p>
                    <div className={styles.trendRow}>
                        <span
                            className={`${styles.trendBadge} ${expense.isPositive ? styles.trendUp : styles.trendDown}`}
                        >
                            {expense.isPositive ? "▼" : "▲"}{" "}
                            {Math.abs(expense.trend)}%
                        </span>
                        <span className={styles.subtext}>vs last period</span>
                    </div>
                </div>

                {/* Net Savings */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-transfer)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Net Savings</span>
                        <div className={`${styles.iconBg} ${styles.violetBg}`}>
                            <FaScaleBalanced
                                className={styles.violetIcon}
                                size={16}
                            />
                        </div>
                    </div>
                    <p
                        className={`${styles.cardVal} ${net.value >= 0 ? styles.positiveText : styles.negativeText}`}
                    >
                        {formatMoney(net.value)}
                    </p>
                    <div className={styles.trendRow}>
                        <span
                            className={`${styles.trendBadge} ${net.isPositive ? styles.trendUp : styles.trendDown}`}
                        >
                            {net.isPositive ? "▲" : "▼"} {Math.abs(net.trend)}%
                        </span>
                        <span className={styles.subtext}>
                            Income − Expenses
                        </span>
                    </div>
                </div>
            </div>

            {/* Section A2 — Budget Adherence Table */}
            <div className={`${styles.sectionCard} glass-card`}>
                <h3 className={styles.sectionTitle}>
                    Budget Adherence — Summary
                </h3>
                <div className={styles.tableWrapper}>
                    {budgetAdherence.length > 0 ? (
                        <table className={styles.reportTable}>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Limit</th>
                                    <th>Spent</th>
                                    <th>Remaining</th>
                                    <th>% Used</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetAdherence.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <div className={styles.catGroup}>
                                                <div
                                                    className={
                                                        styles.iconBgWrap
                                                    }
                                                    style={{
                                                        backgroundColor: `${row.categoryColor}15`,
                                                        color: row.categoryColor,
                                                    }}
                                                >
                                                    <DynamicIcon
                                                        name={row.categoryIcon}
                                                        size={14}
                                                    />
                                                </div>
                                                <span
                                                    className={styles.catName}
                                                >
                                                    {row.categoryName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={styles.mono}>
                                            {formatMoney(row.limit)}
                                        </td>
                                        <td className={styles.mono}>
                                            {formatMoney(row.spent)}
                                        </td>
                                        <td
                                            className={`${styles.mono} ${row.remaining >= 0 ? styles.positiveText : styles.negativeText}`}
                                        >
                                            {row.remaining < 0 ? "-" : ""}
                                            {formatMoney(
                                                Math.abs(row.remaining),
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.progressCol}>
                                                <div
                                                    className={
                                                        styles.progressTrack
                                                    }
                                                >
                                                    <div
                                                        className={`${styles.progressBar} ${row.pctUsed > 100 ? styles.barDanger : row.pctUsed > 70 ? styles.barWarning : styles.barSuccess}`}
                                                        style={{
                                                            width: `${Math.min(row.pctUsed, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={
                                                        styles.progressText
                                                    }
                                                >
                                                    {row.pctUsed}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.statusBadge} ${
                                                    row.pctUsed > 100
                                                        ? styles.badgeDanger
                                                        : row.pctUsed > 70
                                                          ? styles.badgeWarning
                                                          : styles.badgeSuccess
                                                }`}
                                            >
                                                {row.pctUsed > 100
                                                    ? "Over Budget"
                                                    : row.pctUsed > 70
                                                      ? "On Track"
                                                      : "Under Budget"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyTableState}>
                            <p className={styles.emptyText}>
                                No active budgets for this period
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row split: Top Transactions & 6-Month cashflow sparks */}
            <div className={styles.splitRow}>
                {/* Left Card: Largest Transactions */}
                <div className={`${styles.splitCard} glass-card`}>
                    <div className={styles.splitHeader}>
                        <h3 className={styles.sectionTitle}>
                            Largest Transactions
                        </h3>
                        <div className={styles.togglePills}>
                            <button
                                type="button"
                                className={`${styles.togglePill} ${txTypeFilter === "expense" ? styles.activePill : ""}`}
                                onClick={() => setTxTypeFilter("expense")}
                            >
                                Expenses
                            </button>
                            <button
                                type="button"
                                className={`${styles.togglePill} ${txTypeFilter === "income" ? styles.activePill : ""}`}
                                onClick={() => setTxTypeFilter("income")}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    <div className={styles.transactionsList}>
                        {filteredTxList.length > 0 ? (
                            filteredTxList.map((tx) => (
                                <div key={tx.id} className={styles.txRow}>
                                    <div
                                        className={styles.txIcon}
                                        style={{
                                            backgroundColor: `${tx.category_color}15`,
                                            color: tx.category_color,
                                        }}
                                    >
                                        <DynamicIcon
                                            name={tx.category_icon}
                                            size={14}
                                        />
                                    </div>
                                    <div className={styles.txInfo}>
                                        <span className={styles.txTitle}>
                                            {tx.title}
                                        </span>
                                        <span className={styles.txDate}>
                                            {new Date(
                                                tx.date,
                                            ).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className={styles.txRight}>
                                        <span
                                            className={`${styles.txAmount} ${tx.type === "income" ? styles.positiveText : styles.negativeText}`}
                                        >
                                            {tx.type === "income" ? "+" : "-"}
                                            {formatMoney(tx.amount)}
                                        </span>
                                        <span className={styles.txAccount}>
                                            {tx.account_name || "Account"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptySplitState}>
                                <FiInbox
                                    size={20}
                                    className={styles.emptyIcon}
                                />
                                <p className={styles.emptyText}>
                                    No transaction records
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Card: 6-Month cashflow sparks */}
                <div className={`${styles.splitCard} glass-card`}>
                    <h3 className={styles.sectionTitle}>
                        Historical Trend (Last 6 Months)
                    </h3>
                    <div className={styles.chartWrapper}>
                        {miniTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={miniTrendData}
                                    margin={{
                                        top: 10,
                                        right: 5,
                                        left: -25,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="incGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-income)"
                                                stopOpacity={0.15}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-income)"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="expGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-expense)"
                                                stopOpacity={0.15}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-expense)"
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
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "var(--color-text-secondary)",
                                            fontSize: 10,
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "var(--color-text-secondary)",
                                            fontSize: 10,
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "var(--color-bg-elevated)",
                                            borderColor:
                                                "var(--color-border-strong)",
                                            borderRadius: 6,
                                            fontSize: 10,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Income"
                                        stroke="var(--color-income)"
                                        strokeWidth={2}
                                        fill="url(#incGrad)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Expense"
                                        stroke="var(--color-expense)"
                                        strokeWidth={2}
                                        fill="url(#expGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptySplitState}>
                                <p className={styles.emptyText}>
                                    No historical data
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
