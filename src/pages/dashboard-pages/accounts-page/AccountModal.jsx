// local
import styles from "./AccountModal.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";

// react
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// redux
import { useDispatch, useSelector } from "react-redux";
import { createAccount, editAccount } from "../../../redux/accountsSlice";

// gsap
import gsap from "gsap";

// react-icons
import { FiX } from "react-icons/fi";
import {
    FaWallet,
    FaUniversity,
    FaCreditCard,
    FaMoneyBillWave,
    FaChartLine,
    FaPiggyBank,
    FaCoins,
    FaLandmark,
    FaBriefcase,
    FaGem,
    FaShieldAlt,
    FaStar,
} from "react-icons/fa";

// prop-types
import PropTypes from "prop-types";

// ── Constants ───────────────────────────────────────────────
const ACCOUNT_TYPES = [
    "Checking",
    "Savings",
    "Digital Wallet",
    "Brokerage",
    "Cash",
    "Credit Card",
    "Investment",
];

const CURRENCIES = ["EGP", "USD", "EUR", "GBP", "SAR", "AED"];

const ICON_OPTIONS = [
    { key: "FaUniversity", Icon: FaUniversity },
    { key: "FaWallet", Icon: FaWallet },
    { key: "FaCreditCard", Icon: FaCreditCard },
    { key: "FaMoneyBillWave", Icon: FaMoneyBillWave },
    { key: "FaChartLine", Icon: FaChartLine },
    { key: "FaPiggyBank", Icon: FaPiggyBank },
    { key: "FaCoins", Icon: FaCoins },
    { key: "FaLandmark", Icon: FaLandmark },
    { key: "FaBriefcase", Icon: FaBriefcase },
    { key: "FaGem", Icon: FaGem },
    { key: "FaShieldAlt", Icon: FaShieldAlt },
    { key: "FaStar", Icon: FaStar },
];

const COLOR_OPTIONS = [
    "#A0522D", "#8b4423", "#6b3218", "#c08050",
    "#d4a87a", "#3d8c5a", "#2471a3", "#7b68ee",
    "#c0392b", "#b07d1a", "#e74c3c", "#2ecc71",
    "#3498db", "#9b59b6", "#1abc9c", "#e67e22",
];

