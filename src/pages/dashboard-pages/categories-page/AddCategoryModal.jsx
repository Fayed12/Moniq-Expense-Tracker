// local
import styles from "./AddCategoryModal.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { getSelectStyles } from "../../../utils/reactSelectStyles";

// react
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

// redux
import { useDispatch } from "react-redux";
import { createCategory, editCategory } from "../../../redux/categoriesSlice";

// react-router
import { useNavigate } from "react-router";

// gsap
import gsap from "gsap";

// react-select
import Select from "react-select";

// react-icons
import { FiX, FiAlertTriangle } from "react-icons/fi";
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

// SweetAlert2
import Swal from "sweetalert2";

// prop-types
import PropTypes from "prop-types";

// ── Icon options for grid selector ──────────────────────────
const AVAILABLE_ICONS = [
    { key: "FaShoppingCart", Icon: FaShoppingCart },
    { key: "FaUtensils", Icon: FaUtensils },
    { key: "FaHome", Icon: FaHome },
    { key: "FaCar", Icon: FaCar },
    { key: "FaGamepad", Icon: FaGamepad },
    { key: "FaGraduationCap", Icon: FaGraduationCap },
    { key: "FaHeart", Icon: FaHeart },
    { key: "FaPlane", Icon: FaPlane },
    { key: "FaShieldAlt", Icon: FaShieldAlt },
    { key: "FaMoneyBillWave", Icon: FaMoneyBillWave },
    { key: "FaBriefcase", Icon: FaBriefcase },
    { key: "FaGift", Icon: FaGift },
    { key: "FaWifi", Icon: FaWifi },
    { key: "FaTshirt", Icon: FaTshirt },
    { key: "FaCoffee", Icon: FaCoffee },
    { key: "FaDumbbell", Icon: FaDumbbell },
    { key: "FaBook", Icon: FaBook },
    { key: "FaPills", Icon: FaPills },
    { key: "FaEllipsisH", Icon: FaEllipsisH },
];

// ── Color options ───────────────────────────────────────────
const COLOR_PALETTE = [
    "#A0522D", "#8b4423", "#6b3218", "#c08050",
    "#d4a87a", "#3d8c5a", "#2471a3", "#7b68ee",
    "#c0392b", "#b07d1a", "#e74c3c", "#2ecc71",
    "#3498db", "#9b59b6", "#1abc9c", "#e67e22",
];

// ── Type options ────────────────────────────────────────────
const TYPE_OPTIONS = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "both", label: "Both (Income & Expense)" },
];

