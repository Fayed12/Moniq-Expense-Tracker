// local
import styles from "./CategoryReport.module.css";

// react
import React from "react";
import { useState } from "react";

// react icons
import { FiTrendingUp, FiTrendingDown, FiFolder, FiChevronDown, FiChevronUp, FiInbox } from "react-icons/fi";

// recharts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Dynamic Icon rendering helper
import { FaEllipsisH, FaBalanceScale } from "react-icons/fa";
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

export default function CategoryReport({ data, currency }) {
    const { kpis, deepDiveList, comparisons } = data;
    const [expandedCategories, setExpandedCategories] = useState({});

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    const toggleExpand = (catName) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [catName]: !prev[catName],
        }));
    };

    return (
        <div className={styles.reportWrapper}>
            {/* Section B1 — Category KPIs */}
            <div className={styles.kpiRow}>
                {/* Total Categories */}
                <div className={styles.kpiCard} style={{ "--card-accent": "var(--color-primary)" }}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Categories Tracked</span>
                        <div className={`${styles.iconBg} ${styles.blueBg}`}>
                            <FiFolder className={styles.blueIcon} size={18} />
                        </div>
                    </div>
                    <p className={styles.cardVal}>{kpis.totalCount}</p>
                    <span className={styles.subtext}>active this period</span>
                </div>

                {/* Highest Spending */}
                <div className={styles.kpiCard} style={{ "--card-accent": "var(--color-expense)" }}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Top Spending Category</span>
                        <div className={`${styles.iconBg} ${styles.redBg}`}>
                            <FiTrendingUp className={styles.redIcon} size={18} />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {kpis.highestSpent ? formatMoney(kpis.highestSpent.amount) : formatMoney(0)}
                    </p>
                    <span className={`${styles.subtext} ${styles.ellipsis}`}>
                        {kpis.highestSpent ? `Spent on ${kpis.highestSpent.name}` : "None recorded"}
                    </span>
                </div>

                {/* Lowest Spending */}
                <div className={styles.kpiCard} style={{ "--card-accent": "var(--color-success)" }}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Lowest Spending Category</span>
                        <div className={`${styles.iconBg} ${styles.greenBg}`}>
                            <FiTrendingDown className={styles.greenIcon} size={18} />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {kpis.lowestSpent ? formatMoney(kpis.lowestSpent.amount) : formatMoney(0)}
                    </p>
                    <span className={`${styles.subtext} ${styles.ellipsis}`}>
                        {kpis.lowestSpent ? `Spent on ${kpis.lowestSpent.name}` : "None recorded"}
                    </span>
                </div>

                {/* Average Spent */}
                <div className={styles.kpiCard} style={{ "--card-accent": "var(--color-transfer)" }}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Average Category Spent</span>
                        <div className={`${styles.iconBg} ${styles.violetBg}`}>
                            <FaBalanceScale className={styles.violetIcon} size={16} />
                        </div>
                    </div>
                    <p className={styles.cardVal}>{formatMoney(kpis.avgSpent)}</p>
                    <span className={styles.subtext}>across active categories</span>
                </div>
            </div>

            {/* Section B2 — Category Deep Dive Table */}
            <div className={`${styles.sectionCard} glass-card`}>
                <h3 className={styles.sectionTitle}>Category Deep Dive</h3>
                <p className={styles.sectionSubtitle}>Click a row to expand and view individual transaction items</p>
                <div className={styles.tableWrapper}>
                    {deepDiveList.length > 0 ? (
                        <table className={styles.reportTable}>
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}></th>
                                    <th>Category</th>
                                    <th>Transactions</th>
                                    <th>Total Spent</th>
                                    <th>Avg per Tx</th>
                                    <th>% of Total</th>
                                    <th>vs Last Period</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deepDiveList.map((row, idx) => {
                                    const isExpanded = !!expandedCategories[row.name];
                                    const avgPerTx = row.txCount > 0 ? row.amount / row.txCount : 0;
                                    const trendVal = Number(row.change);
                                    const isTrendUp = row.isIncrease;

                                    return (
                                        <React.Fragment key={row.name}>
                                            <tr
                                                className={`${styles.clickableRow} ${isExpanded ? styles.expandedParent : ""}`}
                                                onClick={() => toggleExpand(row.name)}
                                                style={{ borderLeft: `4px solid ${row.color}` }}
                                            >
                                                <td className={styles.centerAlign}>
                                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                </td>
                                                <td>
                                                    <div className={styles.catGroup}>
                                                        <span className={styles.rank}>{(idx + 1).toString().padStart(2, "0")}</span>
                                                        <div
                                                            className={styles.iconBgWrap}
                                                            style={{ backgroundColor: `${row.color}15`, color: row.color }}
                                                        >
                                                            <DynamicIcon name={row.icon} size={14} />
                                                        </div>
                                                        <span className={styles.catName}>{row.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.txCountBadge}>{row.txCount} transactions</span>
                                                </td>
                                                <td className={styles.mono}>{formatMoney(row.amount)}</td>
                                                <td className={styles.mono}>{formatMoney(avgPerTx)}</td>
                                                <td>
                                                    <div className={styles.progressCol}>
                                                        <div className={styles.progressTrack}>
                                                            <div
                                                                className={styles.progressBar}
                                                                style={{ width: `${row.percentage}%`, backgroundColor: row.color }}
                                                            />
                                                        </div>
                                                        <span className={styles.progressText}>{row.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`${styles.trendBadge} ${
                                                            trendVal === 0 ? styles.trendNeutral : isTrendUp ? styles.trendDanger : styles.trendSuccess
                                                        }`}
                                                    >
                                                        {trendVal === 0 ? "" : isTrendUp ? "▲ +" : "▼ "}
                                                        {Math.abs(trendVal)}%
                                                    </span>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr className={styles.expandedRow}>
                                                    <td colSpan={7}>
                                                        <div className={styles.expandedContent} style={{ borderColor: row.color }}>
                                                            <h4 className={styles.ledgerTitle}>Transaction Ledger: {row.name}</h4>
                                                            <div className={styles.ledgerTableWrap}>
                                                                {row.transactions.length > 0 ? (
                                                                    <table className={styles.ledgerTable}>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Date</th>
                                                                                <th>Title</th>
                                                                                <th>Account</th>
                                                                                <th className={styles.rightAlign}>Amount</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {row.transactions.map((tx) => (
                                                                                <tr key={tx.id}>
                                                                                    <td>
                                                                                        {new Date(tx.date).toLocaleDateString(undefined, {
                                                                                            month: "short",
                                                                                            day: "numeric",
                                                                                            year: "numeric"
                                                                                        })}
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className={styles.txTitleBlock}>
                                                                                            <span className={styles.txMainTitle}>{tx.title}</span>
                                                                                            {tx.tags && tx.tags.length > 0 && (
                                                                                                <div className={styles.tagsRow}>
                                                                                                    {tx.tags.map((tag) => (
                                                                                                        <span key={tag} className={styles.tagBadge}>#{tag}</span>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>{tx.account_name || "Account"}</td>
                                                                                    <td className={`${styles.rightAlign} ${styles.mono} ${styles.negativeText}`}>
                                                                                        -{formatMoney(tx.amount)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                ) : (
                                                                    <div className={styles.emptyLedger}>
                                                                        <p>No transaction items found for this period.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyTableState}>
                            <FiInbox size={24} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>No spending category records for this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Section B4 — Category Comparison Chart */}
            {comparisons.length > 0 && (
                <div className={`${styles.sectionCard} glass-card`}>
                    <h3 className={styles.sectionTitle}>Period Comparisons (Current vs. Prior Period)</h3>
                    <p className={styles.sectionSubtitle}>Compares top category spending against the previous equivalent period</p>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisons} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--color-bg-elevated)",
                                        borderColor: "var(--color-border-strong)",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        boxShadow: "var(--shadow-md)"
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                <Bar dataKey="Current" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Previous" fill="var(--cream-400)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
