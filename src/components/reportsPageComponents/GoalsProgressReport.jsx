// local
import styles from "./GoalsProgressReport.module.css";

// react
import { useState } from "react";

// react icons
import {
    FiTarget,
    FiTrendingUp,
    FiCheckCircle,
    FiInfo,
    FiCalendar,
    FiClock,
    FiPlayCircle,
    FiPauseCircle,
    FiInbox,
} from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";

// Dynamic Icon helper
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
    if (!IconComp) return <FaShieldAlt size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

export default function GoalsProgressReport({ data, currency }) {
    const { kpis, list, timeline } = data;
    const [isCompletedOpen, setIsCompletedOpen] = useState(false);

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    const activeGoals = list.filter((g) => !g.isCompleted);
    const completedGoals = list.filter((g) => g.isCompleted);

    // Dynamic SVG Circular progress variables
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    return (
        <div className={styles.reportWrapper}>
            {/* Section E1 — Goals Overview KPIs */}
            <div className={styles.kpiRow}>
                {/* Active Goals Count */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-primary)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>
                            Active Savings Goals
                        </span>
                        <div className={`${styles.iconBg} ${styles.blueBg}`}>
                            <FiTarget className={styles.blueIcon} size={18} />
                        </div>
                    </div>
                    <p className={styles.cardVal}>{kpis.active}</p>
                    <span className={styles.subtext}>
                        currently in progress
                    </span>
                </div>

                {/* Total Saved */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-success)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>
                            Total Accumulated Savings
                        </span>
                        <div className={`${styles.iconBg} ${styles.greenBg}`}>
                            <FiTrendingUp
                                className={styles.greenIcon}
                                size={18}
                            />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {formatMoney(kpis.totalSaved)}
                    </p>
                    <span className={styles.subtext}>
                        saved across all goals
                    </span>
                </div>

                {/* Total Target */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-transfer)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>
                            Aggregate Target Amount
                        </span>
                        <div className={`${styles.iconBg} ${styles.violetBg}`}>
                            <FiCheckCircle
                                className={styles.violetIcon}
                                size={18}
                            />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {formatMoney(kpis.totalTarget)}
                    </p>
                    <span className={styles.subtext}>
                        total target cap planned
                    </span>
                </div>
            </div>

            {/* Section E2 — Active Goals Grid */}
            <div className={`${styles.sectionCard} glass-card`}>
                <h3 className={styles.sectionTitle}>
                    Active Goal Progression Rings
                </h3>
                <p className={styles.sectionSubtitle}>
                    SVG gauge meters depicting deadline status constraints and
                    active contributions metrics
                </p>

                {activeGoals.length > 0 ? (
                    <div className={styles.goalsGrid}>
                        {activeGoals.map((goal) => {
                            const strokeDashoffset =
                                circumference -
                                (goal.progress / 100) * circumference;

                            // Deadline colors
                            let deadlineColor = styles.daysNormal;
                            if (goal.daysLeft !== null) {
                                if (goal.daysLeft < 14)
                                    deadlineColor = styles.daysDanger;
                                else if (goal.daysLeft < 60)
                                    deadlineColor = styles.daysWarning;
                            }

                            return (
                                <div key={goal.id} className={styles.goalCard}>
                                    <div className={styles.goalTopRow}>
                                        <div
                                            className={styles.iconCircle}
                                            style={{
                                                backgroundColor: `${goal.color}15`,
                                                color: goal.color,
                                            }}
                                        >
                                            <DynamicIcon
                                                name={goal.icon}
                                                size={18}
                                            />
                                        </div>
                                        <div className={styles.goalTitleMeta}>
                                            <h4 className={styles.goalName}>
                                                {goal.name}
                                            </h4>
                                            <span
                                                className={
                                                    styles.goalStatusBadge
                                                }
                                            >
                                                {goal.isPaused ? (
                                                    <span
                                                        className={
                                                            styles.pausedBadge
                                                        }
                                                    >
                                                        <FiPauseCircle
                                                            size={10}
                                                        />{" "}
                                                        Paused
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={
                                                            styles.activeBadge
                                                        }
                                                    >
                                                        <FiPlayCircle
                                                            size={10}
                                                        />{" "}
                                                        Active
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Circle + Core Value split layout */}
                                    <div className={styles.gaugeSplitLayout}>
                                        <div className={styles.ringContainer}>
                                            <svg
                                                width={size}
                                                height={size}
                                                className={styles.ringSvg}
                                            >
                                                <circle
                                                    className={styles.ringTrack}
                                                    cx={size / 2}
                                                    cy={size / 2}
                                                    r={radius}
                                                    strokeWidth={strokeWidth}
                                                />
                                                <circle
                                                    className={styles.ringFill}
                                                    cx={size / 2}
                                                    cy={size / 2}
                                                    r={radius}
                                                    strokeWidth={strokeWidth}
                                                    stroke={goal.color}
                                                    strokeDasharray={
                                                        circumference
                                                    }
                                                    strokeDashoffset={
                                                        strokeDashoffset
                                                    }
                                                    style={{
                                                        strokeDasharray:
                                                            circumference,
                                                    }}
                                                />
                                            </svg>
                                            <span
                                                className={styles.ringText}
                                                style={{ color: goal.color }}
                                            >
                                                {goal.progress}%
                                            </span>
                                        </div>

                                        <div className={styles.valuesBlock}>
                                            <span className={styles.valLabel}>
                                                Progress Saved
                                            </span>
                                            <span
                                                className={styles.valCurrent}
                                                style={{ color: goal.color }}
                                            >
                                                {formatMoney(goal.current)}
                                            </span>
                                            <span className={styles.valTarget}>
                                                of {formatMoney(goal.target)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Goal details */}
                                    <div className={styles.goalDetailsList}>
                                        {goal.daysLeft !== null ? (
                                            <div
                                                className={`${styles.detailItem} ${deadlineColor}`}
                                            >
                                                <FiCalendar size={12} />
                                                <span>
                                                    {goal.daysLeft === 0
                                                        ? "Deadline reached today"
                                                        : `${goal.daysLeft} days remaining`}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={styles.detailItem}>
                                                <FiClock size={12} />
                                                <span>
                                                    No timeline deadline
                                                </span>
                                            </div>
                                        )}
                                        <div className={styles.detailItem}>
                                            <FiInbox size={12} />
                                            <span>
                                                Contributed{" "}
                                                {goal.contributionsCount} times
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyGridState}>
                        <FiInfo size={24} className={styles.emptyIcon} />
                        <p className={styles.emptyText}>
                            No active savings goals found.
                        </p>
                    </div>
                )}
            </div>

            {/* Completed Goals Ribbon Section */}
            {completedGoals.length > 0 && (
                <div className={`${styles.sectionCard} glass-card`}>
                    <button
                        type="button"
                        className={styles.collapsibleRibbon}
                        onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                    >
                        <div className={styles.ribbonLeft}>
                            <FiCheckCircle
                                className={styles.ribbonCheckIcon}
                                size={18}
                            />
                            <h3 className={styles.sectionTitle}>
                                Completed Savings Goals ({completedGoals.length}
                                )
                            </h3>
                        </div>
                        <span className={styles.ribbonToggleText}>
                            {isCompletedOpen ? "Collapse" : "Expand"}
                        </span>
                    </button>

                    {isCompletedOpen && (
                        <div className={styles.completedGoalsGrid}>
                            {completedGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className={styles.completedCard}
                                >
                                    <div className={styles.completedCheck}>
                                        <FiCheckCircle size={16} />
                                    </div>
                                    <div className={styles.completedInfo}>
                                        <h4 className={styles.completedName}>
                                            {goal.name}
                                        </h4>
                                        <span
                                            className={styles.completedTarget}
                                        >
                                            Saved target of{" "}
                                            {formatMoney(goal.target)}{" "}
                                            successfully!
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Section E3 — Goal Contributions Logs */}
            {timeline.length > 0 && (
                <div className={`${styles.sectionCard} glass-card`}>
                    <h3 className={styles.sectionTitle}>
                        Goal Contribution Logs
                    </h3>
                    <p className={styles.sectionSubtitle}>
                        Recent savings ledger transactions mapped to specific
                        targets
                    </p>

                    <div className={styles.tableWrapper}>
                        <table className={styles.timelineTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Target Goal</th>
                                    <th>Account Source</th>
                                    <th className={styles.rightAlign}>
                                        Contribution Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.date}</td>
                                        <td>
                                            <span
                                                className={styles.goalBadge}
                                                style={{
                                                    backgroundColor: `${row.color}15`,
                                                    color: row.color,
                                                    borderLeft: `3px solid ${row.color}`,
                                                }}
                                            >
                                                {row.goalName}
                                            </span>
                                        </td>
                                        <td>{row.account}</td>
                                        <td
                                            className={`${styles.rightAlign} ${styles.mono} ${styles.greenText}`}
                                        >
                                            +{formatMoney(row.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
