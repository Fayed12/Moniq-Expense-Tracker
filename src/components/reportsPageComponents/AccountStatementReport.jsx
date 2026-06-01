// local
import styles from "./AccountStatementReport.module.css";

// react
import { useState } from "react";

// icons
import {
    FiArrowUpRight,
    FiArrowDownRight,
    FiArrowRight,
    FiInbox,
    FiChevronLeft,
    FiChevronRight,
    FiCreditCard,
} from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";
import { FaUniversity } from "react-icons/fa";

// components
export default function AccountStatementReport({ data, currency }) {
    const { account, ledger, kpis } = data;
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 25;

    // Reset page synchronously during render if ledger reference shifts (avoids cascading useEffect renders)
    const [prevLedger, setPrevLedger] = useState(ledger);
    if (ledger !== prevLedger) {
        setPrevLedger(ledger);
        setCurrentPage(1);
    }

    const formatMoney = (val) => {
        return `${currency} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    if (!account || !kpis) {
        return (
            <div className={`${styles.emptyStateContainer} glass-card`}>
                <FaUniversity className={styles.emptyLogo} size={48} />
                <h3 className={styles.emptyTitle}>Select an Account</h3>
                <p className={styles.emptyDesc}>
                    Please select one of your active accounts from the header
                    selector dropdown to generate a full chronological account
                    statement and ledger.
                </p>
            </div>
        );
    }

    // Pagination bounds
    const totalRows = ledger.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedLedger = ledger.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className={styles.reportWrapper}>
            {/* Account Info Header Banner */}
            <div
                className={`${styles.accountHeaderCard} glass-card`}
                style={{
                    borderLeft: `6px solid ${account.color || "var(--color-primary)"}`,
                }}
            >
                <div className={styles.accountTitleBlock}>
                    <div
                        className={styles.logoCircle}
                        style={{
                            backgroundColor: `${account.color || "var(--color-primary)"}15`,
                            color: account.color || "var(--color-primary)",
                        }}
                    >
                        <FiCreditCard size={20} />
                    </div>
                    <div>
                        <h3 className={styles.accountName}>{account.name}</h3>
                        <span className={styles.accountType}>
                            {account.type || "Cash / Bank"} Account
                        </span>
                    </div>
                </div>

                <div className={styles.aggregatesRow}>
                    <div className={styles.aggItem}>
                        <span className={styles.aggLabel}>Opening Balance</span>
                        <span className={styles.aggVal}>
                            {formatMoney(kpis.openingBalance)}
                        </span>
                    </div>
                    <FiArrowRight className={styles.arrowFlow} />
                    <div className={styles.aggItem}>
                        <span className={styles.aggLabel}>Net Period Flow</span>
                        <span
                            className={`${styles.aggVal} ${kpis.netChange >= 0 ? styles.positiveText : styles.negativeText}`}
                        >
                            {kpis.netChange >= 0 ? "+" : ""}
                            {formatMoney(kpis.netChange)}
                        </span>
                    </div>
                    <FiArrowRight className={styles.arrowFlow} />
                    <div className={styles.aggItem}>
                        <span className={styles.aggLabel}>Closing Balance</span>
                        <span className={styles.aggVal}>
                            {formatMoney(kpis.closingBalance)}
                        </span>
                    </div>
                </div>
            </div>

            {/* A1 — KPI summary blocks */}
            <div className={styles.kpiRow}>
                {/* Total Period Income */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-income)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>
                            Statement Income
                        </span>
                        <div className={`${styles.iconBg} ${styles.greenBg}`}>
                            <FiArrowUpRight
                                className={styles.greenIcon}
                                size={18}
                            />
                        </div>
                    </div>
                    <p className={styles.cardVal}>{formatMoney(kpis.income)}</p>
                    <span className={styles.subtext}>
                        accumulated in selected timeframe
                    </span>
                </div>

                {/* Total Period Expenses */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-expense)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>
                            Statement Expenses
                        </span>
                        <div className={`${styles.iconBg} ${styles.redBg}`}>
                            <FiArrowDownRight
                                className={styles.redIcon}
                                size={18}
                            />
                        </div>
                    </div>
                    <p className={styles.cardVal}>
                        {formatMoney(kpis.expense)}
                    </p>
                    <span className={styles.subtext}>
                        spent in selected timeframe
                    </span>
                </div>

                {/* Net Statement Savings */}
                <div
                    className={styles.kpiCard}
                    style={{ "--card-accent": "var(--color-transfer)" }}
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>
                            Net Statement Change
                        </span>
                        <div className={`${styles.iconBg} ${styles.violetBg}`}>
                            <FaScaleBalanced
                                className={styles.violetIcon}
                                size={16}
                            />
                        </div>
                    </div>
                    <p
                        className={`${styles.cardVal} ${kpis.netChange >= 0 ? styles.positiveText : styles.negativeText}`}
                    >
                        {kpis.netChange >= 0 ? "+" : ""}
                        {formatMoney(kpis.netChange)}
                    </p>
                    <span className={styles.subtext}>
                        Income − Expenses delta
                    </span>
                </div>
            </div>

            {/* Ledger Listing Section */}
            <div className={`${styles.sectionCard} glass-card`}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>
                            Transaction Ledger
                        </h3>
                        <p className={styles.sectionSubtitle}>
                            Chronological listing of account events (latest on
                            top)
                        </p>
                    </div>
                    {totalPages > 1 && (
                        <div className={styles.paginationControls}>
                            <button
                                type="button"
                                className={styles.pageBtn}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={currentPage === 1}
                                aria-label="Previous Page"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <span className={styles.pageText}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                className={styles.pageBtn}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(p + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                aria-label="Next Page"
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.tableWrapper}>
                    {paginatedLedger.length > 0 ? (
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th className={styles.rightAlign}>
                                        Amount
                                    </th>
                                    <th className={styles.rightAlign}>
                                        Running Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLedger.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={styles.ledgerTableRow}
                                    >
                                        <td>{row.date}</td>
                                        <td>
                                            <span className={styles.txTitle}>
                                                {row.title}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.catLabel}>
                                                {row.categoryName}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.typeBadge} ${row.type === "income" ? styles.badgeIncome : styles.badgeExpense}`}
                                            >
                                                {row.type}
                                            </span>
                                        </td>
                                        <td
                                            className={`${styles.rightAlign} ${styles.mono} ${row.type === "income" ? styles.positiveText : styles.negativeText}`}
                                        >
                                            {row.type === "income" ? "+" : "-"}
                                            {formatMoney(row.amount)}
                                        </td>
                                        <td
                                            className={`${styles.rightAlign} ${styles.mono} ${styles.boldText}`}
                                        >
                                            {formatMoney(row.runningBalance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyTableState}>
                            <FiInbox size={24} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>
                                No transaction history for this account during
                                this period
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className={styles.bottomPagination}>
                        <span className={styles.totalRowsText}>
                            Showing {startIndex + 1} -{" "}
                            {Math.min(startIndex + rowsPerPage, totalRows)} of{" "}
                            {totalRows} transactions
                        </span>
                        <div className={styles.paginationControls}>
                            <button
                                type="button"
                                className={styles.pageBtn}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={currentPage === 1}
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <span className={styles.pageText}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                className={styles.pageBtn}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(p + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
