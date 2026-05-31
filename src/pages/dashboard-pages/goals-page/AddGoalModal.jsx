// local
import styles from "./AddGoalModal.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";

// react
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

// react-select
import Select from "react-select";
import { getSelectStyles } from "../../../utils/reactSelectStyles";

// redux
import { useDispatch } from "react-redux";
import { createGoal, editGoal } from "../../../redux/goalsSlice";

// gsap
import gsap from "gsap";

// react-icons
import { FiX, FiAlertTriangle, FiInfo, FiCheck } from "react-icons/fi";
import {
    FaFlag,
    FaHome,
    FaCar,
    FaShieldAlt,
    FaLaptop,
    FaPlane,
    FaGamepad,
    FaGraduationCap,
    FaHeart,
    FaBriefcase,
    FaShoppingBag,
    FaGift,
    FaDollarSign,
    FaPiggyBank,
    FaEllipsisH,
} from "react-icons/fa";

// prop-types
import PropTypes from "prop-types";

// ── Icons grid options ───────────────────────────────────────
const ICON_MAP = {
    FaFlag,
    FaHome,
    FaCar,
    FaShieldAlt,
    FaLaptop,
    FaPlane,
    FaGamepad,
    FaGraduationCap,
    FaHeart,
    FaBriefcase,
    FaShoppingBag,
    FaGift,
    FaDollarSign,
    FaPiggyBank,
    FaEllipsisH,
};

const DYNAMIC_COLORS = [
    "#a0522d", // sienna — primary brand
    "#c08050", // warm brown
    "#3d8c5a", // success green
    "#b07d1a", // warning gold
    "#c0392b", // sienna red
    "#2471a3", // info blue
    "#7b68ee", // transfer purple
    "#4CAF82", // secondary emerald
    "#9c7a5c", // muted sienna
];

function DynamicIcon({ name, ...props }) {
    const IconComp = ICON_MAP[name] || FaFlag;
    return <IconComp {...props} />;
}

