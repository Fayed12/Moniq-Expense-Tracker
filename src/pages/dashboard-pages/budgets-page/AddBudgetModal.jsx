// local
import styles from "./AddBudgetModal.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { getSelectStyles } from "../../../utils/reactSelectStyles";

// react
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

// redux
import { useDispatch } from "react-redux";
import { saveBudget, editBudget } from "../../../redux/budgetsSlice";

// gsap
import gsap from "gsap";

// react-select
import Select from "react-select";

// react-icons
import { FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { FaBoxOpen } from "react-icons/fa";
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
// ADD / EDIT BUDGET MODAL
// ════════════════════════════════════════════════════════════
function AddBudgetModal({
    type: modalType = "add",
    budgetToEdit = null,
    onClose,
    userId,
    currentMonth,
    availableCategories = [],
    onSuccess,
}) {
    const dispatch = useDispatch();
    const selectStyles = useMemo(() => getSelectStyles(), []);

    const isEdit = modalType === "edit" && budgetToEdit;

    // ── Form State ──────────────────────────────────────────
    const [limitAmount, setLimitAmount] = useState(
        isEdit ? String(budgetToEdit.limit_amount || "") : "",
    );
    const [rollover, setRollover] = useState(
        isEdit ? budgetToEdit.rollover || false : false,
    );
    const [rolloverAmount, setRolloverAmount] = useState(
        isEdit ? String(budgetToEdit.rollover_amount || "0") : "0",
    );

    // Category selection (add mode only)
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Month (editable in edit mode as well)
    const [month, setMonth] = useState(
        isEdit ? budgetToEdit.month || currentMonth : currentMonth,
    );

    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Category select options ─────────────────────────────
    const categoryOptions = useMemo(() => {
        return availableCategories.map((c) => ({
            value: c.id,
            label: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type,
            raw: c,
        }));
    }, [availableCategories]);

    // Custom Option component for category select
    const formatOptionLabel = useCallback(({ label, icon, color }) => {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: color || "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 14,
                        flexShrink: 0,
                    }}
                >
                    <DynamicIcon name={icon} />
                </span>
                <span>{label}</span>
            </div>
        );
    }, []);

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

        const limitVal = parseFloat(limitAmount);

        // Validation
        if (!isEdit && !selectedCategory) {
            setErrorMsg("Please select a category.");
            return;
        }
        if (!limitVal || limitVal <= 0) {
            setErrorMsg("Please enter a valid budget limit greater than 0.");
            return;
        }
        if (!month) {
            setErrorMsg("Please select a month.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            if (isEdit) {
                // Edit mode: update the existing budget
                const changes = {
                    limit_amount: limitVal,
                    month,
                    rollover,
                    rollover_amount: rollover
                        ? parseFloat(rolloverAmount) || 0
                        : 0,
                };
                await dispatch(
                    editBudget({ id: budgetToEdit.id, changes }),
                ).unwrap();
                setIsSubmitting(false);
                onSuccess?.("edit");
                handleClose();
            } else {
                // Add mode: upsert new budget
                const cat = selectedCategory.raw;
                const payload = {
                    userId,
                    categoryId: cat.id,
                    month,
                    limitAmount: limitVal,
                    rollover,
                    rolloverAmount: rollover
                        ? parseFloat(rolloverAmount) || 0
                        : 0,
                    categoryName: cat.name,
                    categoryIcon: cat.icon,
                    categoryColor: cat.color,
                };
                await dispatch(saveBudget(payload)).unwrap();
                setIsSubmitting(false);
                onSuccess?.("add");
                handleClose();
            }
        } catch (err) {
            console.error("Budget submit failed:", err);
            setErrorMsg(
                err.message || "Failed to save budget. Please try again.",
            );
            setIsSubmitting(false);
        }
    };

    // ── Render helpers ──────────────────────────────────────
    const modalTitle = isEdit ? "Edit Budget" : "Add Budget";
    const submitText = isEdit ? "Save Changes" : "Create Budget";

    // In edit mode, show the linked category as a preview badge
    const editCategoryPreview = isEdit ? (
        <div className={styles.categoryPreview}>
            <span
                className={styles.catIcon}
                style={{
                    background:
                        budgetToEdit.category_color ||
                        "var(--color-primary)",
                }}
            >
                <DynamicIcon name={budgetToEdit.category_icon} />
            </span>
            <div>
                <p className={styles.catName}>
                    {budgetToEdit.category_name || "Unknown Category"}
                </p>
                <p className={styles.catType}>Linked category</p>
            </div>
        </div>
    ) : null;

    // No categories available empty state (add mode only)
    const noCategoriesAvailable = !isEdit && categoryOptions.length === 0;

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
                aria-labelledby="budget-modal-title"
            >
                {/* Header */}
                <header className={styles.header}>
                    <h2 id="budget-modal-title" className={styles.title}>
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

                {/* Empty State — no categories left */}
                {noCategoriesAvailable ? (
                    <div className={styles.emptyState}>
                        <FaBoxOpen className={styles.emptyIcon} />
                        <h3 className={styles.emptyTitle}>
                            All Categories Budgeted
                        </h3>
                        <p className={styles.emptyDesc}>
                            Every active category already has a budget set for
                            this month. Create a new category first, or edit an
                            existing budget.
                        </p>
                        <MainButton
                            action="ghost"
                            size="md"
                            title="Close"
                            clickEvent={handleClose}
                        >
                            Close
                        </MainButton>
                    </div>
                ) : (
                    /* Form */
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {errorMsg && (
                            <div className={styles.errorBanner} role="alert">
                                <FiAlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>
                                    {errorMsg}
                                </span>
                            </div>
                        )}

                        {/* ── Category ────────────────────────── */}
                        {isEdit ? (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                {editCategoryPreview}
                            </div>
                        ) : (
                            <div className={styles.formGroup}>
                                <label
                                    htmlFor="budget-category"
                                    className={styles.label}
                                >
                                    Category
                                </label>
                                <Select
                                    id="budget-category"
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    styles={selectStyles}
                                    formatOptionLabel={formatOptionLabel}
                                    placeholder="Select a category..."
                                    isSearchable
                                    inputId="budget-category-input"
                                    menuPlacement="auto"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    noOptionsMessage={() =>
                                        "No categories available"
                                    }
                                />
                                <span className={styles.subLabel}>
                                    Only categories without a budget this month
                                    are shown.
                                </span>
                            </div>
                        )}

                        {/* ── Month + Limit row ──────────────── */}
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <MainInput
                                    type="month"
                                    name="budgetMonth"
                                    title="Month"
                                    register={{
                                        value: month,
                                        onChange: (e) =>
                                            setMonth(e.target.value),
                                    }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <MainInput
                                    type="number"
                                    name="budgetLimit"
                                    title="Budget Limit"
                                    placeholder="e.g. 5000"
                                    register={{
                                        value: limitAmount,
                                        onChange: (e) =>
                                            setLimitAmount(e.target.value),
                                        min: 0,
                                        step: "any",
                                    }}
                                />
                            </div>
                        </div>

                        {/* ── Rollover Toggle ────────────────── */}
                        <div className={styles.toggleRow}>
                            <div className={styles.toggleInfo}>
                                <span className={styles.toggleLabel}>
                                    Rollover Unused Budget
                                </span>
                                <span className={styles.toggleDesc}>
                                    Carry remaining funds to the next month
                                    automatically.
                                </span>
                            </div>
                            <button
                                type="button"
                                className={styles.switchTrack}
                                data-on={rollover ? "true" : undefined}
                                onClick={() => setRollover((prev) => !prev)}
                                role="switch"
                                aria-checked={rollover}
                                aria-label="Toggle budget rollover"
                            >
                                <span className={styles.switchThumb} />
                            </button>
                        </div>

                        {/* Rollover amount (shown only when on) */}
                        {rollover && (
                            <div className={styles.formGroup}>
                                <MainInput
                                    type="number"
                                    name="rolloverAmount"
                                    title="Rollover Amount"
                                    placeholder="0"
                                    register={{
                                        value: rolloverAmount,
                                        onChange: (e) =>
                                            setRolloverAmount(e.target.value),
                                        min: 0,
                                        step: "any",
                                    }}
                                />
                                <span className={styles.subLabel}>
                                    Amount carried from the previous month.
                                </span>
                            </div>
                        )}

                        {/* Warning hint */}
                        <div className={styles.warningBanner}>
                            <FiInfo className={styles.warningIcon} />
                            <span>
                                Budget limits help control spending. Categories
                                without a budget cannot be used as default for
                                new transactions.
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
                )}
            </div>
        </div>,
        document.body,
    );
}

AddBudgetModal.propTypes = {
    type: PropTypes.oneOf(["add", "edit"]),
    budgetToEdit: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    currentMonth: PropTypes.string.isRequired,
    availableCategories: PropTypes.array,
    onSuccess: PropTypes.func,
};

export default AddBudgetModal;
