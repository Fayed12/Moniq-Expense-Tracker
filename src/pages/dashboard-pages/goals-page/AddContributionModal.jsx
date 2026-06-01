// local
import styles from "./AddContributionModal.module.css";
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
import { addContribution } from "../../../redux/goalsSlice";
import { createTransaction } from "../../../redux/transactionsSlice";
import { editAccount, loadAccounts } from "../../../redux/accountsSlice";
import { editBudget } from "../../../redux/budgetsSlice";

// gsap
import gsap from "gsap";

// react-icons
import { FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ════════════════════════════════════════════════════════════
// ADD CONTRIBUTION MODAL
// ════════════════════════════════════════════════════════════
function AddContributionModal({
    goal,
    onClose,
    userId,
    accounts = [],
    defaultAccount,
    categories = [],
    budgetByCategory = {},
    spentByCategory = {},
    profile,
    currency = "EGP",
    onSuccess,
}) {
    const dispatch = useDispatch();

    // ── Form State ──────────────────────────────────────────
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    // Choose Account (Defaults to goal's linked account OR the user's default account)
    const selectedAccountId = useMemo(() => {
        if (
            goal.linked_account_id &&
            accounts.find((a) => a.id === goal.linked_account_id)
        ) {
            return goal.linked_account_id;
        }
        return defaultAccount?.id || "";
    }, [goal.linked_account_id, accounts, defaultAccount]);

    // Choose Category (Try to find a default "Savings" category, else empty)
    const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
        const savingsCat = categories.find(
            (c) => c.name.toLowerCase() === "savings" && !c.is_archived,
        );
        return savingsCat?.id || "";
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Active Account and Category objects ──────────────────
    const activeAccount = useMemo(() => {
        return accounts.find((a) => a.id === selectedAccountId) || null;
    }, [accounts, selectedAccountId]);

    const activeCategory = useMemo(() => {
        return categories.find((c) => c.id === selectedCategoryId) || null;
    }, [categories, selectedCategoryId]);

    // ── React-Select styling and options ──────────────────────
    const selectStyles = useMemo(() => getSelectStyles(), []);

    const categoryOptions = useMemo(() => {
        return categories
            .filter(
                (c) =>
                    !c.is_archived &&
                    (c.type === "expense" || c.type === "both") &&
                    c?.is_default,
            )
            .map((c) => ({
                value: c.id,
                label: `${c.name} (${c.type})`,
            }));
    }, [categories]);

    const selectedCategoryOption = useMemo(() => {
        return (
            categoryOptions.find((opt) => opt.value === selectedCategoryId) ||
            null
        );
    }, [categoryOptions, selectedCategoryId]);

    // ── Warnings calculations ───────────────────────────────
    // 1. Account balance warning
    const balanceWarning = useMemo(() => {
        if (!activeAccount) return null;
        const balance = Number(activeAccount.balance) || 0;
        const inputVal = Number(amount) || 0;

        if (balance <= 0) {
            return `Warning: Selected account balance is empty (${currency} 0.00). Please add funds or select another account.`;
        }
        if (inputVal > balance) {
            return `Warning: Insufficient balance! Selected account has only ${currency} ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`;
        }
        return null;
    }, [activeAccount, amount, currency]);

    // 1b. Over-contribution warning
    const overContributionWarning = useMemo(() => {
        const remainingGoalAmount = Math.max(
            Number(goal.target_amount || 0) - Number(goal.current_amount || 0),
            0,
        );
        const inputVal = Number(amount) || 0;

        if (inputVal > remainingGoalAmount) {
            return `Warning: You cannot contribute more than the remaining goal amount! Remaining to save: ${currency} ${remainingGoalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`;
        }
        return null;
    }, [goal.target_amount, goal.current_amount, amount, currency]);

    // 2. Profile monthly limit warning
    const profileLimitWarning = useMemo(() => {
        const limit = Number(profile?.monthly_budget_limit) || 0;
        const inputVal = Number(amount) || 0;
        if (limit <= 0) return null;

        // Sum up spent across all categories this month
        const currentSpent = Object.values(spentByCategory).reduce(
            (sum, v) => sum + v,
            0,
        );
        if (currentSpent + inputVal > limit) {
            const remaining = Math.max(limit - currentSpent, 0);
            return `Warning: Global monthly budget limit reached! Monthly limit: ${currency} ${limit.toLocaleString()} | Already spent: ${currency} ${currentSpent.toLocaleString()} | Remaining: ${currency} ${remaining.toLocaleString()}.`;
        }
        return null;
    }, [profile, spentByCategory, amount, currency]);

    // 3. Category budget warning
    const categoryBudgetWarning = useMemo(() => {
        if (!selectedCategoryId) return null;
        const budget = budgetByCategory[selectedCategoryId];
        if (!budget) return null;

        const limit = Number(budget.limit_amount) || 0;
        const currentSpent = Number(spentByCategory[selectedCategoryId]) || 0;
        const inputVal = Number(amount) || 0;

        if (currentSpent + inputVal > limit) {
            const remaining = Math.max(limit - currentSpent, 0);
            return `Warning: Category budget limit reached! Budget for ${activeCategory?.name || "Savings"}: ${currency} ${limit.toLocaleString()} | Already spent: ${currency} ${currentSpent.toLocaleString()} | Remaining: ${currency} ${remaining.toLocaleString()}.`;
        }
        return null;
    }, [
        selectedCategoryId,
        budgetByCategory,
        spentByCategory,
        amount,
        currency,
        activeCategory,
    ]);

    // 4. Missing Savings Category Warning
    const missingCategoryWarning = useMemo(() => {
        const hasSavings = categories.some(
            (c) => c.name.toLowerCase() === "savings",
        );
        if (!hasSavings && !selectedCategoryId) {
            return "Attention: No default 'Savings' category was found in your system. To track contributions properly in cash flow, please select/create an expense category.";
        }
        return null;
    }, [categories, selectedCategoryId]);

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

        const amtVal = parseFloat(amount);

        // Validation
        if (!amtVal || amtVal <= 0) {
            setErrorMsg(
                "Please enter a valid contribution amount greater than 0.",
            );
            return;
        }
        if (!selectedAccountId) {
            setErrorMsg("Please select a financial account.");
            return;
        }
        if (!selectedCategoryId) {
            setErrorMsg(
                "Please select a category to link the savings transaction.",
            );
            return;
        }
        if (!activeAccount) {
            setErrorMsg("Selected account is invalid.");
            return;
        }
        if (balanceWarning) {
            setErrorMsg(balanceWarning);
            return;
        }
        if (overContributionWarning) {
            setErrorMsg(overContributionWarning);
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            // STEP 1: Create Expense Transaction first
            const title = `Contribution: ${goal.name}`;
            const transactionPayload = {
                userId,
                title,
                amount: amtVal,
                type: "expense",
                categoryId: selectedCategoryId,
                categoryName: activeCategory?.name || "Savings",
                categoryIcon: activeCategory?.icon || "FaPiggyBank",
                categoryColor: activeCategory?.color || "#4CAF82",
                accountId: selectedAccountId,
                accountName: activeAccount.name,
                date: new Date(date).toISOString(),
                tags: ["goal", `goal:${goal.id}`],
                note: note.trim()
                    ? `Savings contribution to goal '${goal.name}'. Note: ${note.trim()}`
                    : `Savings contribution to goal '${goal.name}'.`,
            };

            const createdTx = await dispatch(
                createTransaction(transactionPayload),
            ).unwrap();

            // STEP 2: Update Account Stats
            const newBalance = Number(activeAccount.balance) - amtVal;
            const newExpense =
                Number(activeAccount.total_expense || 0) + amtVal;
            const newCount = Number(activeAccount.transaction_count || 0) + 1;

            await dispatch(
                editAccount({
                    id: selectedAccountId,
                    changes: {
                        balance: newBalance,
                        total_expense: newExpense,
                        transaction_count: newCount,
                    },
                }),
            ).unwrap();

            // STEP 3: Update Category Budget Spent if a budget is active
            const activeBudget = budgetByCategory[selectedCategoryId];
            if (activeBudget) {
                const newSpent = Number(activeBudget.spent || 0) + amtVal;
                const newRollover =
                    Number(activeBudget.rollover_amount || 0) - amtVal;
                await dispatch(
                    editBudget({
                        id: activeBudget.id,
                        changes: {
                            spent: newSpent,
                            rollover_amount: newRollover,
                        },
                    }),
                ).unwrap();
            }

            // STEP 4: Insert Contribution linked with the transaction & account
            const contributionPayload = {
                userId,
                goalId: goal.id,
                amount: amtVal,
                note: note.trim() || null,
                date: new Date(date).toISOString(),
                transactionId: createdTx.id, // linked ID
                accountId: selectedAccountId, // linked ID
            };

            await dispatch(addContribution(contributionPayload)).unwrap();

            // Reload accounts to ensure balance synchronicity
            await dispatch(loadAccounts(userId));

            setIsSubmitting(false);
            onSuccess?.(amtVal);
            handleClose();
        } catch (err) {
            console.error("Contribution submit failed:", err);
            setErrorMsg(
                err.message ||
                    "Failed to log savings contribution. Please try again.",
            );
            setIsSubmitting(false);
        }
    };

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
                aria-labelledby="contrib-modal-title"
            >
                {/* Header */}
                <header className={styles.header}>
                    <h2 id="contrib-modal-title" className={styles.title}>
                        Add Contribution
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

                {/* Goal summary info */}
                <div
                    className={styles.goalBanner}
                    style={{ borderLeftColor: goal.color }}
                >
                    <p className={styles.goalName}>{goal.name}</p>
                    <p className={styles.goalDetails}>
                        Progress: {currency}{" "}
                        {Number(goal.current_amount || 0).toLocaleString()} of{" "}
                        {currency}{" "}
                        {Number(goal.target_amount || 0).toLocaleString()} (
                        {goal.pct}%)
                    </p>
                </div>

                {/* Form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    {errorMsg && (
                        <div className={styles.errorBanner} role="alert">
                            <FiAlertTriangle className={styles.errorIcon} />
                            <span className={styles.errorText}>{errorMsg}</span>
                        </div>
                    )}

                    <div className={styles.accountHintBanner} role="status">
                        <FiInfo className={styles.hintIcon} />
                        <span>
                            Deducting automatically from{" "}
                            <strong>
                                {activeAccount?.name || "Main Account"}
                            </strong>
                            . To use a different account, edit this Savings Goal
                            itself to change its Linked Financial Account.
                        </span>
                    </div>

                    {/* Amount & Date row */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <MainInput
                                type="number"
                                name="contribAmount"
                                title="Contribution Amount"
                                placeholder="0.00"
                                register={{
                                    value: amount,
                                    onChange: (e) => setAmount(e.target.value),
                                    min: 0,
                                    step: "any",
                                    required: true,
                                }}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <MainInput
                                type="date"
                                name="contribDate"
                                title="Date"
                                register={{
                                    value: date,
                                    onChange: (e) => setDate(e.target.value),
                                    required: true,
                                }}
                            />
                        </div>
                    </div>

                    {/* Category selection */}
                    <div className={styles.formGroup}>
                        <label
                            htmlFor="contrib-category"
                            className={styles.label}
                        >
                            Link to Category
                        </label>
                        <Select
                            id="contrib-category"
                            options={categoryOptions}
                            value={selectedCategoryOption}
                            onChange={(opt) =>
                                setSelectedCategoryId(opt ? opt.value : "")
                            }
                            styles={selectStyles}
                            isSearchable={false}
                            placeholder="Select cash flow category..."
                            inputId="contrib-category-select"
                            menuPlacement="auto"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>

                    {/* Warnings list */}
                    {missingCategoryWarning && (
                        <div className={styles.warningBanner}>
                            <FiAlertTriangle className={styles.warningIcon} />
                            <span>{missingCategoryWarning}</span>
                        </div>
                    )}

                    {balanceWarning && (
                        <div
                            className={styles.warningBanner}
                            style={{
                                color: "var(--color-danger)",
                                background: "var(--color-danger-bg)",
                                borderColor: "var(--color-danger-border)",
                            }}
                        >
                            <FiAlertTriangle className={styles.warningIcon} />
                            <span>{balanceWarning}</span>
                        </div>
                    )}

                    {overContributionWarning && (
                        <div
                            className={styles.warningBanner}
                            style={{
                                color: "var(--color-danger)",
                                background: "var(--color-danger-bg)",
                                borderColor: "var(--color-danger-border)",
                            }}
                        >
                            <FiAlertTriangle className={styles.warningIcon} />
                            <span>{overContributionWarning}</span>
                        </div>
                    )}

                    {categoryBudgetWarning && (
                        <div className={styles.warningBanner}>
                            <FiInfo className={styles.warningIcon} />
                            <span>{categoryBudgetWarning}</span>
                        </div>
                    )}

                    {profileLimitWarning && !categoryBudgetWarning && (
                        <div className={styles.warningBanner}>
                            <FiInfo className={styles.warningIcon} />
                            <span>{profileLimitWarning}</span>
                        </div>
                    )}

                    {/* Note */}
                    <div className={styles.formGroup}>
                        <label htmlFor="contrib-note" className={styles.label}>
                            Note (optional)
                        </label>
                        <textarea
                            id="contrib-note"
                            placeholder="e.g. Received savings from birthday gift / rollover savings"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className={styles.textareaField}
                            rows={3}
                        />
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
                            title="Log Contribution"
                            isLoading={isSubmitting}
                            isDisabled={
                                !!balanceWarning ||
                                !!overContributionWarning ||
                                !amount ||
                                parseFloat(amount) <= 0
                            }
                        >
                            Log Contribution
                        </MainButton>
                    </footer>
                </form>
            </div>
        </div>,
        document.body,
    );
}

AddContributionModal.propTypes = {
    goal: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    accounts: PropTypes.array,
    defaultAccount: PropTypes.object,
    categories: PropTypes.array,
    budgetByCategory: PropTypes.object,
    spentByCategory: PropTypes.object,
    profile: PropTypes.object,
    currency: PropTypes.string,
    onSuccess: PropTypes.func,
};

export default AddContributionModal;
