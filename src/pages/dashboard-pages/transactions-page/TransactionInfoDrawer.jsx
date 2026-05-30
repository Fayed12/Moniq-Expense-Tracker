// local
import styles from "./TransactionInfoDrawer.module.css";

// react
import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// gsap
import gsap from "gsap";

// react-icons
import { FiX } from "react-icons/fi";
import {
    FaShoppingCart, FaUtensils, FaHome, FaCar, FaGamepad,
    FaGraduationCap, FaHeart, FaPlane, FaShieldAlt, FaMoneyBillWave,
    FaBriefcase, FaEllipsisH, FaExchangeAlt, FaPiggyBank, FaGift,
    FaWifi, FaBolt, FaTshirt, FaCoffee, FaDumbbell, FaBook, FaMusic,
    FaFilm, FaPaw, FaBaby, FaPills, FaToolbox, FaChartLine, FaLandmark,
    FaCoins, FaCreditCard, FaWallet, FaUniversity, FaGem, FaStar,
} from "react-icons/fa";

// prop-types
import PropTypes from "prop-types";

// ── Icon map ────────────────────────────────────────────────
const ICON_MAP = {
    FaShoppingCart, FaUtensils, FaHome, FaCar, FaGamepad,
    FaGraduationCap, FaHeart, FaPlane, FaShieldAlt, FaMoneyBillWave,
    FaBriefcase, FaEllipsisH, FaExchangeAlt, FaPiggyBank, FaGift,
    FaWifi, FaBolt, FaTshirt, FaCoffee, FaDumbbell, FaBook, FaMusic,
    FaFilm, FaPaw, FaBaby, FaPills, FaToolbox, FaChartLine, FaLandmark,
    FaCoins, FaCreditCard, FaWallet, FaUniversity, FaGem, FaStar,
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

function formatAmount(amount, type, currency = "EGP") {
    const num = Number(amount) || 0;
    const sign = type === "income" ? "+" : "-";
    return `${sign} ${currency} ${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

// ════════════════════════════════════════════════════════════
// TRANSACTION INFO DRAWER
// ════════════════════════════════════════════════════════════
function TransactionInfoDrawer({ transaction, onClose, currency = "EGP" }) {
    const overlayRef = useRef(null);
    const drawerRef = useRef(null);

    // ── GSAP entrance — slide from left ─────────────────────
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

    if (!transaction) return null;

    const txn = transaction;

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="complementary"
            aria-label="Transaction details"
        >
            <div className={styles.drawer} ref={drawerRef}>
                {/* ── Header ─────────────────────────── */}
                <div className={styles.header}>
                    <h2 className={styles.title} id="txn-drawer-title">
                        Transaction Details
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close details"
                        type="button"
                        id="txn-drawer-close"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* ── Content ────────────────────────── */}
                <div className={styles.content}>
                    {/* Top: icon + title */}
                    <div className={styles.topSection}>
                        <span
                            className={styles.txnIcon}
                            style={{
                                background: `${txn.category_color || "var(--color-primary)"}18`,
                                color:
                                    txn.category_color ||
                                    "var(--color-primary)",
                            }}
                            aria-hidden="true"
                        >
                            <DynamicIcon name={txn.category_icon} />
                        </span>
                        <div className={styles.txnMainInfo}>
                            <h3 className={styles.txnTitle}>{txn.title}</h3>
                            <span className={styles.txnCat}>
                                {txn.category_name || "Uncategorized"}
                            </span>
                        </div>
                    </div>

                    {/* Amount + type */}
                    <div className={styles.amountSection}>
                        <p
                            className={styles.amountValue}
                            data-type={txn.type}
                        >
                            {formatAmount(txn.amount, txn.type, currency)}
                        </p>
                        <span
                            className={styles.typeBadge}
                            data-type={txn.type}
                        >
                            {txn.type}
                        </span>
                    </div>

                    {/* Detail rows */}
                    <div className={styles.detailGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Date</span>
                            <span className={styles.detailValue}>
                                {formatDate(txn.date)}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Account</span>
                            <span className={styles.detailValue}>
                                {txn.account_name || "—"}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Category</span>
                            <span className={styles.detailValue}>
                                {txn.category_name || "—"}
                            </span>
                        </div>

                        {/* Tags */}
                        {txn.tags?.length > 0 && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>
                                    Tags
                                </span>
                                <div className={styles.tagsRow}>
                                    {txn.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={styles.tag}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    {txn.note && (
                        <div className={styles.noteSection}>
                            <p className={styles.noteLabel}>Note</p>
                            <p className={styles.noteText}>{txn.note}</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className={styles.timestamps}>
                        <div className={styles.timestamp}>
                            <span>Created</span>
                            <span>{formatTimestamp(txn.created_at)}</span>
                        </div>
                        <div className={styles.timestamp}>
                            <span>Updated</span>
                            <span>{formatTimestamp(txn.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

TransactionInfoDrawer.propTypes = {
    transaction: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    currency: PropTypes.string,
};

export default TransactionInfoDrawer;
