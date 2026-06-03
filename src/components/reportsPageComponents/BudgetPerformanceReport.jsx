// local
import styles from "./BudgetPerformanceReport.module.css";

// react icons
import { FiInfo } from "react-icons/fi";

// recharts
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Dynamic Icon helper
import { FaEllipsisH, FaUndoAlt } from "react-icons/fa";
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

function DynamicIcon({ name, size = 16, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

export default function BudgetPerformanceReport({ data, currency }) {
    const { healthScore, budgetCards, budgetTrends } = data;

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    // Gauge circle parameters
    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset =
        circumference - (healthScore / 100) * circumference;

    // Health color determination
    let healthColor = "var(--color-success)";
    let healthLabel = "🟢 Outstanding adherence";
    let healthDesc = "Your spending patterns match your budget limits nicely!";

    if (healthScore < 60) {
        healthColor = "var(--color-danger)";
        healthLabel = "🔴 High Overspending Alert";
        healthDesc =
            "Several category budgets are severely overdrawn. Time to adjust limits!";
    } else if (healthScore < 80) {
        healthColor = "var(--color-warning)";
        healthLabel = "🟡 Room for Optimization";
        healthDesc =
            "Some budget thresholds are close to limit capacity. Spend cautiously!";
    }

    return (
        <div className={styles.reportWrapper}>
            {/* Split Top section: Donut Dial on left, detailed summary cards on right */}
            <div className={styles.topSplitRow}>
                {/* Donut Dial Health Card */}
                <div className={`${styles.healthDialCard} glass-card`}>
                    <h3 className={styles.cardTitle}>Budget Health Index</h3>
                    <div className={styles.gaugeContainer}>
                        <svg
                            className={styles.gaugeSvg}
                            width={size}
                            height={size}
                        >
                            {/* Track Circle */}
                            <circle
                                className={styles.gaugeTrack}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                            />
                            {/* Value Circle */}
                            <circle
                                className={styles.gaugeIndicator}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                                stroke={healthColor}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ strokeDasharray: circumference }}
                            />
                        </svg>
                        <div className={styles.gaugeValueBlock}>
                            <span className={styles.gaugeScore}>
                                {healthScore}
                            </span>
                            <span className={styles.gaugeMax}>/ 100</span>
                            <span className={styles.gaugeLabel}>
                                Health Score
                            </span>
                        </div>
                    </div>

                    <div className={styles.healthStatusBlock}>
                        <h4
                            className={styles.statusLabel}
                            style={{ color: healthColor }}
                        >
                            {healthLabel}
                        </h4>
                        <p className={styles.statusDesc}>{healthDesc}</p>
                    </div>
                </div>

                {/* KPI Overview and limits card grids */}
                <div className={styles.rightStatsCol}>
                    <div className={`${styles.summaryInfoCard} glass-card`}>
                        <h3 className={styles.cardTitle}>
                            Budget Adherence Overview
                        </h3>
                        <p className={styles.summaryDesc}>
                            You have set {budgetCards.length} category-level
                            spending limits for this period. A higher budget
                            health score means you remain well within your
                            allocated parameters.
                        </p>

                        <div className={styles.microStatsBox}>
                            <div className={styles.mStat}>
                                <span className={styles.mLabel}>
                                    Budgets Active
                                </span>
                                <span className={styles.mValue}>
                                    {budgetCards.length} limits
                                </span>
                            </div>
                            <div className={styles.mDivider} />
                            <div className={styles.mStat}>
                                <span className={styles.mLabel}>
                                    Over Limit
                                </span>
                                <span
                                    className={`${styles.mValue} ${styles.redText}`}
                                >
                                    {
                                        budgetCards.filter(
                                            (b) => b.rawPct > 100,
                                        ).length
                                    }{" "}
                                    categories
                                </span>
                            </div>
                            <div className={styles.mDivider} />
                            <div className={styles.mStat}>
                                <span className={styles.mLabel}>
                                    Close to Limit (&gt;70%)
                                </span>
                                <span
                                    className={`${styles.mValue} ${styles.amberText}`}
                                >
                                    {
                                        budgetCards.filter(
                                            (b) =>
                                                b.rawPct > 70 &&
                                                b.rawPct <= 100,
                                        ).length
                                    }{" "}
                                    categories
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* A2 — Budget Cards Progressive Grid */}
            <div className={`${styles.sectionCard} glass-card`}>
                <h3 className={styles.sectionTitle}>
                    Individual Budget Progressive Progress
                </h3>
                <p className={styles.sectionSubtitle}>
                    Shows exact category spent indicators against limits,
                    accounting for active rollovers
                </p>

                {budgetCards.length > 0 ? (
                    <div className={styles.budgetsGrid}>
                        {budgetCards.map((b) => {
                            const isOver = b.rawPct > 100;
                            const isWarning = b.rawPct > 70 && b.rawPct <= 100;

                            let progressColor = "var(--color-success)";
                            if (isOver) progressColor = "var(--color-danger)";
                            else if (isWarning)
                                progressColor = "var(--color-warning)";

                            return (
                                <div
                                    key={b.id}
                                    className={styles.budgetProgressCard}
                                    style={{
                                        borderTop: `4px solid ${b.categoryColor || "var(--color-primary)"}`,
                                    }}
                                >
                                    <div className={styles.bCardTop}>
                                        <div className={styles.categoryInfo}>
                                            <div
                                                className={styles.iconCircle}
                                                style={{
                                                    backgroundColor: `${b.categoryColor || "var(--color-primary)"}15`,
                                                    color:
                                                        b.categoryColor ||
                                                        "var(--color-primary)",
                                                }}
                                            >
                                                <DynamicIcon
                                                    name={b.categoryIcon}
                                                    size={16}
                                                />
                                            </div>
                                            <span
                                                className={styles.categoryName}
                                            >
                                                {b.categoryName}
                                            </span>
                                        </div>
                                        <span
                                            className={`${styles.pctValue} ${isOver ? styles.redText : isWarning ? styles.amberText : styles.greenText}`}
                                        >
                                            {b.pct}% Used
                                        </span>
                                    </div>

                                    <div className={styles.valueGrid}>
                                        <div className={styles.vBlock}>
                                            <span className={styles.vLabel}>
                                                Total Spent
                                            </span>
                                            <span className={styles.vVal}>
                                                {formatMoney(b.spent)}
                                            </span>
                                        </div>
                                        <div className={styles.vBlock}>
                                            <span className={styles.vLabel}>
                                                Allocated Limit
                                            </span>
                                            <span className={styles.vValMuted}>
                                                {formatMoney(b.limit)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress track */}
                                    <div className={styles.horizontalTrack}>
                                        <div
                                            className={styles.horizontalFill}
                                            style={{
                                                width: `${b.pct}%`,
                                                backgroundColor: progressColor,
                                            }}
                                        />
                                    </div>

                                    {/* Bottom indicators */}
                                    <div className={styles.bCardBottom}>
                                        <span
                                            className={`${styles.remainingText} ${b.remaining >= 0 ? styles.greenText : styles.redText}`}
                                        >
                                            {b.remaining >= 0
                                                ? `${formatMoney(b.remaining)} remaining`
                                                : `Overdraft: ${formatMoney(Math.abs(b.remaining))}`}
                                        </span>

                                        {b.rollover && (
                                            <div
                                                className={styles.rolloverBadge}
                                                title="Carry over remaining funds to next month"
                                            >
                                                <FaUndoAlt
                                                    size={10}
                                                    className={
                                                        styles.rotateIcon
                                                    }
                                                />
                                                <span>Rollover active</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyBudgets}>
                        <FiInfo size={24} className={styles.emptyIcon} />
                        <p className={styles.emptyText}>
                            No category limits configured for this period. Add
                            budgets in the Budgets screen to track progress.
                        </p>
                    </div>
                )}
            </div>

            {/* A3 — Historical Budget Trend */}
            {budgetTrends.length > 0 && (
                <div className={`${styles.sectionCard} glass-card`}>
                    <h3 className={styles.sectionTitle}>
                        Budget Limits vs. Spent Trends (Historical)
                    </h3>
                    <p className={styles.sectionSubtitle}>
                        Shows standard aggregates of budget caps vs. actual
                        spending over last 5 months
                    </p>

                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={budgetTrends}
                                margin={{
                                    top: 20,
                                    right: 10,
                                    left: -10,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="spentGradient"
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
                                <Legend
                                    wrapperStyle={{
                                        fontSize: 12,
                                        paddingTop: 10,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    name="Actual Spent"
                                    dataKey="Spent"
                                    stroke="var(--color-expense)"
                                    strokeWidth={2}
                                    fill="url(#spentGradient)"
                                />
                                <Area
                                    type="monotone"
                                    name="Allocated Limit"
                                    dataKey="Limit"
                                    stroke="var(--cream-400)"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
