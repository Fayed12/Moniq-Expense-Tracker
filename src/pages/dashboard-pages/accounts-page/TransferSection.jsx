// local
import styles from "./TransferSection.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { getSelectStyles } from "../../../utils/reactSelectStyles";
import { useSweetAlert } from "../../../hooks/useSweetAlert";

// react
import { useState, useCallback, useMemo } from "react";

// redux
import { useDispatch } from "react-redux";
import { doTransfer, loadAllAccounts } from "../../../redux/accountsSlice";

// react-select
import Select from "react-select";

// react-icons
import { FiRepeat } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ════════════════════════════════════════════════════════════
// TRANSFER SECTION COMPONENT
// ════════════════════════════════════════════════════════════
function TransferSection({ accounts, userId, currency, transferCategory }) {
    const dispatch = useDispatch();
    const { confirmTransfer } = useSweetAlert();

    // ── react-select styles ─────────────────────────────────
    const selectStyles = useMemo(() => getSelectStyles(), []);

    // ── Build option objects for react-select ────────────────
    const accountOptions = useMemo(
        () =>
            accounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} (${currency} ${(Number(acc.balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
                balance: Number(acc.balance) || 0,
            })),
        [accounts, currency],
    );

    // ── Local state ─────────────────────────────────────────
    const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || null);
    const [toAccountId, setToAccountId] = useState(accounts[1]?.id || null);
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Derived Options ─────────────────────────────────────
    const fromOption = useMemo(
        () => accountOptions.find((o) => o.value === fromAccountId) || null,
        [accountOptions, fromAccountId],
    );
    const toOption = useMemo(
        () => accountOptions.find((o) => o.value === toAccountId) || null,
        [accountOptions, toAccountId],
    );

    // ── Filtered options: "From" excludes selected "To" and vice versa ──
    const fromOptions = useMemo(
        () => accountOptions.filter((o) => o.value !== toAccountId),
        [accountOptions, toAccountId],
    );

    const toOptions = useMemo(
        () => accountOptions.filter((o) => o.value !== fromAccountId),
        [accountOptions, fromAccountId],
    );

    // ── Source account balance ───────────────────────────────
    const sourceBalance = fromOption?.balance ?? 0;

    // ── Transfer button disabled logic ──────────────────────
    const numAmount = Number(amount) || 0;
    const isTransferDisabled =
        submitting ||
        !fromOption ||
        !toOption ||
        fromOption.value === toOption?.value ||
        sourceBalance <= 0 ||
        numAmount <= 0 ||
        numAmount > sourceBalance;

    // ── Swap handler ────────────────────────────────────────
    const handleSwap = useCallback(() => {
        setFromAccountId((prev) => {
            const old = prev;
            setToAccountId(old);
            return toAccountId;
        });
    }, [toAccountId]);

    // ── Submit handler ──────────────────────────────────────
    const handleTransfer = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!fromOption || !toOption) {
            setError("Please select both accounts.");
            return;
        }
        if (fromOption.value === toOption.value) {
            setError("Cannot transfer to the same account.");
            return;
        }
        if (numAmount <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }
        if (numAmount > sourceBalance) {
            setError("Insufficient balance in source account.");
            return;
        }

        const formattedAmount = `${currency} ${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const fromName = fromOption.label.split(" (")[0];
        const toName = toOption.label.split(" (")[0];

        const { isConfirmed, note } = await confirmTransfer(fromName, toName, formattedAmount);
        
        if (!isConfirmed) return;

        setSubmitting(true);
        try {
            await dispatch(
                doTransfer({
                    accountId: fromOption.value,
                    toAccountId: toOption.value,
                    categoryId: transferCategory?.id ?? null,
                    categoryName: transferCategory?.name ?? "Transfer",
                    categoryIcon: transferCategory?.icon ?? "FaMoneyBillWave",
                    categoryColor: transferCategory?.color ?? "#7b68ee",
                    amount: numAmount,
                    accountName: fromName,
                    userId,
                    note: note?.trim() || null,
                    date: new Date().toISOString(),
                }),
            ).unwrap();

            // Wait for Redux to fetch the newly updated balances
            await dispatch(loadAllAccounts(userId)).unwrap();

            setSuccess("Transfer completed successfully!");
            setAmount("");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err || "Transfer failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (accounts.length < 2) return null;

    return (
        <section
            className={styles.transferCard}
            aria-label="Transfer between accounts"
            data-anim="transfer"
        >
            <h2 className={styles.title} id="accounts-transfer-title">
                Transfer Between Accounts
            </h2>

            <form
                className={styles.transferForm}
                onSubmit={handleTransfer}
                aria-labelledby="accounts-transfer-title"
            >
                {/* From Account */}
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>From</label>
                    <Select
                        options={fromOptions}
                        value={fromOption}
                        onChange={(opt) => setFromAccountId(opt.value)}
                        styles={selectStyles}
                        isSearchable={false}
                        aria-label="Transfer from account"
                        inputId="transfer-from"
                        placeholder="Select source..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Swap Button */}
                <button
                    type="button"
                    className={styles.swapBtn}
                    onClick={handleSwap}
                    aria-label="Swap from and to accounts"
                    id="transfer-swap-btn"
                >
                    <FiRepeat size={18} />
                </button>

                {/* To Account */}
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>To</label>
                    <Select
                        options={toOptions}
                        value={toOption}
                        onChange={(opt) => setToAccountId(opt.value)}
                        styles={selectStyles}
                        isSearchable={false}
                        aria-label="Transfer to account"
                        inputId="transfer-to"
                        placeholder="Select destination..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Amount */}
                <div className={styles.fieldGroup}>
                    <label
                        className={styles.fieldLabel}
                        htmlFor="transfer-amount"
                    >
                        Amount
                    </label>
                    <input
                        id="transfer-amount"
                        className={styles.amountInput}
                        type="number"
                        min="0"
                        max={sourceBalance}
                        step="0.01"
                        placeholder={`${currency}  0.00`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        aria-label="Transfer amount"
                        data-error={
                            numAmount > sourceBalance ? "true" : undefined
                        }
                    />
                    {sourceBalance > 0 && (
                        <span className={styles.balanceHint}>
                            Available: {currency}{" "}
                            {sourceBalance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    )}
                </div>

                {/* Transfer Button */}
                <MainButton
                    type="submit"
                    action="outline"
                    size="md"
                    title="Transfer funds"
                    isLoading={submitting}
                    isDisabled={isTransferDisabled}
                >
                    Transfer
                </MainButton>
            </form>

            {/* Messages */}
            {error && (
                <p className={styles.errorText} role="alert">
                    {error}
                </p>
            )}
            {success && (
                <p className={styles.successText} role="status">
                    {success}
                </p>
            )}
        </section>
    );
}

TransferSection.propTypes = {
    accounts: PropTypes.array.isRequired,
    userId: PropTypes.string,
    currency: PropTypes.string,
    transferCategory: PropTypes.object,
};

export default TransferSection;
