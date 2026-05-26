// local
import styles from "./TransferSection.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react
import { useState, useCallback } from "react";

// redux
import { useDispatch } from "react-redux";
import { doTransfer, loadAllAccounts } from "../../../redux/accountsSlice";

// react-icons
import { FiRepeat } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ════════════════════════════════════════════════════════════
// TRANSFER SECTION COMPONENT
// ════════════════════════════════════════════════════════════
function TransferSection({ accounts, userId, currency, transferCategory }) {
    const dispatch = useDispatch();

    // ── Local state ─────────────────────────────────────────
    const [fromId, setFromId] = useState(accounts[0]?.id || "");
    const [toId, setToId] = useState(accounts[1]?.id || "");
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Swap handler ────────────────────────────────────────
    const handleSwap = useCallback(() => {
        setFromId((prev) => {
            setToId(prev);
            return toId;
        });
    }, [toId]);

    // ── Format balance for display ──────────────────────────
    const getAccountLabel = useCallback(
        (acc) => {
            const bal = Number(acc.balance) || 0;
            return `${acc.name} (${currency} ${bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
        },
        [currency],
    );

    // ── Submit handler ──────────────────────────────────────
    const handleTransfer = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const numAmount = Number(amount);
        const fromAccount = accounts.find((a) => a.id === fromId);

        // Validation
        if (!fromId || !toId) {
            setError("Please select both accounts.");
            return;
        }
        if (fromId === toId) {
            setError("Cannot transfer to the same account.");
            return;
        }
        if (!numAmount || numAmount <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }
        if (fromAccount && numAmount > Number(fromAccount.balance)) {
            setError("Insufficient balance in source account.");
            return;
        }

        setSubmitting(true);
        try {
            await dispatch(
                doTransfer({
                    accountId: fromId,
                    toAccountId: toId,
                    categoryId: transferCategory?.id ?? null,
                    categoryName: transferCategory?.name ?? "Transfer",
                    categoryIcon: transferCategory?.icon ?? "FaMoneyBillWave",
                    categoryColor: transferCategory?.color ?? "#7b68ee",
                    amount: numAmount,
                    userId,
                    note: null,
                    date: new Date().toISOString(),
                }),
            ).unwrap();

            // Refresh accounts to get updated balances
            dispatch(loadAllAccounts(userId));

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
                    <label
                        className={styles.fieldLabel}
                        htmlFor="transfer-from"
                    >
                        From
                    </label>
                    <select
                        id="transfer-from"
                        className={styles.fieldSelect}
                        value={fromId}
                        onChange={(e) => setFromId(e.target.value)}
                        aria-label="Transfer from account"
                    >
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {getAccountLabel(acc)}
                            </option>
                        ))}
                    </select>
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
                    <label className={styles.fieldLabel} htmlFor="transfer-to">
                        To
                    </label>
                    <select
                        id="transfer-to"
                        className={styles.fieldSelect}
                        value={toId}
                        onChange={(e) => setToId(e.target.value)}
                        aria-label="Transfer to account"
                    >
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {getAccountLabel(acc)}
                            </option>
                        ))}
                    </select>
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
                        step="0.01"
                        placeholder={`${currency}  0.00`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        aria-label="Transfer amount"
                        data-error={error ? "true" : undefined}
                    />
                </div>

                {/* Transfer Button */}
                <MainButton
                    type="submit"
                    action="outline"
                    size="md"
                    title="Transfer funds"
                    isLoading={submitting}
                    isDisabled={submitting}
                    className={styles.transferBtn}
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
