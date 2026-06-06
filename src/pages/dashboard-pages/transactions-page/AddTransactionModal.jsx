// local
import styles from "./AddTransactionModal.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { getSelectStyles } from "../../../utils/reactSelectStyles";
import { checkBudgetAlert, checkLowBalance } from "../../../services/Notifications/NotificationTriggers";

// react
import { useState, useEffect, useRef, useCallback, useMemo, forwardRef } from "react";
import { createPortal } from "react-dom";

// redux
import { useDispatch } from "react-redux";
import { createTransaction, editTransaction } from "../../../redux/transactionsSlice";
import { loadAccounts, editAccount } from "../../../redux/accountsSlice";
import { editBudget } from "../../../redux/budgetsSlice";

// gsap
import gsap from "gsap";

// react-select
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

// react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// react-icons
import { FiX, FiAlertTriangle } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ── Type options ────────────────────────────────────────────
const TYPE_OPTIONS = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
];

// ── Custom date input ───────────────────────────────────
const DateInput = forwardRef(({ value, onClick }, ref) => (
    <input
        ref={ref}
        className={styles.textarea}
        style={{ minHeight: "auto", height: "var(--input-height)", cursor: "pointer", resize: "none" }}
        onClick={onClick}
        value={value}
        readOnly
        placeholder="Select date"
        aria-label="Transaction date"
        id="add-txn-date"
    />
));
DateInput.displayName = "DateInput";

