// local
import styles from "./KPISummaryRow.module.css";

// react icons
import { FiArrowUpRight, FiArrowDownRight, FiTarget } from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";

// Formatter helper
function formatFullAmount(value, currency = "EGP") {
    const num = Number(value) || 0;
    return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function KPISummaryRow({ kpis, currency }) {
    const { income, expense, net, savingsRate } = kpis;

    return (
        <section className={styles.rowGrid} aria-label="KPI summaries">
            {/* Card 1 — Total Income */}
            <article className={styles.kpiCard} data-anim="overview-card" style={{ "--card-accent": "var(--color-income)" }}>
                <div className={styles.cardHeader}>
                    <div className={`${styles.iconBg} ${styles.greenBg}`}>
                        <FiArrowUpRight className={styles.greenIcon} size={20} />
                    </div>
                    <span className={styles.cardLabel}>Total Income</span>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.bigNumber}>{formatFullAmount(income.value, currency)}</p>
                    <div className={styles.trendRow}>
                        <span className={`${styles.trendBadge} ${income.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {income.isPositive ? "▲" : "▼"} {Math.abs(income.trend)}%
                        </span>
                        <span className={styles.subtext}>vs previous period</span>
                    </div>
                </div>
                <div className={`${styles.bottomAccent} ${styles.greenAccent}`} />
            </article>

            {/* Card 2 — Total Expenses */}
            <article className={styles.kpiCard} data-anim="overview-card" style={{ "--card-accent": "var(--color-expense)" }}>
                <div className={styles.cardHeader}>
                    <div className={`${styles.iconBg} ${styles.redBg}`}>
                        <FiArrowDownRight className={styles.redIcon} size={20} />
                    </div>
                    <span className={styles.cardLabel}>Total Expenses</span>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.bigNumber}>{formatFullAmount(expense.value, currency)}</p>
                    <div className={styles.trendRow}>
                        {/* Note: Decrease in expense (isPositive = true) is good */}
                        <span className={`${styles.trendBadge} ${expense.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {expense.isPositive ? "▼" : "▲"} {Math.abs(expense.trend)}%
                        </span>
                        <span className={styles.subtext}>vs previous period</span>
                    </div>
                </div>
                <div className={`${styles.bottomAccent} ${styles.redAccent}`} />
            </article>

            {/* Card 3 — Net Balance */}
            <article className={styles.kpiCard} data-anim="overview-card" style={{ "--card-accent": "var(--color-transfer)" }}>
                <div className={styles.cardHeader}>
                    <div className={`${styles.iconBg} ${styles.violetBg}`}>
                        <FaScaleBalanced className={styles.violetIcon} size={18} />
                    </div>
                    <span className={styles.cardLabel}>Net Balance</span>
                </div>
                <div className={styles.cardBody}>
                    <p className={`${styles.bigNumber} ${net.value >= 0 ? styles.positiveText : styles.negativeText}`}>
                        {formatFullAmount(net.value, currency)}
                    </p>
                    <div className={styles.trendRow}>
                        <span className={`${styles.trendBadge} ${net.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {net.isPositive ? "▲" : "▼"} {Math.abs(net.trend)}%
                        </span>
                        <span className={styles.subtext}>Income − Expenses</span>
                    </div>
                </div>
                <div className={`${styles.bottomAccent} ${styles.violetAccent}`} />
            </article>

            {/* Card 4 — Savings Rate */}
            <article className={styles.kpiCard} data-anim="overview-card" style={{ "--card-accent": "var(--color-warning)" }}>
                <div className={styles.cardHeader}>
                    <div className={`${styles.iconBg} ${styles.amberBg}`}>
                        <FiTarget className={styles.amberIcon} size={20} />
                    </div>
                    <span className={styles.cardLabel}>Savings Rate</span>
                </div>
                <div className={styles.donutCardBody}>
                    <div className={styles.numberWithDonut}>
                        <p className={styles.bigNumber}>{savingsRate.value.toFixed(1)}%</p>
                        
                        {/* SVG Progress Ring */}
                        <div className={styles.ringContainer} aria-hidden="true">
                            <svg className={styles.progressRing} width="48" height="48">
                                <circle
                                    className={styles.ringTrack}
                                    stroke="var(--color-border-default)"
                                    strokeWidth="3.5"
                                    fill="transparent"
                                    r="20"
                                    cx="24"
                                    cy="24"
                                />
                                <circle
                                    className={styles.ringFill}
                                    stroke="var(--color-warning)"
                                    strokeWidth="3.5"
                                    fill="transparent"
                                    r="20"
                                    cx="24"
                                    cy="24"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - Math.min(Math.max(savingsRate.value, 0), 100) / 100)}`}
                                />
                            </svg>
                        </div>
                    </div>
                    
                    <div className={styles.benchmarkWrapper}>
                        <span className={styles.benchmarkText}>{savingsRate.benchmark}</span>
                    </div>
                </div>
                <div className={`${styles.bottomAccent} ${styles.amberAccent}`} />
            </article>
        </section>
    );
}
