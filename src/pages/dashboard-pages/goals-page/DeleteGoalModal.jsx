// local
import styles from "./DeleteGoalModal.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { getSelectStyles } from "../../../utils/reactSelectStyles";

// react
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

// redux
import { useDispatch } from "react-redux";
import { removeGoal } from "../../../redux/goalsSlice";
import {
    removeTransactions,
    createTransaction,
} from "../../../redux/transactionsSlice";
import { editAccount, loadAccounts } from "../../../redux/accountsSlice";
import { editBudget } from "../../../redux/budgetsSlice";
import { supabase } from "../../../config/supabase";

// gsap
import gsap from "gsap";

// react-select
import Select from "react-select";

// react-icons
import { FiX, FiAlertTriangle, FiTrash2, FiInfo } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ── Deletion Options ──────────────────────────────────────────
const DELETE_OPTIONS = [
    {
        value: "refund",
        label: "Delete Goal & Refund all saved money to account",
        desc: "Recommended. Restores EGP X back to your default account balance. Wipes out related expense records and creates an income 'Refund' transaction.",
    },
    {
        value: "delete-only",
        label: "Delete Goal Only (Keep cash flow history as is)",
        desc: "Warning. Permanently deletes the goal and its contributions. Saved money will NOT be added back to your balance, and transaction history will remain unchanged.",
    },
];