// ════════════════════════════════════════════════════════════
// ACCOUNT MODAL COMPONENT
// ════════════════════════════════════════════════════════════
function AccountModal({ mode = "add", account = null, onClose }) {
    const dispatch = useDispatch();
    const userId = useSelector((s) => s.auth.user?.id);

    // ── Form state ──────────────────────────────────────────
    const [name, setName] = useState(account?.name || "");
    const [type, setType] = useState(account?.type || "Checking");
    const [balance, setBalance] = useState(account?.balance?.toString() || "0");
    const [currency, setCurrency] = useState(account?.currency || "EGP");
    const [icon, setIcon] = useState(account?.icon || "FaUniversity");
    const [color, setColor] = useState(account?.color || "#A0522D");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ── Refs ────────────────────────────────────────────────
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    // ── GSAP entrance animation ─────────────────────────────
    useEffect(() => {
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.from(overlayRef.current, {
                opacity: 0,
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.from(modalRef.current, {
                scale: 0.92,
                opacity: 0,
                y: 20,
                duration: 0.35,
                ease: "back.out(1.4)",
                delay: 0.05,
            });
        });

        return () => ctx.revert();
    }, []);

    // ── Close on Escape ─────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // ── Handle overlay click ────────────────────────────────
    const handleOverlayClick = useCallback(
        (e) => {
            if (e.target === overlayRef.current) onClose();
        },
        [onClose],
    );

    // ── Submit handler ──────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!name.trim()) {
            setError("Account name is required.");
            return;
        }

        setSubmitting(true);
        try {
            if (mode === "add") {
                await dispatch(
                    createAccount({
                        userId,
                        name: name.trim(),
                        type,
                        balance: Number(balance) || 0,
                        currency,
                        icon,
                        color,
                    }),
                ).unwrap();
            } else {
                await dispatch(
                    editAccount({
                        id: account.id,
                        changes: {
                            name: name.trim(),
                            type,
                            balance: Number(balance) || 0,
                            currency,
                            icon,
                            color,
                        },
                    }),
                ).unwrap();
            }
            onClose();
        } catch (err) {
            setError(err || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const modalTitle = mode === "add" ? "Add New Account" : "Edit Account";
    const submitText = mode === "add" ? "Create Account" : "Save Changes";

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle}
        >
            <div className={styles.modal} ref={modalRef}>
                {/* ── Header ─────────────────────────────── */}
                <div className={styles.header}>
                    <h2 className={styles.title} id="account-modal-title">
                        {modalTitle}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close modal"
                        type="button"
                        id="account-modal-close"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* ── Error Banner ───────────────────────── */}
                {error && (
                    <div className={styles.errorBanner} role="alert">
                        {error}
                    </div>
                )}

                {/* ── Form ───────────────────────────────── */}
                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                    aria-labelledby="account-modal-title"
                >
                    {/* Account Name */}
                    <MainInput
                        name="accountName"
                        title="Account Name"
                        placeholder="e.g. Main Bank"
                        register={{
                            value: name,
                            onChange: (e) => setName(e.target.value),
                        }}
                        hasError={!!error && !name.trim()}
                    />

                    {/* Account Type */}
                    <div className={styles.selectWrapper}>
                        <label
                            className={styles.selectLabel}
                            htmlFor="account-type"
                        >
                            Account Type
                        </label>
                        <select
                            id="account-type"
                            className={styles.select}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            aria-label="Account type"
                        >
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Balance & Currency Row */}
                    <div className={styles.formRow}>
                        <MainInput
                            name="accountBalance"
                            title={
                                mode === "add"
                                    ? "Initial Balance"
                                    : "Balance"
                            }
                            type="number"
                            placeholder="0.00"
                            register={{
                                value: balance,
                                onChange: (e) => setBalance(e.target.value),
                            }}
                        />
                        <div className={styles.selectWrapper}>
                            <label
                                className={styles.selectLabel}
                                htmlFor="account-currency"
                            >
                                Currency
                            </label>
                            <select
                                id="account-currency"
                                className={styles.select}
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                aria-label="Currency"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div className={styles.pickerSection}>
                        <span className={styles.pickerLabel}>Icon</span>
                        <div
                            className={styles.iconGrid}
                            role="radiogroup"
                            aria-label="Choose account icon"
                        >
                            {ICON_OPTIONS.map(({ key, Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={styles.iconOption}
                                    data-selected={icon === key ? "true" : undefined}
                                    onClick={() => setIcon(key)}
                                    aria-label={key}
                                    role="radio"
                                    aria-checked={icon === key}
                                >
                                    <Icon />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className={styles.pickerSection}>
                        <span className={styles.pickerLabel}>Color</span>
                        <div
                            className={styles.colorGrid}
                            role="radiogroup"
                            aria-label="Choose account color"
                        >
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={styles.colorOption}
                                    style={{ background: c }}
                                    data-selected={
                                        color === c ? "true" : undefined
                                    }
                                    onClick={() => setColor(c)}
                                    aria-label={`Color ${c}`}
                                    role="radio"
                                    aria-checked={color === c}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <MainButton
                            action="ghost"
                            size="md"
                            title="Cancel"
                            clickEvent={onClose}
                        >
                            Cancel
                        </MainButton>
                        <MainButton
                            type="submit"
                            action="primary"
                            size="md"
                            title={submitText}
                            isLoading={submitting}
                            isDisabled={submitting}
                        >
                            {submitText}
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}

AccountModal.propTypes = {
    mode: PropTypes.oneOf(["add", "edit"]).isRequired,
    account: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default AccountModal;
