// local
import styles from "./BudgetCard.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react-icons
import { FiInfo, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import {
    FaShoppingCart,
    FaUtensils,
    FaHome,
    FaCar,
    FaGamepad,
    FaGraduationCap,
    FaHeart,
    FaPlane,
    FaShieldAlt,
    FaMoneyBillWave,
    FaBriefcase,
    FaEllipsisH,
    FaGift,
    FaWifi,
    FaTshirt,
    FaCoffee,
    FaDumbbell,
    FaBook,
    FaPills,
} from "react-icons/fa";

// prop-types
import PropTypes from "prop-types";

// ── Icon resolver ───────────────────────────────────────────
const ICON_MAP = {
    FaShoppingCart,
    FaUtensils,
    FaHome,
    FaCar,
    FaGamepad,
    FaGraduationCap,
    FaHeart,
    FaPlane,
    FaShieldAlt,
    FaMoneyBillWave,
    FaBriefcase,
    FaEllipsisH,
    FaGift,
    FaWifi,
    FaTshirt,
    FaCoffee,
    FaDumbbell,
    FaBook,
    FaPills,
};

function DynamicIcon({ name, ...props }) {
    const IconComp = ICON_MAP[name] || FaEllipsisH;
    return <IconComp {...props} />;
}

// ════════════════════════════════════════════════════════════
// BUDGET CARD (Active budget)
// ════════════════════════════════════════════════════════════
export function BudgetCard({
    budget,
    currency = "EGP",
    onInfoClick,
    onEditClick,
    onDeleteClick,
}) {
    const limit = Number(budget.limit_amount || 0);
    const spent = budget.spent || 0;
    const pct = budget.pct || 0;
    const status = budget.status || "on-track";
    const txCount = budget.txCount || 0;

    const statusLabel =
        status === "over-budget"
            ? "Over Budget"
            : status === "at-risk"
              ? "At Risk"
              : "On Track";

    return (
        <article
            className={styles.card}
            aria-label={`Budget card for ${budget.category_name}`}
        >
            {/* Top row: icon + name + badge */}
            <div className={styles.topRow}>
                <div className={styles.catInfo}>
                    <span
                        className={styles.catIcon}
                        style={{
                            background:
                                budget.category_color || "var(--color-primary)",
                        }}
                        aria-hidden="true"
                    >
                        <DynamicIcon name={budget.category_icon} />
                    </span>
                    <div className={styles.catMeta}>
                        <h3 className={styles.catName}>
                            {budget.category_name || "Unknown"}
                        </h3>
                        <span className={styles.catTxCount}>
                            {txCount} transaction{txCount !== 1 ? "s" : ""} this
                            month
                        </span>
                    </div>
                </div>
                <span className={styles.statusBadge} data-status={status}>
                    {statusLabel}
                </span>
            </div>

            {/* Amounts */}
            <div className={styles.amountRow}>
                <span className={styles.spentAmount}>
                    {currency}{" "}
                    {spent.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                    })}
                </span>
                <span className={styles.limitAmount}>
                    of {currency}{" "}
                    {limit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                    })}
                </span>
            </div>

            {/* Progress bar */}
            <div className={styles.progressWrap}>
                <div className={styles.progressBg}>
                    <div
                        className={styles.progressFill}
                        data-status={status}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                </div>
                <span className={styles.progressLabel}>
                    {Math.round(pct)}% used
                </span>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    className={styles.actionBtn}
                    onClick={() => onInfoClick?.(budget)}
                    aria-label={`View details for ${budget.category_name}`}
                    title="Details"
                    type="button"
                >
                    <FiInfo />
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => onEditClick?.(budget)}
                    aria-label={`Edit budget for ${budget.category_name}`}
                    title="Edit"
                    type="button"
                >
                    <FiEdit2 />
                </button>
                <button
                    className={styles.actionBtn}
                    data-danger="true"
                    onClick={() => onDeleteClick?.(budget)}
                    aria-label={`Delete budget for ${budget.category_name}`}
                    title="Delete"
                    type="button"
                >
                    <FiTrash2 />
                </button>
            </div>
        </article>
    );
}

BudgetCard.propTypes = {
    budget: PropTypes.object.isRequired,
    currency: PropTypes.string,
    onInfoClick: PropTypes.func,
    onEditClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
};

// ════════════════════════════════════════════════════════════
// UNBUDGETED CARD (placeholder for categories without a budget)
// ════════════════════════════════════════════════════════════
export function UnbudgetedCard({ category, onSetBudget }) {
    return (
        <article
            className={styles.unbudgetedCard}
            aria-label={`No budget for ${category.name}`}
        >
            <span
                className={styles.unbudgetedIcon}
                style={{
                    background: category.color || "var(--color-primary)",
                }}
                aria-hidden="true"
            >
                <DynamicIcon name={category.icon} />
            </span>
            <h3 className={styles.unbudgetedName}>{category.name}</h3>
            <p className={styles.unbudgetedLabel}>No budget set</p>
            <MainButton
                action="outline"
                size="sm"
                title={`Set budget for ${category.name}`}
                clickEvent={() => onSetBudget?.(category)}
            >
                <FiPlus size={14} />
                Set Budget
            </MainButton>
        </article>
    );
}

UnbudgetedCard.propTypes = {
    category: PropTypes.object.isRequired,
    onSetBudget: PropTypes.func,
};