// ════════════════════════════════════════════════════════════
// DELETE Savings Goal Modal
// ════════════════════════════════════════════════════════════
function DeleteGoalModal({
    goal,
    contributions = [],
    onClose,
    userId,
    defaultAccount,
    budgetByCategory = {},
    currency = "EGP",
    onSuccess,
}) {
    const dispatch = useDispatch();
    const selectStyles = useMemo(() => getSelectStyles(), []);

    // ── Form State ──────────────────────────────────────────
    const [deleteOption, setDeleteOption] = useState(DELETE_OPTIONS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Calculate total amount to refund
    const refundAmount = Number(goal.current_amount || 0);

    // ── Custom Option rendering for select ───────────────────
    const formatOptionLabel = useCallback(({ label }) => {
        return (
            <span style={{ fontWeight: "var(--weight-medium)" }}>{label}</span>
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

    // ── Confirm Delete Action ────────────────────────────────
    const handleConfirm = async () => {
        if (!defaultAccount) {
            setErrorMsg(
                "No default financial account detected. Please configure one in Accounts page.",
            );
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            if (deleteOption.value === "refund") {
                // MODE A: REFUND SAVED MONEY
                // 1. Gather all linked transaction IDs from contributions and search Supabase by tag
                const contribTxIds = contributions
                    .map((c) => c.transaction_id)
                    .filter(Boolean);

                // Fetch transactions with tag goal:${goal.id} from Supabase just in case some are untagged in raw lists
                const { data: taggedTx } = await supabase
                    .from("transactions")
                    .select("id, amount, category_id")
                    .eq("uid", userId)
                    .overlaps("tags", [`goal:${goal.id}`]);

                const taggedTxIds = taggedTx ? taggedTx.map((t) => t.id) : [];
                const allTxIdsToDelete = Array.from(
                    new Set([...contribTxIds, ...taggedTxIds]),
                );

                // 2. WIPE OUT related transactions from DB
                if (allTxIdsToDelete.length > 0) {
                    await dispatch(
                        removeTransactions(allTxIdsToDelete),
                    ).unwrap();

                    // Revert budget impacts for each deleted transaction
                    for (const tx of taggedTx || []) {
                        if (
                            tx.category_id &&
                            budgetByCategory[tx.category_id]
                        ) {
                            const budget = budgetByCategory[tx.category_id];
                            const txAmount = Number(tx.amount || 0);
                            await dispatch(
                                editBudget({
                                    id: budget.id,
                                    changes: {
                                        spent: Math.max(
                                            Number(budget.spent || 0) -
                                                txAmount,
                                            0,
                                        ),
                                        rollover_amount:
                                            Number(
                                                budget.rollover_amount || 0,
                                            ) + txAmount,
                                    },
                                }),
                            ).unwrap();
                        }
                    }
                }

                // 3. Update account stats
                // balance = balance + refundAmount
                // total_income = total_income + refundAmount
                // total_expense = total_expense - refundAmount
                // transaction_count = transaction_count - allTxIdsToDelete.length
                const newBalance =
                    Number(defaultAccount.balance) + refundAmount;
                const newIncome =
                    Number(defaultAccount.total_income || 0) + refundAmount;
                const newExpense = Math.max(
                    Number(defaultAccount.total_expense || 0) - refundAmount,
                    0,
                );
                const newTxCount = Math.max(
                    Number(defaultAccount.transaction_count || 0) -
                        allTxIdsToDelete.length +
                        1, // +1 for the Refund transaction
                    0,
                );

                await dispatch(
                    editAccount({
                        id: defaultAccount.id,
                        changes: {
                            balance: newBalance,
                            total_income: newIncome,
                            total_expense: newExpense,
                            transaction_count: newTxCount,
                        },
                    }),
                ).unwrap();

                // 4. Record refund transaction as INCOME
                const refundTxPayload = {
                    userId,
                    title: `Refund: ${goal.name}`,
                    amount: refundAmount,
                    type: "income",
                    categoryId: contributions[0]?.category_id || null,
                    categoryName: "Refund",
                    categoryIcon: "FaPiggyBank",
                    categoryColor: "#3d8c5a",
                    accountId: defaultAccount.id,
                    accountName: defaultAccount.name,
                    date: new Date().toISOString(),
                    tags: ["refund", `goal:${goal.id}`],
                    note: `Refunded saved balance of ${currency} ${refundAmount} from deleted goal '${goal.name}'.`,
                };

                await dispatch(createTransaction(refundTxPayload)).unwrap();
            } else {
                // MODE B: DELETE ONLY
                // In delete-only mode, we permanently delete the goal and contributions,
                // but keep transaction records and account balances untouched as requested.
            }

            // Delete Contributions explicitly from DB to avoid any foreign constraints
            await supabase
                .from("goal_contributions")
                .delete()
                .eq("goal_id", goal.id);

            // 5. Delete Goal itself
            await dispatch(removeGoal(goal.id)).unwrap();

            // Reload accounts to ensure balance synchronicity
            await dispatch(loadAccounts(userId));

            setIsSubmitting(false);
            onSuccess?.(deleteOption.value);
            handleClose();
        } catch (err) {
            console.error("Goal deletion failed:", err);
            setErrorMsg(
                err.message ||
                    "Something went wrong while deleting. Please try again.",
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
                aria-labelledby="delete-goal-title"
            >
                {/* Header */}
                <header className={styles.header}>
                    <h2 id="delete-goal-title" className={styles.title}>
                        Delete Savings Goal
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

                {/* Content info */}
                <div className={styles.warningCard}>
                    <FiAlertTriangle className={styles.warningIcon} />
                    <div>
                        <h3 className={styles.warningTitle}>
                            Are you absolutely sure?
                        </h3>
                        <p className={styles.warningDesc}>
                            You are about to delete{" "}
                            <strong>"{goal.name}"</strong> permanently. This
                            goal contains{" "}
                            <strong>
                                {currency} {refundAmount.toLocaleString()}
                            </strong>{" "}
                            accumulated over{" "}
                            <strong>
                                {goal.contribution_count || 0} contributions
                            </strong>
                            .
                        </p>
                    </div>
                </div>

                {errorMsg && (
                    <div className={styles.errorBanner} role="alert">
                        <FiAlertTriangle className={styles.errorIcon} />
                        <span className={styles.errorText}>{errorMsg}</span>
                    </div>
                )}

                {/* React select option dropdown */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Deletion Method</label>
                    <Select
                        options={DELETE_OPTIONS}
                        value={deleteOption}
                        onChange={setDeleteOption}
                        styles={selectStyles}
                        formatOptionLabel={formatOptionLabel}
                        isSearchable={false}
                        inputId="delete-goal-options"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Selected option details description */}
                <div
                    className={styles.detailsCard}
                    data-type={deleteOption.value}
                >
                    <FiInfo className={styles.infoIcon} />
                    <p className={styles.detailsText}>
                        {deleteOption.value === "refund"
                            ? `This option will return ${currency} ${refundAmount.toLocaleString()} back to your default account ("${defaultAccount?.name || "Main Account"}"). It increases your balance and total income, and decreases total expenses. All historical savings transaction records for this goal will be purged.`
                            : `This option deletes the goal and its logs permanently. The ${currency} ${refundAmount.toLocaleString()} already saved is considered "spent" and will NOT be added back to your bank balance. No historical transaction records will be modified.`}
                    </p>
                </div>

                {/* Actions */}
                <footer className={styles.footer}>
                    <MainButton
                        action="ghost"
                        size="md"
                        title="Cancel"
                        clickEvent={handleClose}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </MainButton>
                    <MainButton
                        action="danger"
                        size="md"
                        title="Confirm Deletion"
                        clickEvent={handleConfirm}
                        isLoading={isSubmitting}
                    >
                        <FiTrash2 style={{ marginRight: "6px" }} /> Confirm
                        Deletion
                    </MainButton>
                </footer>
            </div>
        </div>,
        document.body,
    );
}

DeleteGoalModal.propTypes = {
    goal: PropTypes.object.isRequired,
    contributions: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    defaultAccount: PropTypes.object,
    budgetByCategory: PropTypes.object,
    currency: PropTypes.string,
    onSuccess: PropTypes.func,
};

export default DeleteGoalModal;