// ════════════════════════════════════════════════════════════
// ADD / EDIT GOAL MODAL
// ════════════════════════════════════════════════════════════
function AddGoalModal({
    type: modalType = "add",
    goalToEdit = null,
    onClose,
    userId,
    accounts = [],
    onSuccess,
}) {
    const dispatch = useDispatch();
    const isEdit = modalType === "edit" && goalToEdit;
    const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

    // ── Form State ──────────────────────────────────────────
    const [name, setName] = useState(isEdit ? goalToEdit.name || "" : "");
    const [description, setDescription] = useState(
        isEdit ? goalToEdit.description || "" : "",
    );
    const [targetAmount, setTargetAmount] = useState(
        isEdit ? String(goalToEdit.target_amount || "") : "",
    );
    const [deadline, setDeadline] = useState(
        isEdit && goalToEdit.deadline
            ? new Date(goalToEdit.deadline).toISOString().slice(0, 10)
            : "",
    );
    const [color, setColor] = useState(
        isEdit ? goalToEdit.color || DYNAMIC_COLORS[0] : DYNAMIC_COLORS[0],
    );
    const [icon, setIcon] = useState(
        isEdit ? goalToEdit.icon || "FaFlag" : "FaFlag",
    );
    const [isPaused, setIsPaused] = useState(
        isEdit ? goalToEdit.is_paused || false : false,
    );
    const [linkedAccountId, setLinkedAccountId] = useState(
        isEdit ? goalToEdit.linked_account_id || "" : "",
    );

    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── React-Select styling and options ──────────────────────
    const selectStyles = useMemo(() => getSelectStyles(), []);

    const accountOptions = useMemo(() => {
        return [
            { value: "", label: "No linked account (general fund)" },
            ...accounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} — Balance: ${acc.currency} ${Number(acc.balance).toLocaleString()}`,
            })),
        ];
    }, [accounts]);

    const selectedAccountOption = useMemo(() => {
        return (
            accountOptions.find((opt) => opt.value === linkedAccountId) ||
            accountOptions[0]
        );
    }, [accountOptions, linkedAccountId]);

    // ── Animation Refs ──────────────────────────────────────
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    // ── GSAP Entrance Animation ─────────────────────────────
    useEffect(() => {
        const overlay = overlayRef.current;
        const modal = modalRef.current;
        if (!overlay || !modal) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.from(overlay, {
                opacity: 0,
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.from(modal, {
                scale: 0.92,
                opacity: 0,
                y: 20,
                duration: 0.35,
                ease: "back.out(1.4)",
                delay: 0.05,
            });
        });

        // Scroll lock
        document.body.style.overflow = "hidden";

        return () => {
            ctx.revert();
            document.body.style.overflow = "";
        };
    }, []);

    // ── Close Animation ─────────────────────────────────────
    const handleClose = useCallback(() => {
        const overlay = overlayRef.current;
        const modal = modalRef.current;
        if (!overlay || !modal) {
            onClose();
            return;
        }

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) {
            onClose();
            return;
        }

        gsap.to(modal, {
            scale: 0.92,
            opacity: 0,
            y: 15,
            duration: 0.2,
            ease: "power2.in",
        });
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: onClose,
        });
    }, [onClose]);

    // ── Escape Key Listener ─────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose]);

    // ── Form Submit ─────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const targetVal = parseFloat(targetAmount);

        // Validation
        if (!name.trim()) {
            setErrorMsg("Please enter a goal name.");
            return;
        }
        if (!targetVal || targetVal <= 0) {
            setErrorMsg("Please enter a valid target amount greater than 0.");
            return;
        }

        if (deadline) {
            const selectedDate = new Date(deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // compare only date parts
            if (selectedDate < today) {
                setErrorMsg("Target Date cannot be in the past.");
                return;
            }
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            if (isEdit) {
                // Edit mode: update existing goal
                // Re-calculate is_completed if target amount changed
                const currentAmt = Number(goalToEdit.current_amount || 0);
                const isCompleted = currentAmt >= targetVal;

                // Spreads CHANGES object directly in supabase update — must use snake_case
                const changes = {
                    name: name.trim(),
                    description: description.trim() || null,
                    target_amount: targetVal,
                    deadline: deadline
                        ? new Date(deadline).toISOString()
                        : null,
                    color,
                    icon,
                    is_paused: isPaused,
                    is_completed: isCompleted,
                    completed_at: isCompleted
                        ? goalToEdit.completed_at || new Date().toISOString()
                        : null,
                    linked_account_id: linkedAccountId || null,
                };

                await dispatch(
                    editGoal({ id: goalToEdit.id, changes }),
                ).unwrap();
                setIsSubmitting(false);
                onSuccess?.("edit");
                handleClose();
            } else {
                // Add mode: insert new goal (using camelCase payload)
                const payload = {
                    userId,
                    name: name.trim(),
                    description: description.trim() || null,
                    targetAmount: targetVal,
                    deadline: deadline
                        ? new Date(deadline).toISOString()
                        : null,
                    color,
                    icon,
                    linkedAccountId: linkedAccountId || null,
                };
                await dispatch(createGoal(payload)).unwrap();
                setIsSubmitting(false);
                onSuccess?.("add");
                handleClose();
            }
        } catch (err) {
            console.error("Goal submit failed:", err);
            setErrorMsg(
                err.message || "Failed to save savings goal. Please try again.",
            );
            setIsSubmitting(false);
        }
    };

    // ── Render helpers ──────────────────────────────────────
    const modalTitle = isEdit ? "Edit Goal" : "Add Goal";
    const submitText = isEdit ? "Save Changes" : "Create Goal";

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && handleClose()}
            role="presentation"
        >
            <div
                className={styles.modal}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="goal-modal-title"
            >
                {/* Header */}
                <header className={styles.header}>
                    <h2 id="goal-modal-title" className={styles.title}>
                        {modalTitle}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={handleClose}
                        aria-label="Close modal"
                        type="button"
                    >
                        <FiX />
                    </button>
                </header>

                {/* Form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    {errorMsg && (
                        <div className={styles.errorBanner} role="alert">
                            <FiAlertTriangle className={styles.errorIcon} />
                            <span className={styles.errorText}>{errorMsg}</span>
                        </div>
                    )}

                    {/* Name */}
                    <div className={styles.formGroup}>
                        <MainInput
                            type="text"
                            name="goalName"
                            title="Goal Name"
                            placeholder="e.g. Dream Vacation Fund"
                            register={{
                                value: name,
                                onChange: (e) => setName(e.target.value),
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                        <MainInput
                            type="text"
                            name="goalDesc"
                            title="Short Description (optional)"
                            placeholder="e.g. Saving for flight tickets and lodging"
                            register={{
                                value: description,
                                onChange: (e) => setDescription(e.target.value),
                            }}
                        />
                    </div>

                    {/* Target Amount + Deadline Row */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <MainInput
                                type="number"
                                name="goalTarget"
                                title="Target Amount"
                                placeholder="e.g. 50000"
                                register={{
                                    value: targetAmount,
                                    onChange: (e) =>
                                        setTargetAmount(e.target.value),
                                    min: 0,
                                    step: "any",
                                }}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <MainInput
                                type="date"
                                name="goalDeadline"
                                title="Target Date"
                                register={{
                                    value: deadline,
                                    onChange: (e) =>
                                        setDeadline(e.target.value),
                                    min: todayStr,
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Linked Account selection (add mode only or read-only edit) ────────────────────────── */}
                    <div className={styles.formGroup}>
                        <label htmlFor="goal-account" className={styles.label}>
                            Linked Financial Account
                        </label>
                        <Select
                            id="goal-account"
                            options={accountOptions}
                            value={selectedAccountOption}
                            onChange={(opt) =>
                                setLinkedAccountId(opt ? opt.value : "")
                            }
                            styles={selectStyles}
                            isSearchable={false}
                            placeholder="No linked account (general fund)"
                            inputId="goal-account-select"
                            menuPlacement="auto"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                        <span className={styles.subLabel}>
                            Money saved inside this goal will be considered
                            linked to this account balance.
                        </span>
                    </div>

                    {/* ── Icon Selection Grid ──────────────────── */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Select Visual Icon
                        </label>
                        <div className={styles.iconGrid}>
                            {Object.keys(ICON_MAP).map((iconName) => (
                                <button
                                    key={iconName}
                                    type="button"
                                    className={styles.iconSelector}
                                    data-active={
                                        icon === iconName ? "true" : undefined
                                    }
                                    onClick={() => setIcon(iconName)}
                                    aria-label={`Select icon ${iconName}`}
                                    style={{
                                        borderColor:
                                            icon === iconName
                                                ? color
                                                : "transparent",
                                        background:
                                            icon === iconName
                                                ? `${color}15`
                                                : "var(--glass-bg-subtle)",
                                        color:
                                            icon === iconName
                                                ? color
                                                : "var(--color-text-muted)",
                                    }}
                                >
                                    <DynamicIcon name={iconName} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Color Selection Palette ───────────────── */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Select Badge Color
                        </label>
                        <div className={styles.colorPalette}>
                            {DYNAMIC_COLORS.map((paletteColor) => (
                                <button
                                    key={paletteColor}
                                    type="button"
                                    className={styles.colorCircle}
                                    onClick={() => setColor(paletteColor)}
                                    style={{ background: paletteColor }}
                                    aria-label={`Select color ${paletteColor}`}
                                >
                                    {color === paletteColor && (
                                        <FiCheck className={styles.checkIcon} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Paused Toggle (Edit mode only) ────────── */}
                    {isEdit && (
                        <div className={styles.toggleRow}>
                            <div className={styles.toggleInfo}>
                                <span className={styles.toggleLabel}>
                                    Pause Savings Goal
                                </span>
                                <span className={styles.toggleDesc}>
                                    Temporary freeze contributions and hide "+
                                    Add Contribution" buttons.
                                </span>
                            </div>
                            <button
                                type="button"
                                className={styles.switchTrack}
                                data-on={isPaused ? "true" : undefined}
                                onClick={() => setIsPaused((prev) => !prev)}
                                role="switch"
                                aria-checked={isPaused}
                                aria-label="Toggle pause savings goal"
                            >
                                <span className={styles.switchThumb} />
                            </button>
                        </div>
                    )}

                    {/* Info banner */}
                    <div className={styles.warningBanner}>
                        <FiInfo className={styles.warningIcon} />
                        <span>
                            Defining clear target budgets and deadline dates
                            keeps you motivated. Automated suggestions are
                            calculated based on these values.
                        </span>
                    </div>

                    {/* Actions */}
                    <footer className={styles.footer}>
                        <MainButton
                            action="ghost"
                            size="md"
                            title="Cancel and close"
                            clickEvent={handleClose}
                            isDisabled={isSubmitting}
                        >
                            Cancel
                        </MainButton>
                        <MainButton
                            type="submit"
                            action="primary"
                            size="md"
                            title={submitText}
                            isLoading={isSubmitting}
                        >
                            {submitText}
                        </MainButton>
                    </footer>
                </form>
            </div>
        </div>,
        document.body,
    );
}

AddGoalModal.propTypes = {
    type: PropTypes.oneOf(["add", "edit"]),
    goalToEdit: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    accounts: PropTypes.array,
    onSuccess: PropTypes.func,
};

export default AddGoalModal;
