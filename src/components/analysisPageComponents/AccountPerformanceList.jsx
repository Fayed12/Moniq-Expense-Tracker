// local
import styles from "./AccountPerformanceList.module.css";

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
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

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

// Sparkline SVG Path drawer
function Sparkline({ points }) {
    if (!points || points.length < 2) {
        return (
            <svg className={styles.sparkline} width="60" height="28" viewBox="0 0 60 28" aria-hidden="true">
                <line x1="0" y1="14" x2="60" y2="14" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="3,3" />
            </svg>
        );
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const width = 60;
    const height = 28;
    const padding = 2; // pixel margin

    const pointsScaled = points.map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - padding - ((val - min) / range) * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${pointsScaled.join(" L ")}`;

    return (
        <svg className={styles.sparkline} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <path d={pathData} stroke="var(--color-primary)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function AccountPerformanceList({ accountPerformance, currency }) {
    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString()}`;
    };

    return (
        <article className={`${styles.accCard} glass-card`} data-anim="charts-row">
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Account Performance</h2>
                <p className={styles.cardSubtitle}>Balance flow and operations across active accounts</p>
            </div>

            <div className={styles.tableWrapper}>
                {accountPerformance.length > 0 ? (
                    <table className={styles.accTable}>
                        <thead>
                            <tr>
                                <th scope="col">Account</th>
                                <th scope="col">Type</th>
                                <th scope="col">Balance Trend</th>
                                <th scope="col">Income</th>
                                <th scope="col">Expense</th>
                                <th scope="col">Net Change</th>
                                <th scope="col">Current Balance</th>
                                <th scope="col">Tx Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountPerformance.map((acc) => {
                                const isPositive = acc.netChange >= 0;
                                return (
                                    <tr key={acc.id} className={styles.accRow}>
                                        {/* Account Info */}
                                        <td className={styles.accCell}>
                                            <div className={styles.accCellGroup}>
                                                <span
                                                    className={styles.colorDot}
                                                    style={{ backgroundColor: acc.color || "var(--color-primary)" }}
                                                />
                                                <div
                                                    className={styles.iconCircle}
                                                    style={{
                                                        backgroundColor: `${acc.color || "var(--color-primary)"}15`,
                                                        color: acc.color || "var(--color-primary)",
                                                    }}
                                                >
                                                    <DynamicIcon name={acc.icon} size={14} />
                                                </div>
                                                <span className={styles.accName}>{acc.name}</span>
                                            </div>
                                        </td>

                                        {/* Type Pill */}
                                        <td>
                                            <span className={styles.typeBadge}>{acc.type}</span>
                                        </td>

                                        {/* SVG Sparkline */}
                                        <td>
                                            <div className={styles.sparklineWrap}>
                                                <Sparkline points={acc.sparklinePoints} />
                                            </div>
                                        </td>

                                        {/* Income */}
                                        <td>
                                            <span className={styles.incomeText}>+{formatMoney(acc.income)}</span>
                                        </td>

                                        {/* Expense */}
                                        <td>
                                            <span className={styles.expenseText}>-{formatMoney(acc.expense)}</span>
                                        </td>

                                        {/* Net Change */}
                                        <td>
                                            <span
                                                className={`${styles.netBadge} ${isPositive ? styles.netPositive : styles.netNegative}`}
                                            >
                                                {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                                                {isPositive ? "+" : ""}
                                                {formatMoney(acc.netChange)}
                                            </span>
                                        </td>

                                        {/* Balance */}
                                        <td>
                                            <span className={styles.balanceText}>{formatMoney(acc.currentBalance)}</span>
                                        </td>

                                        {/* Tx Count */}
                                        <td>
                                            <span className={styles.txCountText}>{acc.txCount} txs</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyAccountsState}>
                        <p className={styles.emptyText}>No accounts to demonstrate performance</p>
                    </div>
                )}
            </div>
        </article>
    );
}
