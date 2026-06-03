// local
import styles from "./IncomeAndPatterns.module.css";

// react icons
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
import { FiClock } from "react-icons/fi";

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

export default function IncomeAndPatterns({ incomeSources, spendingTimePattern, currency }) {
    return (
        <section className={styles.doubleRow} aria-label="Income and patterns analysis">
            {/* Left Card — Income Sources */}
            <article className={`${styles.patternCard} glass-card`} data-anim="middle-card">
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Income Sources</h2>
                </div>

                <div className={styles.barList} role="list">
                    {incomeSources.length > 0 ? (
                        incomeSources.map((item) => (
                            <div key={item.name} className={styles.barRow} role="listitem">
                                <div className={styles.barLabelGroup}>
                                    <div
                                        className={styles.iconCircle}
                                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                    >
                                        <DynamicIcon name={item.icon} size={14} />
                                    </div>
                                    <span className={styles.barName}>{item.name}</span>
                                </div>

                                <div className={styles.barTrack}>
                                    <div
                                        className={styles.barFill}
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color || "var(--color-income)",
                                        }}
                                    />
                                </div>

                                <div className={styles.barValues}>
                                    <span className={styles.barAmount}>
                                        {currency} {item.value.toLocaleString()}
                                    </span>
                                    <span className={styles.barPercentage}>{item.percentage}%</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyContainer}>
                            <p className={styles.emptyText}>No income sources recorded</p>
                        </div>
                    )}
                </div>
            </article>

            {/* Right Card — Spending Pattern by Time of Day */}
            <article className={`${styles.patternCard} glass-card`} data-anim="middle-card">
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>When Do You Spend?</h2>
                    <span className={styles.badgeLabel}>
                        <FiClock /> Time Analysis
                    </span>
                </div>

                <div className={styles.clockGrid}>
                    {spendingTimePattern.map((bucket) => {
                        // Icon mapping based on block name
                        let bucketColor;
                        if (bucket.label.includes("Morning")) bucketColor = "var(--color-warning)";
                        else if (bucket.label.includes("Afternoon")) bucketColor = "var(--color-primary)";
                        else if (bucket.label.includes("Evening")) bucketColor = "var(--color-transfer)";
                        else bucketColor = "#9b8ef0";

                        return (
                            <div
                                key={bucket.label}
                                className={styles.clockTile}
                                style={{ "--tile-accent": bucketColor }}
                            >
                                <span className={styles.tileLabel}>{bucket.label.split(" (")[0]}</span>
                                <span className={styles.tileTime}>{bucket.label.split(" (")[1]?.replace(")", "")}</span>
                                
                                <div className={styles.tileStatsRow}>
                                    <div className={styles.metricItem}>
                                        <span className={styles.metricLabel}>Amount spent</span>
                                        <span className={styles.metricVal} style={{ color: "var(--color-expense)" }}>
                                            {currency} {bucket.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <span className={styles.metricLabel}>Share of txs</span>
                                        <span className={styles.metricVal}>{bucket.percentCount}%</span>
                                    </div>
                                </div>

                                <div className={styles.avgBadge}>
                                    <span>Avg: {currency} {bucket.avgAmount.toLocaleString()}/tx</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </article>
        </section>
    );
}
