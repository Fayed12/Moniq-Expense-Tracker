import React, { useState } from "react";
import { FiTag, FiTrendingUp, FiTrendingDown, FiCalendar, FiDollarSign } from "react-icons/fi";
import styles from "./TagsAndHighlights.module.css";

export default function TagsAndHighlights({ tagAnalysis, periodHighlights, currency }) {
    const [avgType, setAvgType] = useState("expense"); // "expense" | "income"

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString()}`;
    };

    return (
        <section className={styles.doubleSection} aria-label="Tags and highlights breakdown">
            {/* Left: Tags analysis */}
            <article className={`${styles.tagsCard} glass-card`} data-anim="middle-card">
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Transaction Tags</h2>
                    <span className={styles.badgeLabel}>
                        <FiTag /> Tags Cloud
                    </span>
                </div>

                <div className={styles.tagsBody}>
                    {tagAnalysis.length > 0 ? (
                        <div className={styles.tagList}>
                            {tagAnalysis.map((tag) => {
                                const maxVal = Math.max(...tagAnalysis.map((t) => t.count)) || 1;
                                const barWidth = Math.round((tag.count / maxVal) * 100);

                                return (
                                    <div key={tag.name} className={styles.tagRow}>
                                        <div className={styles.tagBadgeWrap}>
                                            <span
                                                className={`${styles.tagPill} ${tag.isMostlyExpense ? styles.expenseTag : styles.incomeTag}`}
                                            >
                                                #{tag.name}
                                            </span>
                                            <span className={styles.tagCountText}>{tag.count} txs</span>
                                        </div>

                                        <div className={styles.barTrack}>
                                            <div
                                                className={`${styles.barFill} ${tag.isMostlyExpense ? styles.expenseFill : styles.incomeFill}`}
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>

                                        <span className={styles.tagAmount}>{formatMoney(tag.amount)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyContainer}>
                            <p className={styles.emptyText}>No transaction tags found in this period</p>
                        </div>
                    )}
                </div>
            </article>

            {/* Right: Quick Stats Panel */}
            <article className={`${styles.highlightsCard} glass-card`} data-anim="middle-card">
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Period Highlights</h2>
                </div>

                <div className={styles.highlightsBody}>
                    {/* Stat 1: Largest Expense */}
                    <div className={styles.highlightTile}>
                        <div className={`${styles.iconCircle} ${styles.redCircle}`}>
                            <FiTrendingDown />
                        </div>
                        <div className={styles.tileInfo}>
                            <span className={styles.tileLabel}>Largest Single Expense</span>
                            {periodHighlights.largestExpense ? (
                                <div className={styles.tileContent}>
                                    <span className={`${styles.tileValue} ${styles.expenseText}`}>
                                        -{formatMoney(periodHighlights.largestExpense.amount)}
                                    </span>
                                    <span className={styles.tileSub}>
                                        {periodHighlights.largestExpense.title} · {periodHighlights.largestExpense.dateStr}
                                    </span>
                                </div>
                            ) : (
                                <span className={styles.tileValue}>—</span>
                            )}
                        </div>
                    </div>

                    {/* Stat 2: Largest Income */}
                    <div className={styles.highlightTile}>
                        <div className={`${styles.iconCircle} ${styles.greenCircle}`}>
                            <FiTrendingUp />
                        </div>
                        <div className={styles.tileInfo}>
                            <span className={styles.tileLabel}>Largest Single Income</span>
                            {periodHighlights.largestIncome ? (
                                <div className={styles.tileContent}>
                                    <span className={`${styles.tileValue} ${styles.incomeText}`}>
                                        +{formatMoney(periodHighlights.largestIncome.amount)}
                                    </span>
                                    <span className={styles.tileSub}>
                                        {periodHighlights.largestIncome.title} · {periodHighlights.largestIncome.dateStr}
                                    </span>
                                </div>
                            ) : (
                                <span className={styles.tileValue}>—</span>
                            )}
                        </div>
                    </div>

                    {/* Stat 3: Most Active Day */}
                    <div className={styles.highlightTile}>
                        <div className={`${styles.iconCircle} ${styles.violetCircle}`}>
                            <FiCalendar />
                        </div>
                        <div className={styles.tileInfo}>
                            <span className={styles.tileLabel}>Most Active Day</span>
                            {periodHighlights.mostActiveDay ? (
                                <div className={styles.tileContent}>
                                    <span className={styles.tileValue}>{periodHighlights.mostActiveDay.name}</span>
                                    <span className={styles.tileSub}>
                                        {periodHighlights.mostActiveDay.count} transactions on average
                                    </span>
                                </div>
                            ) : (
                                <span className={styles.tileValue}>—</span>
                            )}
                        </div>
                    </div>

                    {/* Stat 4: Avg Transaction Amount with Toggle */}
                    <div className={styles.highlightTile}>
                        <div className={`${styles.iconCircle} ${styles.amberCircle}`}>
                            <FiDollarSign />
                        </div>
                        <div className={styles.tileInfo}>
                            <div className={styles.avgLabelHeader}>
                                <span className={styles.tileLabel}>Average / Transaction</span>
                                <div className={styles.toggleRow}>
                                    <button
                                        type="button"
                                        className={`${styles.miniToggle} ${avgType === "expense" ? styles.activeMiniToggle : ""}`}
                                        onClick={() => setAvgType("expense")}
                                    >
                                        Exp
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.miniToggle} ${avgType === "income" ? styles.activeMiniToggle : ""}`}
                                        onClick={() => setAvgType("income")}
                                    >
                                        Inc
                                    </button>
                                </div>
                            </div>
                            <div className={styles.tileContent}>
                                <span className={styles.tileValue}>
                                    {avgType === "expense"
                                        ? formatMoney(periodHighlights.avgExpense)
                                        : formatMoney(periodHighlights.avgIncome)}
                                </span>
                                <span className={styles.tileSub}>
                                    Based on current filtered {avgType} transactions
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </section>
    );
}