// ════════════════════════════════════════════════════════════
// ADD / EDIT CATEGORY MODAL
// ════════════════════════════════════════════════════════════
function AddCategoryModal({
    type: modalType = "add",
    categoryToEdit = null,
    onClose,
    userId,
    onSuccess,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const selectStyles = useMemo(() => getSelectStyles(), []);

    const isEdit = modalType === "edit" && categoryToEdit;

    // ── Form State ──────────────────────────────────────────
    const [name, setName] = useState(isEdit ? categoryToEdit.name : "");
    const [selectedIcon, setSelectedIcon] = useState(isEdit ? categoryToEdit.icon : "FaEllipsisH");
    const [selectedColor, setSelectedColor] = useState(isEdit ? categoryToEdit.color : "#A0522D");
    const [typeOption, setTypeOption] = useState(() => {
        if (isEdit) {
            return TYPE_OPTIONS.find((t) => t.value === categoryToEdit.type) || TYPE_OPTIONS[0];
        }
        return TYPE_OPTIONS[0];
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Animation Refs ──────────────────────────────────────
    const overlayRef = useRef(null);
    const modalRef = useRef(null);
    const nameInputRef = useRef(null);

    // ── GSAP Entrance Animation ─────────────────────────────
    useEffect(() => {
        const overlay = overlayRef.current;
        const modal = modalRef.current;
        if (!overlay || !modal) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) {
            if (nameInputRef.current) nameInputRef.current.focus();
            return;
        }

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

        // Focus field
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }

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
        if (!name.trim()) {
            setErrorMsg("Please enter a category name.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            if (isEdit) {
                const changes = {
                    name: name.trim(),
                    icon: selectedIcon,
                    color: selectedColor,
                    type: typeOption.value,
                };
                await dispatch(editCategory({ id: categoryToEdit.id, changes })).unwrap();
                setIsSubmitting(false);
                onSuccess("edit");
                handleClose();
            } else {
                const payload = {
                    userId,
                    name: name.trim(),
                    icon: selectedIcon,
                    color: selectedColor,
                    type: typeOption.value,
                    isDefault: false, 
                    is_archived: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                const newCat = await dispatch(createCategory(payload)).unwrap();
                setIsSubmitting(false);
                handleClose();

                // Alert the user to go to budget page for budget set up
                const baseStyles = {
                    background: getComputedStyle(document.documentElement).getPropertyValue("--color-bg-elevated").trim() || "#ffffff",
                    color: getComputedStyle(document.documentElement).getPropertyValue("--color-text-primary").trim() || "#2d1409",
                    confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#a0522d",
                    cancelButtonColor: getComputedStyle(document.documentElement).getPropertyValue("--color-text-muted").trim() || "#a0522d",
                };

                Swal.fire({
                    ...baseStyles,
                    title: "Category Created Successfully!",
                    html: `Category <strong>"${newCat.name}"</strong> has been added.<br><br><span style="color: var(--color-warning); font-weight: 600;">Important reminder:</span> You should go to the Budgets page to set a monthly limit for this category, <br> This category will not work for now, until you set a budget for it`,
                    icon: "success",
                    showCancelButton: true,
                    confirmButtonText: "Go to Budgets",
                    cancelButtonText: "I'll do it later",
                    reverseButtons: true,
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/dashboard/budgets");
                    }
                });
            }
        } catch (err) {
            console.error("Submit failed:", err);
            setErrorMsg(err.message || "Failed to save category. Please try again.");
            setIsSubmitting(false);
        }
    };

    const modalTitle = isEdit ? "Edit Category" : "Add Category";
    const submitText = isEdit ? "Save Changes" : "Create Category";

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
                aria-labelledby="category-modal-title"
            >
                {/* Header */}
                <header className={styles.header}>
                    <h2 id="category-modal-title" className={styles.title}>
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
                    {!isEdit && (
                        <div className={styles.warningBanner} role="note">
                            <FiAlertTriangle className={styles.warningIcon} />
                            <span className={styles.warningText}>
                                <strong>Important:</strong> After creating this category, go to the <strong>Budgets</strong> page to assign it a monthly limit. To activate and set it default for new transactions, click the star icon on the list.
                            </span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className={styles.errorBanner} role="alert">
                            <FiAlertTriangle className={styles.errorIcon} />
                            <span className={styles.errorText}>{errorMsg}</span>
                        </div>
                    )}

                    <div className={styles.row}>
                        {/* Name input */}
                        <div className={styles.formGroup}>
                            <MainInput
                                ref={nameInputRef}
                                name="categoryName"
                                title="Category Name"
                                placeholder="e.g. Shopping"
                                register={{
                                    value: name,
                                    onChange: (e) => setName(e.target.value),
                                }}
                            />
                        </div>

                        {/* Type Select */}
                        <div className={styles.formGroup}>
                            <label htmlFor="cat-type" className={styles.label}>
                                Category Type
                            </label>
                            <Select
                                id="cat-type"
                                options={TYPE_OPTIONS}
                                value={typeOption}
                                onChange={setTypeOption}
                                styles={selectStyles}
                                isSearchable={false}
                                inputId="cat-type-input"
                                menuPlacement="auto"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                            />
                        </div>
                    </div>

                    {/* Icon Picker (Simplified style matching AccountModal) */}
                    <div className={styles.pickerSection}>
                        <span className={styles.pickerLabel}>Icon</span>
                        <div
                            className={styles.iconGrid}
                            role="radiogroup"
                            aria-label="Choose category icon"
                        >
                            {AVAILABLE_ICONS.map(({ key, Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={styles.iconOption}
                                    data-selected={selectedIcon === key ? "true" : undefined}
                                    onClick={() => setSelectedIcon(key)}
                                    aria-label={key}
                                    role="radio"
                                    aria-checked={selectedIcon === key}
                                >
                                    <Icon />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker (Simplified style matching AccountModal) */}
                    <div className={styles.pickerSection}>
                        <span className={styles.pickerLabel}>Color</span>
                        <div
                            className={styles.colorGrid}
                            role="radiogroup"
                            aria-label="Choose category color"
                        >
                            {COLOR_PALETTE.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={styles.colorOption}
                                    style={{ background: c }}
                                    data-selected={selectedColor === c ? "true" : undefined}
                                    onClick={() => setSelectedColor(c)}
                                    aria-label={`Color ${c}`}
                                    role="radio"
                                    aria-checked={selectedColor === c}
                                />
                            ))}
                        </div>
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

AddCategoryModal.propTypes = {
    type: PropTypes.oneOf(["add", "edit"]),
    categoryToEdit: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
};

export default AddCategoryModal;
