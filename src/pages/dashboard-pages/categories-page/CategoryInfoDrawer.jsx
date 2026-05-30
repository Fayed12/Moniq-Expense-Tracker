// local
import styles from "./CategoryInfoDrawer.module.css";

// react
import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// gsap
import gsap from "gsap";

// react-icons
import { FiX, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import {
    FaShoppingCart, FaUtensils, FaHome, FaCar, FaGamepad,
    FaGraduationCap, FaHeart, FaPlane, FaShieldAlt, FaMoneyBillWave,
    FaBriefcase, FaEllipsisH, FaGift, FaWifi, FaTshirt, FaCoffee,
    FaDumbbell, FaBook, FaPills, FaStar,
} from "react-icons/fa";

// prop-types
import PropTypes from "prop-types";

// ── Icon map ────────────────────────────────────────────────
const ICON_MAP = {
    FaShoppingCart, FaUtensils, FaHome, FaCar, FaGamepad,
    FaGraduationCap, FaHeart, FaPlane, FaShieldAlt, FaMoneyBillWave,
    FaBriefcase, FaEllipsisH, FaGift, FaWifi, FaTshirt, FaCoffee,
    FaDumbbell, FaBook, FaPills, FaStar,
};

function DynamicIcon({ name, size = 22, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

// ── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

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

// ════════════════════════════════════════════════════════════
// CATEGORY INFO DRAWER (RIGHT TO LEFT SLIDE)
// ════════════════════════════════════════════════════════════
function CategoryInfoDrawer({ category, categoryStats, onClose, currency = "EGP" }) {
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

    if (!category) return null;

    const stats = categoryStats[category.id] || {
        transactionCount: 0,
        spentThisMonth: 0,
        budgetLimit: 0,
    };

    const hasBudget = stats.budgetLimit > 0;
    const spentPercent = hasBudget ? Math.min(100, Math.round((stats.spentThisMonth / stats.budgetLimit) * 100)) : 0;
    const isOverBudget = hasBudget && stats.spentThisMonth > stats.budgetLimit;

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="complementary"
            aria-label="Category details"
        >
            <div className={styles.drawer} ref={drawerRef}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title} id="cat-drawer-title">
                        Category Details
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
                                background: `${category.color || "var(--color-primary)"}18`,
                                color: category.color || "var(--color-primary)",
                            }}
                            aria-hidden="true"
                        >
                            <DynamicIcon name={category.icon} />
                        </span>
                        <div className={styles.catMainInfo}>
                            <h3 className={styles.catTitle}>{category.name}</h3>
                            <div className={styles.statusChips}>
                                <span
                                    className={styles.typeBadge}
                                    data-type={category.type || "both"}
                                >
                                    {category.type || "both"}
                                </span>
                                {category.is_default && (
                                    <span className={styles.defaultChip}>
                                        Selectable
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Analytics (if Expense) */}
                    {(category.type === "expense" || category.type === "both" || !category.type) && (
                        <div className={styles.analyticsSection}>
                            <div className={styles.analyticsHeader}>
                                <h4 className={styles.sectionLabel}>Monthly Spending Analytics</h4>
                            </div>

                            {hasBudget ? (
                                <div className={styles.budgetProgressBox}>
                                    <div className={styles.progressLabelRow}>
                                        <span>Spent vs Budget</span>
                                        <span className={isOverBudget ? styles.overText : ""}>
                                            {spentPercent}%
                                        </span>
                                    </div>
                                    
                                    {/* Progress bar wrapper */}
                                    <div className={styles.progressBarBg}>
                                        <div
                                            className={`${styles.progressBarFill} ${isOverBudget ? styles.barDanger : ""}`}
                                            style={{ width: `${spentPercent}%` }}
                                        />
                                    </div>

                                    <div className={styles.progressSubtext}>
                                        <span>
                                            {currency}{" "}
                                            {stats.spentThisMonth.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                        <span>
                                            of {currency}{" "}
                                            {stats.budgetLimit.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>

                                    {isOverBudget ? (
                                        <div className={styles.alertBannerDanger}>
                                            <FiAlertTriangle size={15} />
                                            <span>This category has exceeded its monthly budget limit!</span>
                                        </div>
                                    ) : (
                                        <div className={styles.alertBannerSuccess}>
                                            <FiCheckCircle size={15} />
                                            <span>Spending is within budget limits. Good job!</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.noBudgetState}>
                                    <p className={styles.noBudgetTitle}>No active budget set</p>
                                    <p className={styles.noBudgetText}>
                                        Setting a budget limit helps track monthly spending. Set one in the Budgets section.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metadata Grid */}
                    <div className={styles.detailGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Type</span>
                            <span className={styles.detailValue} style={{ textTransform: "capitalize" }}>
                                {category.type || "both"}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Star Selectable</span>
                            <span className={styles.detailValue}>
                                {category.is_default ? "Yes (Selectable)" : "No (Hidden)"}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Total Transactions</span>
                            <span className={styles.detailValue}>
                                {stats.transactionCount} transactions
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Created At</span>
                            <span className={styles.detailValue}>
                                {formatDate(category.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className={styles.timestamps}>
                        <div className={styles.timestamp}>
                            <span>Created Row</span>
                            <span>{formatTimestamp(category.created_at)}</span>
                        </div>
                        <div className={styles.timestamp}>
                            <span>Updated Row</span>
                            <span>{formatTimestamp(category.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

CategoryInfoDrawer.propTypes = {
    category: PropTypes.object,
    categoryStats: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    currency: PropTypes.string,
};

export default CategoryInfoDrawer;
