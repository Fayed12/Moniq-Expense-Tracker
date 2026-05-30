// local
import styles from "./TransactionsTable.module.css";

// react
import { useEffect, useRef } from "react";

// MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";

// gsap
import gsap from "gsap";

// react-icons
import { FiEdit2, FiTrash2, FiInfo, FiInbox } from "react-icons/fi";
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
    FaExchangeAlt,
    FaPiggyBank,
    FaGift,
    FaWifi,
    FaBolt,
    FaTshirt,
    FaCoffee,
    FaDumbbell,
    FaBook,
    FaMusic,
    FaFilm,
    FaPaw,
    FaBaby,
    FaPills,
    FaToolbox,
    FaChartLine,
    FaLandmark,
    FaCoins,
    FaCreditCard,
    FaWallet,
    FaUniversity,
    FaGem,
    FaStar,
} from "react-icons/fa";

// prop-types
import PropTypes from "prop-types";

// ── Icon map ────────────────────────────────────────────────
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
    FaExchangeAlt,
    FaPiggyBank,
    FaGift,
    FaWifi,
    FaBolt,
    FaTshirt,
    FaCoffee,
    FaDumbbell,
    FaBook,
    FaMusic,
    FaFilm,
    FaPaw,
    FaBaby,
    FaPills,
    FaToolbox,
    FaChartLine,
    FaLandmark,
    FaCoins,
    FaCreditCard,
    FaWallet,
    FaUniversity,
    FaGem,
    FaStar,
};

function DynamicIcon({ name, size = 16, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

// ── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
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
// TRANSACTIONS TABLE COMPONENT
// ════════════════════════════════════════════════════════════
function TransactionsTable({
    transactions = [],
    currency = "EGP",
    selectedIds,
    onSelectionChange,
    onInfoClick,
    onEditClick,
    onDeleteClick,
}) {
    const tbodyRef = useRef(null);
    const animRan = useRef(false);

    // ── GSAP row stagger animation ──────────────────────────
    useEffect(() => {
        if (!tbodyRef.current || animRan.current || !transactions.length)
            return;
        animRan.current = true;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const rows = tbodyRef.current.querySelectorAll("tr");
        if (!rows.length) return;

        const ctx = gsap.context(() => {
            gsap.from(rows, {
                y: 20,
                opacity: 0,
                duration: 0.4,
                stagger: 0.04,
                ease: "power3.out",
                clearProps: "all",
            });
        });

        return () => ctx.revert();
    }, [transactions.length]);

    // ── Select all handler ──────────────────────────────────
    const allSelected =
        transactions.length > 0 &&
        transactions.every((t) => selectedIds.has(t.id));
    const someSelected =
        transactions.some((t) => selectedIds.has(t.id)) && !allSelected;

    const handleSelectAll = () => {
        if (allSelected) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(transactions.map((t) => t.id)));
        }
    };

    const handleSelectRow = (id) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        onSelectionChange(next);
    };

    if (!transactions.length) {
        return (
            <div className={styles.tableWrap} data-anim="table">
                <div className={styles.emptyState}>
                    <FiInbox className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyText}>
                        No transactions found. Try adjusting your filters.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tableWrap} data-anim="table">
            <TableContainer className={styles.tableScroll}>
                <Table aria-label="Transactions table" id="transactions-table">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    onChange={handleSelectAll}
                                    slotProps={{
                                        input: {
                                            "aria-label":
                                                "Select all transactions",
                                        },
                                    }}
                                />
                            </TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Transaction</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell className={styles.accountCol}>
                                Account
                            </TableCell>
                            <TableCell className={styles.tagsCol}>
                                Tags
                            </TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody ref={tbodyRef}>
                        {transactions.map((txn) => (
                            <TableRow
                                key={txn.id}
                                hover
                                selected={selectedIds.has(txn.id)}
                                aria-label={`${txn.title} — ${formatAmount(txn.amount, txn.type, currency)}`}
                            >
                                {/* Checkbox */}
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedIds.has(txn.id)}
                                        onChange={() => handleSelectRow(txn.id)}
                                        slotProps={{
                                            input: {
                                                "aria-label":
                                                    "Select all transactions",
                                            },
                                        }}
                                    />
                                </TableCell>

                                {/* Date */}
                                <TableCell>
                                    <span className={styles.dateCell}>
                                        {formatDate(txn.date)}
                                    </span>
                                </TableCell>

                                {/* Transaction (icon + title + category) */}
                                <TableCell>
                                    <div className={styles.txnCell}>
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
                                            <DynamicIcon
                                                name={txn.category_icon}
                                            />
                                        </span>
                                        <div className={styles.txnInfo}>
                                            <span className={styles.txnTitle}>
                                                {txn.title}
                                            </span>
                                            <span
                                                className={styles.txnCategory}
                                            >
                                                {txn.category_name || "—"}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Type badge */}
                                <TableCell>
                                    <span
                                        className={styles.typeBadge}
                                        data-type={txn.type}
                                    >
                                        {txn.type}
                                    </span>
                                </TableCell>

                                {/* Account */}
                                <TableCell className={styles.accountCol}>
                                    <div className={styles.accountCell}>
                                        <span
                                            className={styles.accountDot}
                                            style={{
                                                background:
                                                    txn.type === "expense"
                                                        ? "var(--color-expense)"
                                                        : txn.type === "income"
                                                          ? "var(--color-income)"
                                                          : "var(--color-transfer)",
                                            }}
                                            aria-hidden="true"
                                        />
                                        {txn.account_name || "—"}
                                    </div>
                                </TableCell>

                                {/* Tags */}
                                <TableCell className={styles.tagsCol}>
                                    <div className={styles.tagsCell}>
                                        {txn.tags?.length > 0
                                            ? txn.tags.map((tag) => (
                                                  <span
                                                      key={tag}
                                                      className={styles.tag}
                                                  >
                                                      {tag}
                                                  </span>
                                              ))
                                            : "—"}
                                    </div>
                                </TableCell>

                                {/* Amount */}
                                <TableCell align="right">
                                    <span
                                        className={
                                            txn.type === "income"
                                                ? styles.amountIncome
                                                : txn.type === "transfer"
                                                  ? styles.amountTransfer
                                                  : styles.amountExpense
                                        }
                                    >
                                        {formatAmount(
                                            txn.amount,
                                            txn.type,
                                            currency,
                                        )}
                                    </span>
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="center">
                                    <div className={styles.actionsCell}>
                                        <button
                                            className={styles.actionBtn}
                                            data-action="info"
                                            onClick={() => onInfoClick(txn)}
                                            aria-label={`View details for ${txn.title}`}
                                            title="View details"
                                            type="button"
                                        >
                                            <FiInfo />
                                        </button>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => onEditClick(txn)}
                                            aria-label={`Edit ${txn.title}`}
                                            title="Edit transaction"
                                            type="button"
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className={styles.actionBtn}
                                            data-action="delete"
                                            onClick={() => onDeleteClick(txn)}
                                            aria-label={`Delete ${txn.title}`}
                                            title="Delete transaction"
                                            type="button"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

TransactionsTable.propTypes = {
    transactions: PropTypes.array.isRequired,
    currency: PropTypes.string,
    selectedIds: PropTypes.instanceOf(Set).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    onInfoClick: PropTypes.func.isRequired,
    onEditClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
};

export default TransactionsTable;
