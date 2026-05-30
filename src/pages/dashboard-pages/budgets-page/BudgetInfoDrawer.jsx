// local
import styles from "./BudgetInfoDrawer.module.css";

// react
import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// gsap
import gsap from "gsap";

// react-icons
import { FiX, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
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

// ── Icon map ────────────────────────────────────────────────
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

function DynamicIcon({ name, size = 22, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

// ── Helpers ─────────────────────────────────────────────────
function formatTimestamp(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMonth(monthStr) {
    if (!monthStr) return "—";
    const [y, m] = monthStr.split("-");
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ════════════════════════════════════════════════════════════
// BUDGET INFO DRAWER (RIGHT TO LEFT SLIDE)
// ════════════════════════════════════════════════════════════
function BudgetInfoDrawer({ budget, onClose, currency = "EGP" }) {
    const overlayRef = useRef(null);
    const drawerRef = useRef(null);

    // ── GSAP entrance — slide from right ────────────────────
    useEffect(() => {
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.from(overlayRef.current, {
                opacity: 0,
                duration: 0.2,
                ease: "power2.out",
            });
            gsap.from(drawerRef.current, {
                x: 400,
                opacity: 0,
                duration: 0.4,
                ease: "power3.out",
                delay: 0.05,
            });
        });

        return () => ctx.revert();
    }, []);

    // ── Lock body scroll ────────────────────────────────────
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    // ── Escape key ──────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // ── Overlay click ───────────────────────────────────────
    const handleOverlayClick = useCallback(
        (e) => {
            if (e.target === overlayRef.current) onClose();
        },
        [onClose],
    );

    if (!budget) return null;

    const limit = Number(budget.limit_amount || 0);
    const spent = budget.spent || 0;
    const remaining = limit - spent;
    const pct =
        limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    const status = budget.status || "on-track";
    const isOverBudget = status === "over-budget";
    const isAtRisk = status === "at-risk";

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="complementary"
            aria-label="Budget details"
        >
            <div className={styles.drawer} ref={drawerRef}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title} id="budget-drawer-title">
                        Budget Details
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close details"
                        type="button"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Top Section */}
                    <div className={styles.topSection}>
                        <span
                            className={styles.catIcon}
                            style={{
                                background:
                                    budget.category_color ||
                                    "var(--color-primary)",
                            }}
                            aria-hidden="true"
                        >
                            <DynamicIcon name={budget.category_icon} />
                        </span>
                        <div className={styles.catMainInfo}>
                            <h3 className={styles.catTitle}>
                                {budget.category_name || "Unknown Budget"}
                            </h3>
                            <div className={styles.statusChips}>
                                <span className={styles.monthChip}>
                                    {formatMonth(budget.month)}
                                </span>
                                {budget.rollover && (
                                    <span className={styles.rolloverChip}>
                                        Rollover
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Budget Progress */}
                    <div className={styles.analyticsSection}>
                        <h4 className={styles.sectionLabel}>
                            Budget Usage Analytics
                        </h4>
                        <div className={styles.budgetProgressBox}>
                            <div className={styles.progressLabelRow}>
                                <span>Spent vs Budget</span>
                                <span
                                    className={
                                        isOverBudget ? styles.overText : ""
                                    }
                                >
                                    {pct}%
                                </span>
                            </div>

                            <div className={styles.progressBarBg}>
                                <div
                                    className={styles.progressBarFill}
                                    data-status={status}
                                    style={{
                                        width: `${Math.min(pct, 100)}%`,
                                    }}
                                />
                            </div>

                            <div className={styles.progressSubtext}>
                                <span>
                                    {currency}{" "}
                                    {spent.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                                <span>
                                    of {currency}{" "}
                                    {limit.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            {isOverBudget ? (
                                <div className={styles.alertBannerDanger}>
                                    <FiAlertTriangle size={15} />
                                    <span>
                                        This budget has exceeded its limit!
                                    </span>
                                </div>
                            ) : isAtRisk ? (
                                <div className={styles.alertBannerWarning}>
                                    <FiAlertTriangle size={15} />
                                    <span>
                                        Spending is approaching the budget limit
                                        ({pct}%).
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.alertBannerSuccess}>
                                    <FiCheckCircle size={15} />
                                    <span>
                                        Spending is within budget. Good job!
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Grid */}
                    <div className={styles.detailGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>
                                Budget Limit
                            </span>
                            <span className={styles.detailValue}>
                                {currency}{" "}
                                {limit.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Spent</span>
                            <span className={styles.detailValue}>
                                {currency}{" "}
                                {spent.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>
                                Remaining
                            </span>
                            <span
                                className={styles.detailValue}
                                style={{
                                    color:
                                        remaining < 0
                                            ? "var(--color-danger)"
                                            : "var(--color-success)",
                                }}
                            >
                                {currency}{" "}
                                {remaining.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>
                                Transactions
                            </span>
                            <span className={styles.detailValue}>
                                {budget.txCount || 0} this month
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Rollover</span>
                            <span className={styles.detailValue}>
                                {budget.rollover ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                        {budget.rollover && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>
                                    Rollover Amount
                                </span>
                                <span className={styles.detailValue}>
                                    {currency}{" "}
                                    {Number(
                                        budget.rollover_amount || 0,
                                    ).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className={styles.timestamps}>
                        <div className={styles.timestamp}>
                            <span>Created</span>
                            <span>{formatTimestamp(budget.created_at)}</span>
                        </div>
                        <div className={styles.timestamp}>
                            <span>Updated</span>
                            <span>{formatTimestamp(budget.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

BudgetInfoDrawer.propTypes = {
    budget: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    currency: PropTypes.string,
};

export default BudgetInfoDrawer;