// ════════════════════════════════════════════════════════════
// ADD TRANSACTION MODAL
// ════════════════════════════════════════════════════════════
function AddTransactionModal({
    type: modalType = "add",
    transactionToEdit = null,
    onClose,
    defaultAccount,
    categories = [],
    userId,
    currency = "EGP",
    uniqueTags = [],
    budgetByCategory = {},
    spentByCategory = {},
    profile,
    onSuccess,
}) {
    const dispatch = useDispatch();
    const selectStyles = useMemo(() => getSelectStyles(), []);

    const isEdit = modalType === "edit" && transactionToEdit;

    // ── Form state ──────────────────────────────────────────
    const [title, setTitle] = useState(isEdit ? transactionToEdit.title : "");
    const [amount, setAmount] = useState(isEdit ? String(transactionToEdit.amount) : "");
    const [type, setType] = useState(
        isEdit 
            ? TYPE_OPTIONS.find((t) => t.value === transactionToEdit.type) || TYPE_OPTIONS[0]
            : TYPE_OPTIONS[0]
    );
    const [category, setCategory] = useState(() => {
        if (isEdit) {
            const cat = categories.find((c) => 
                (transactionToEdit.category_id && String(c.id) === String(transactionToEdit.category_id)) ||
                (transactionToEdit.category_name && c.name === transactionToEdit.category_name)
            );
            if (cat) return { value: cat.id, label: cat.name, icon: cat.icon, color: cat.color };
        }
        return null;
    });
    const [date, setDate] = useState(isEdit ? new Date(transactionToEdit.date) : new Date());
    const [tags, setTags] = useState(
        isEdit && transactionToEdit.tags
            ? transactionToEdit.tags.map((t) => ({ value: t, label: t }))
            : []
    );
    const [note, setNote] = useState(isEdit ? transactionToEdit.note || "" : "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ── Refs ────────────────────────────────────────────────
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    // ── Category options ────────────────────────────────────
    const categoryOptions = useMemo(
        () =>
            categories
                .filter((c) => !type?.value || c.type === type.value)
                .map((c) => ({
                    value: c.id,
                    label: c.name,
                    icon: c.icon,
                    color: c.color,
                })),
        [categories, type],
    );

    // ── Handle type change ──────────────────────────────────
    const handleTypeChange = useCallback((newType) => {
        setType(newType);
        setCategory(null); // Reset category when type changes
    }, []);

    // ── Tag options for creatable select ─────────────────────
    const tagOptions = useMemo(
        () => uniqueTags.map((t) => ({ value: t, label: t })),
        [uniqueTags],
    );

    // ── Budget validation ───────────────────────────────────
    const budgetWarning = useMemo(() => {
        if (type?.value !== "expense") return null;

        const newAmount = Number(amount) || 0;

        // 1. Check Global Monthly Budget Limit
        const globalLimit = Number(profile?.monthly_budget_limit) || 0;
        if (globalLimit > 0) {
            let totalSpentThisMonth = Object.values(spentByCategory).reduce((sum, val) => sum + val, 0);
            
            // If editing, subtract old amount so we don't double count it
            if (isEdit && transactionToEdit.type === "expense") {
                totalSpentThisMonth -= Number(transactionToEdit.amount) || 0;
            }

            const remainingGlobal = globalLimit - totalSpentThisMonth;
            if (newAmount > remainingGlobal) {
                return `Global budget limit exceeded! Monthly limit: ${currency} ${globalLimit.toLocaleString()} | Already spent: ${currency} ${totalSpentThisMonth.toLocaleString()} | Remaining: ${currency} ${Math.max(remainingGlobal, 0).toLocaleString()}`;
            }
        }

        // 2. Check Category-Specific Budget Limit
        if (!category?.value) return null;

        const budget = budgetByCategory[category.value];
        if (!budget) return null;

        let alreadySpentCat = spentByCategory[category.value] || 0;

        // If editing and the category is the same, subtract the old amount so we don't double count it
        if (isEdit && transactionToEdit.type === "expense" && transactionToEdit.category_id === category.value) {
            alreadySpentCat -= Number(transactionToEdit.amount) || 0;
        }

        const remainingCat = Number(budget.limit_amount) - alreadySpentCat;

        if (newAmount > remainingCat) {
            return `Budget limit exceeded! ${category.label} budget: ${currency} ${Number(budget.limit_amount).toLocaleString()} | Already spent: ${currency} ${alreadySpentCat.toLocaleString()} | Remaining: ${currency} ${Math.max(remainingCat, 0).toLocaleString()}`;
        }
        
        return null;
    }, [type, category, amount, budgetByCategory, spentByCategory, currency, isEdit, transactionToEdit, profile]);

    // ── Account balance validation ──────────────────────────
    const balanceWarning = useMemo(() => {
        if (type?.value !== "expense" || !defaultAccount) return null;

        const balance = Number(defaultAccount.balance) || 0;
        const newAmount = Number(amount) || 0;

        if (newAmount > balance) {
            return `Insufficient balance! Account balance: ${currency} ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }
        return null;
    }, [type, amount, defaultAccount, currency]);

    // ── GSAP entrance ───────────────────────────────────────
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

    // ── Lock body scroll ────────────────────────────────────
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    // ── Close on Escape ─────────────────────────────────────
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



    // ── Submit ──────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!title.trim()) {
            setError("Title is required.");
            return;
        }
        if (!amount || Number(amount) <= 0) {
            setError("Enter a valid amount greater than 0.");
            return;
        }
        if (!type) {
            setError("Select a transaction type.");
            return;
        }
        if (!defaultAccount) {
            setError("No default account set. Go to Accounts to set one.");
            return;
        }

        // Budget check
        if (budgetWarning) {
            setError(budgetWarning);
            return;
        }

        // Balance check
        if (balanceWarning) {
            setError(balanceWarning);
            return;
        }

        const selectedCat = categories.find((c) => c.id === category?.value);

        setSubmitting(true);
        try {
            if (isEdit) {
                await dispatch(
                    editTransaction({
                        id: transactionToEdit.id,
                        changes: {
                            title: title.trim(),
                            amount: Number(amount),
                            type: type.value,
                            category_id: category?.value ?? null,
                            category_name: selectedCat?.name ?? null,
                            category_icon: selectedCat?.icon ?? null,
                            category_color: selectedCat?.color ?? null,
                            date: date.toISOString(),
                            tags: tags.map((t) => t.value),
                            note: note.trim() || null,
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createTransaction({
                        userId,
                        title: title.trim(),
                        amount: Number(amount),
                        type: type.value,
                        categoryId: category?.value ?? null,
                        categoryName: selectedCat?.name ?? null,
                        categoryIcon: selectedCat?.icon ?? null,
                        categoryColor: selectedCat?.color ?? null,
                        accountId: defaultAccount.id,
                        accountName: defaultAccount.name,
                        date: date.toISOString(),
                        tags: tags.map((t) => t.value),
                        note: note.trim() || null,
                    }),
                ).unwrap();
            }

            // Calculate new account balances and stats
            let newBalance = Number(defaultAccount.balance) || 0;
            let newTransactionCount = Number(defaultAccount.transaction_count) || 0;
            let newTotalIncome = Number(defaultAccount.total_income) || 0;
            let newTotalExpense = Number(defaultAccount.total_expense) || 0;

            const newAmountNum = Number(amount);
            let shouldUpdateAccount = true;

            if (isEdit) {
                const oldType = transactionToEdit.type;
                const oldAmount = Number(transactionToEdit.amount);

                if (oldAmount === newAmountNum && oldType === type.value) {
                    // User did not change amount or type, do nothing
                    shouldUpdateAccount = false;
                } else {
                    // Type or amount changed, revert old and apply new
                    
                    // Revert old transaction effect
                    newBalance = oldType === "expense" ? newBalance + oldAmount : newBalance - oldAmount;
                    if (oldType === "expense") newTotalExpense -= oldAmount;
                    if (oldType === "income") newTotalIncome -= oldAmount;

                    // Apply new transaction effect
                    newBalance = type.value === "expense" ? newBalance - newAmountNum : newBalance + newAmountNum;
                    if (type.value === "expense") newTotalExpense += newAmountNum;
                    if (type.value === "income") newTotalIncome += newAmountNum;
                }
            } else {
                newBalance = type.value === "expense" ? newBalance - newAmountNum : newBalance + newAmountNum;
                newTransactionCount += 1;
                if (type.value === "expense") newTotalExpense += newAmountNum;
                if (type.value === "income") newTotalIncome += newAmountNum;
            }

            // Update account balance and stats only if needed
            if (shouldUpdateAccount) {
                await dispatch(
                    editAccount({
                        id: defaultAccount.id,
                        changes: { 
                            balance: newBalance,
                            transaction_count: newTransactionCount,
                            total_income: newTotalIncome,
                            total_expense: newTotalExpense
                        },
                    })
                ).unwrap();
            }

            // Update budget spent and rollover_amount
            if (type.value === "expense" && category?.value) {
                const budget = budgetByCategory[category.value];
                if (budget) {
                    let newSpent = Number(budget.spent || 0);
                    let newRollover = Number(budget.rollover_amount || 0);
                    let shouldUpdateBudget = false;

                    if (isEdit && transactionToEdit.type === "expense" && transactionToEdit.category_id === category.value) {
                        const oldAmount = Number(transactionToEdit.amount);
                        const diff = newAmountNum - oldAmount;
                        if (diff !== 0) {
                            newSpent += diff;
                            newRollover -= diff;
                            shouldUpdateBudget = true;
                        }
                    } else if (isEdit && transactionToEdit.type === "expense" && transactionToEdit.category_id !== category.value) {
                        // Category changed
                        newSpent += newAmountNum;
                        newRollover -= newAmountNum;
                        shouldUpdateBudget = true;

                        // Revert old budget
                        const oldBudget = budgetByCategory[transactionToEdit.category_id];
                        if (oldBudget) {
                            await dispatch(editBudget({
                                id: oldBudget.id,
                                changes: {
                                    spent: Number(oldBudget.spent || 0) - Number(transactionToEdit.amount),
                                    rollover_amount: Number(oldBudget.rollover_amount || 0) + Number(transactionToEdit.amount)
                                }
                            })).unwrap();
                        }
                    } else if (!isEdit || transactionToEdit.type !== "expense") {
                        // New expense transaction
                        newSpent += newAmountNum;
                        newRollover -= newAmountNum;
                        shouldUpdateBudget = true;
                    }

                    if (shouldUpdateBudget) {
                        await dispatch(editBudget({
                            id: budget.id,
                            changes: {
                                spent: newSpent,
                                rollover_amount: newRollover
                            }
                        })).unwrap();
                    }
                }
            } else if (isEdit && transactionToEdit.type === "expense") {
                // Changed from expense to income! Revert old budget
                const oldBudget = budgetByCategory[transactionToEdit.category_id];
                if (oldBudget) {
                    await dispatch(editBudget({
                        id: oldBudget.id,
                        changes: {
                            spent: Number(oldBudget.spent || 0) - Number(transactionToEdit.amount),
                            rollover_amount: Number(oldBudget.rollover_amount || 0) + Number(transactionToEdit.amount)
                        }
                    })).unwrap();
                }
            }

            // Trigger Notifications (budget alerts and low balance checks)
            if (type.value === "expense") {
                if (category?.value) {
                    const budget = budgetByCategory[category.value];
                    if (budget) {
                        const isSameCategory = isEdit && transactionToEdit.category_id === category.value;
                        const diff = isSameCategory ? (Number(amount) - Number(transactionToEdit.amount)) : Number(amount);
                        const finalSpent = Number(budget.spent || 0) + diff;
                        checkBudgetAlert(userId, {
                            id: budget.id,
                            limit_amount: budget.limit_amount,
                            spent: finalSpent,
                            category_name: category.label,
                        }, profile);
                    }
                }
                if (defaultAccount) {
                    checkLowBalance(userId, {
                        id: defaultAccount.id,
                        name: defaultAccount.name,
                        balance: newBalance,
                        currency: defaultAccount.currency,
                    });
                }
            }

            // Reload accounts to refresh balances
            await dispatch(loadAccounts(userId));

            if (onSuccess) onSuccess(modalType);
            onClose();
        } catch (err) {
            setError(err || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Add new transaction"
        >
            <div className={styles.modal} ref={modalRef}>
                {/* ── Header ─────────────────────────────── */}
                <div className={styles.header}>
                    <h2 className={styles.title} id="add-txn-modal-title">
                        {isEdit ? "Edit Transaction" : "Add Transaction"}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close modal"
                        type="button"
                        id="add-txn-modal-close"
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
                    aria-labelledby="add-txn-modal-title"
                >
                    {/* Title */}
                    <MainInput
                        name="txnTitle"
                        title="Title"
                        placeholder="e.g. Whole Foods Market"
                        register={{
                            value: title,
                            onChange: (e) => setTitle(e.target.value),
                        }}
                        hasError={!!error && !title.trim()}
                    />

                    {/* Amount & Type Row */}
                    <div className={styles.formRow}>
                        <MainInput
                            name="txnAmount"
                            title="Amount"
                            type="number"
                            placeholder="0.00"
                            register={{
                                value: amount,
                                onChange: (e) => setAmount(e.target.value),
                                min: "0",
                                step: "0.01",
                            }}
                        />
                        <div className={styles.selectWrapper}>
                            <label className={styles.selectLabel}>Type</label>
                            <Select
                                options={TYPE_OPTIONS}
                                value={type}
                                onChange={handleTypeChange}
                                styles={selectStyles}
                                isSearchable={false}
                                aria-label="Transaction type"
                                inputId="add-txn-type"
                                menuPlacement="auto"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>Category</label>
                        <Select
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                            styles={selectStyles}
                            isClearable
                            placeholder="Select category..."
                            aria-label="Transaction category"
                            inputId="add-txn-category"
                            menuPlacement="auto"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>

                    {/* Budget warning */}
                    {budgetWarning && (
                        <div className={styles.budgetWarning} role="alert">
                            <FiAlertTriangle size={16} />
                            {budgetWarning}
                        </div>
                    )}

                    {/* Balance warning */}
                    {balanceWarning && !budgetWarning && (
                        <div className={styles.budgetWarning} role="alert">
                            <FiAlertTriangle size={16} />
                            {balanceWarning}
                        </div>
                    )}

                    {/* Date */}
                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>Date</label>
                        <DatePicker
                            selected={date}
                            onChange={setDate}
                            customInput={<DateInput />}
                            dateFormat="MMM d, yyyy"
                            maxDate={new Date()}
                        />
                    </div>

                    {/* Tags — creatable multi-select */}
                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>Tags</label>
                        <CreatableSelect
                            isMulti
                            options={tagOptions}
                            value={tags}
                            onChange={setTags}
                            styles={selectStyles}
                            placeholder="Add tags..."
                            aria-label="Transaction tags"
                            inputId="add-txn-tags"
                            menuPlacement="auto"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            formatCreateLabel={(val) => `Create "${val}"`}
                        />
                    </div>

                    {/* Note */}
                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>
                            Note (optional)
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note..."
                            aria-label="Transaction note"
                            id="add-txn-note"
                            rows={3}
                        />
                    </div>

                    {/* Account info (read-only, using default) */}
                    <div
                        className={styles.budgetWarning}
                        style={{
                            background: "var(--color-info-bg)",
                            color: "var(--color-info)",
                            borderColor: "var(--color-info-border)",
                        }}
                    >
                        <span style={{ fontWeight: "var(--weight-semibold)" }}>
                            Account:
                        </span>
                        {defaultAccount
                            ? `${defaultAccount.name} — Balance: ${currency} ${Number(defaultAccount.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : "No default account set"}
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
                            title={isEdit ? "Save Changes" : "Add Transaction"}
                            isLoading={submitting}
                            isDisabled={submitting}
                        >
                            {isEdit ? "Save Changes" : "Add Transaction"}
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}

AddTransactionModal.propTypes = {
    type: PropTypes.oneOf(["add", "edit"]),
    transactionToEdit: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    defaultAccount: PropTypes.object,
    categories: PropTypes.array,
    userId: PropTypes.string,
    currency: PropTypes.string,
    uniqueTags: PropTypes.array,
    budgetByCategory: PropTypes.object,
    spentByCategory: PropTypes.object,
    onSuccess: PropTypes.func,
};

export default AddTransactionModal;
