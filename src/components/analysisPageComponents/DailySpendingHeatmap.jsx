import React from "react";
import styles from "./DailySpendingHeatmap.module.css";

export default function DailySpendingHeatmap({ dailyHeatmap, currency }) {
    const { cells, mostExpensiveDay, avgDailySpending } = dailyHeatmap;

    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Format money helper
    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString()}`;
    };

    return (
        <article className={`${styles.heatmapCard} glass-card`} data-anim="middle-card">
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Daily Spending Heatmap</h2>
                <p className={styles.cardSubtitle}>
                    Visualize spending trends and contribution frequency throughout this period
                </p>
            </div>

            <div className={styles.heatmapBody}>
                {cells.length > 0 ? (
                    <div className={styles.gridContainer}>
                        {/* Day headers */}
                        <div className={styles.gridWeekdayHeaders}>
                            {weekdayNames.map((day) => (
                                <span key={day} className={styles.weekdayLabel}>
                                    {day}
                                </span>
                            ))}
                        </div>

                        {/* Heatmap cells */}
                        <div className={styles.gridCells}>
                            {cells.map((cell) => {
                                const isWeekend = cell.dateObj.getDay() === 0 || cell.dateObj.getDay() === 6;
                                return (
                                    <div
                                        key={cell.dateStr}
                                        className={`${styles.heatmapCell} ${styles[`level-${cell.intensity}`]} ${isWeekend ? styles.weekendCell : ""}`}
                                        role="img"
                                        aria-label={`${cell.dateStr}: ${formatMoney(cell.amount)} (${cell.count} transactions)`}
                                    >
                                        {/* Hover Tooltip inside cell */}
                                        <div className={styles.cellTooltip}>
                                            <p className={styles.tooltipDate}>
                                                {cell.dateObj.toLocaleDateString(undefined, {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <p className={styles.tooltipAmount}>
                                                Spent: <span className={styles.amountBold}>{formatMoney(cell.amount)}</span>
                                            </p>
                                            <p className={styles.tooltipCount}>{cell.count} transaction{cell.count === 1 ? "" : "s"}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyHeatmapState}>
                        <p className={styles.emptyText}>No spending history available</p>
                    </div>
                )}

                {/* Heatmap Legend */}
                {cells.length > 0 && (
                    <div className={styles.heatmapLegend}>
                        <span className={styles.legendLabel}>Less</span>
                        <div className={`${styles.legendBox} ${styles["level-0"]}`} />
                        <div className={`${styles.legendBox} ${styles["level-1"]}`} />
                        <div className={`${styles.legendBox} ${styles["level-2"]}`} />
                        <div className={`${styles.legendBox} ${styles["level-3"]}`} />
                        <div className={`${styles.legendBox} ${styles["level-4"]}`} />
                        <span className={styles.legendLabel}>More</span>
                    </div>
                )}
            </div>

            {/* Bottom aggregate stats */}
            <div className={styles.aggregateRow}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Average Daily Spending</span>
                    <span className={styles.statValue}>{formatMoney(avgDailySpending)}</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Most Expensive Day</span>
                    {mostExpensiveDay ? (
                        <span className={styles.statValue}>
                            {mostExpensiveDay.dateStr}
                            <span className={styles.statSubText}> ({formatMoney(mostExpensiveDay.amount)})</span>
                        </span>
                    ) : (
                        <span className={styles.statValue}>—</span>
                    )}
                </div>
            </div>
        </article>
    );
}
