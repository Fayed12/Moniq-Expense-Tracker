// local
import styles from "./transactionsPage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import FilterBar from "./FilterBar";
import TransactionsTable from "./TransactionsTable";
import AddTransactionModal from "./AddTransactionModal";
import TransactionInfoDrawer from "./TransactionInfoDrawer";
import { useTransactionsPageData } from "../../../hooks/useTransactionsPageData";
import { useSweetAlert } from "../../../hooks/useSweetAlert";
import { removeTransaction } from "../../../redux/transactionsSlice";
import { editBudget } from "../../../redux/budgetsSlice";
import { exportTransactionsToExcel } from "./exportTransactions";

// react
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// react-router
import { useNavigate } from "react-router";

// redux
import { useDispatch } from "react-redux";

// gsap
import gsap from "gsap";

// react-icons
import {
    FiPlus,
    FiDownload,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { FaLightbulb } from "react-icons/fa";

// ── Constants ───────────────────────────────────────────────
const ROWS_PER_PAGE = 10;

// ════════════════════════════════════════════════════════════
// TRANSACTIONS PAGE COMPONENT
// ════════════════════════════════════════════════════════════
function TransactionsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const animRan = useRef(false);

    // ── Page data ───────────────────────────────────────────
    const {
        transactions,
        accounts,
        categories,
        currency,
        userId,
        defaultAccount,
        totalCount,
        uniqueTags,
        budgetByCategory,
        spentByCategory,
        loading,
        profile,
    } = useTransactionsPageData();

    const { confirmDelete, showSuccess } = useSweetAlert();

    // ── Local state ─────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [editTxn, setEditTxn] = useState(null);
    const [infoTxn, setInfoTxn] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [page, setPage] = useState(0);

    // ── Filter state ────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);

    // ── Filter change handlers (to prevent cascading renders) ──
    const handleSearchChange = useCallback((val) => {
        setSearch(val);
        setPage(0);
    }, []);

    const handleTypesChange = useCallback((val) => {
        setSelectedTypes(val);
        setPage(0);
    }, []);

    const handleCategoryChange = useCallback((val) => {
        setSelectedCategory(val);
        setPage(0);
    }, []);

    const handleAccountChange = useCallback((val) => {
        setSelectedAccount(val);
        setPage(0);
    }, []);

    const handleDateChange = useCallback((val) => {
        setDateRange(val);
        setPage(0);
    }, []);

    // ── Filtered transactions ───────────────────────────────
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Search by name
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title?.toLowerCase().includes(term) ||
                    t.category_name?.toLowerCase().includes(term),
            );
        }

        // Type filter (multi)
        if (selectedTypes?.length > 0) {
            const typeValues = selectedTypes.map((t) => t.value);
            result = result.filter((t) => typeValues.includes(t.type));
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter(
                (t) => t.category_id === selectedCategory?.value,
            );
        }

        // Account filter
        if (selectedAccount) {
            result = result.filter(
                (t) => t.account_id === selectedAccount?.value,
            );
        }

        // Date range filter
        if (dateRange[0]) {
            const start = new Date(dateRange[0]);
            start.setHours(0, 0, 0, 0);
            result = result.filter((t) => new Date(t.date) >= start);
        }
        if (dateRange[1]) {
            const end = new Date(dateRange[1]);
            end.setHours(23, 59, 59, 999);
            result = result.filter((t) => new Date(t.date) <= end);
        }

        return result;
    }, [
        transactions,
        search,
        selectedTypes,
        selectedCategory,
        selectedAccount,
        dateRange,
    ]);

    // ── Pagination ──────────────────────────────────────────
    const totalFiltered = filteredTransactions.length;
    const totalPages = Math.ceil(totalFiltered / ROWS_PER_PAGE);
    const pageStart = page * ROWS_PER_PAGE;
    const pageEnd = Math.min(pageStart + ROWS_PER_PAGE, totalFiltered);
    const paginatedTransactions = filteredTransactions.slice(
        pageStart,
        pageEnd,
    );

    // ── Clear all filters ───────────────────────────────────
    const handleClearAll = useCallback(() => {
        setSearch("");
        setSelectedTypes([]);
        setSelectedCategory(null);
        setSelectedAccount(null);
        setDateRange([null, null]);
        setPage(0);
    }, []);

    // ── GSAP page entrance animation ────────────────────────
    useEffect(() => {
        if (!containerRef.current || animRan.current || loading) return;
        animRan.current = true;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out", duration: 0.5 },
            });

            // Hint banner
            tl.from("[data-anim='hint']", {
                y: -20,
                opacity: 0,
                duration: 0.4,
                clearProps: "all",
            });

            // Header slides down
            tl.from(
                "[data-anim='header']",
                {
                    y: -30,
                    opacity: 0,
                    clearProps: "all",
                },
                "-=0.2",
            );

            // Filter bar fades in
            tl.from(
                "[data-anim='filter-bar']",
                {
                    y: 20,
                    opacity: 0,
                    duration: 0.4,
                    clearProps: "all",
                },
                "-=0.2",
            );

            // Table wrapper
            tl.from(
                "[data-anim='table']",
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.5,
                    clearProps: "all",
                },
                "-=0.2",
            );

            // Pagination
            tl.from(
                "[data-anim='pagination']",
                {
                    opacity: 0,
                    duration: 0.3,
                    clearProps: "all",
                },
                "-=0.1",
            );
        }, containerRef);

        return () => ctx.revert();
    }, [loading]);

    // ── Delete handler ──────────────────────────────────────
    const handleDelete = useCallback(
        async (txn) => {
            const confirmed = await confirmDelete(txn.title);
            if (!confirmed) return;

            try {
                await dispatch(removeTransaction(txn.id)).unwrap();

                // If expense, update the category budget
                if (txn.type === "expense" && txn.category_id) {
                    const budget = budgetByCategory[txn.category_id];
                    if (budget) {
                        const newRollover = Number(budget.rollover_amount || 0) + Number(txn.amount);
                        const newSpent = Number(budget.spent || 0) - Number(txn.amount);
                        
                        await dispatch(editBudget({
                            id: budget.id,
                            changes: {
                                rollover_amount: newRollover,
                                spent: newSpent
                            }
                        })).unwrap();
                    }
                }

                showSuccess("Deleted!", `"${txn.title}" has been removed.`);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        },
        [dispatch, confirmDelete, showSuccess, budgetByCategory],
    );

    // ── Edit handler (opens modal with prefilled data) ──
    const handleEdit = useCallback((txn) => {
        setEditTxn(txn);
        setModalOpen(true);
    }, []);

    // ── Export handler ──────────────────────────────────────
    const handleExport = useCallback(() => {
        exportTransactionsToExcel(filteredTransactions, currency);
    }, [filteredTransactions, currency]);

    // ── Modal success handler ───────────────────────────────
    const handleModalSuccess = useCallback((modalType = "add") => {
        if (modalType === "edit") {
            showSuccess("Updated!", "Transaction updated successfully.");
        } else {
            showSuccess("Added!", "Transaction created successfully.");
        }
    }, [showSuccess]);

    return (
        <main
            className={styles.container}
            ref={containerRef}
            aria-label="Transactions page"
        >
            {/* ═══ DEFAULT ACCOUNT HINT ═══ */}
            <div className={styles.accountHint} data-anim="hint" role="note">
                <FaLightbulb className={styles.hintIcon} aria-hidden="true" />
                <p className={styles.hintText}>
                    {defaultAccount ? (
                        <>
                            Transactions use your default account:{" "}
                            <strong>{defaultAccount.name}</strong> — Balance:{" "}
                            <strong>
                                {currency}{" "}
                                {Number(
                                    defaultAccount.balance || 0,
                                ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </strong>
                        </>
                    ) : (
                        "No default account set. Set one in your Accounts page to start adding transactions."
                    )}
                </p>
                <MainButton
                    action="outline"
                    size="sm"
                    title="Manage accounts"
                    clickEvent={() => navigate("/dashboard/accounts")}
                    className={styles.hintBtn}
                >
                    Manage Accounts
                </MainButton>
            </div>

            {/* ═══ PAGE HEADER ═══ */}
            <header className={styles.pageHeader} data-anim="header">
                <div className={styles.titleRow}>
                    <h1 className={styles.pageTitle} id="transactions-page-title">
                        Transactions
                    </h1>
                    <span
                        className={styles.countBadge}
                        aria-live="polite"
                        aria-label={`${totalCount} total transactions`}
                    >
                        {totalCount.toLocaleString()}
                    </span>
                </div>

                <div className={styles.headerActions}>
                    {/* Export button */}
                    <MainButton
                        action="outline"
                        size="md"
                        title="Export to Excel"
                        clickEvent={handleExport}
                        isDisabled={!filteredTransactions.length}
                    >
                        <FiDownload size={16} />
                        Export
                    </MainButton>

                    {/* Add Transaction button */}
                    <MainButton
                        action="primary"
                        size="md"
                        title="Add new transaction"
                        clickEvent={() => {
                            setEditTxn(null);
                            setModalOpen(true);
                        }}
                    >
                        <FiPlus size={16} />
                        Add Transaction
                    </MainButton>
                </div>
            </header>

            {/* ═══ FILTER BAR ═══ */}
            <section className={styles.filterSection}>
                <FilterBar
                    search={search}
                    onSearchChange={handleSearchChange}
                    selectedTypes={selectedTypes}
                    onTypesChange={handleTypesChange}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    selectedAccount={selectedAccount}
                    onAccountChange={handleAccountChange}
                    dateRange={dateRange}
                    onDateChange={handleDateChange}
                    categories={categories}
                    accounts={accounts}
                    onClearAll={handleClearAll}
                />
            </section>

            {/* ═══ TRANSACTIONS TABLE ═══ */}
            <section className={styles.tableSection}>
                <TransactionsTable
                    transactions={paginatedTransactions}
                    currency={currency}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onInfoClick={(txn) => setInfoTxn(txn)}
                    onEditClick={handleEdit}
                    onDeleteClick={handleDelete}
                />
            </section>

            {/* ═══ PAGINATION ═══ */}
            {totalFiltered > ROWS_PER_PAGE && (
                <nav
                    className={styles.pagination}
                    aria-label="Table pagination"
                    data-anim="pagination"
                >
                    <span className={styles.pageInfo}>
                        Showing {pageStart + 1}–{pageEnd} of{" "}
                        {totalFiltered.toLocaleString()}
                    </span>
                    <div className={styles.pageButtons}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            aria-label="Previous page"
                            type="button"
                            id="txn-page-prev"
                        >
                            <FiChevronLeft />
                        </button>
                        <button
                            className={styles.pageBtn}
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(totalPages - 1, p + 1),
                                )
                            }
                            disabled={page >= totalPages - 1}
                            aria-label="Next page"
                            type="button"
                            id="txn-page-next"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </nav>
            )}

            {/* ═══ ADD TRANSACTION MODAL ═══ */}
            {modalOpen && (
                <AddTransactionModal
                    type={editTxn ? "edit" : "add"}
                    transactionToEdit={editTxn}
                    onClose={() => {
                        setModalOpen(false);
                        setEditTxn(null);
                    }}
                    defaultAccount={defaultAccount}
                    categories={categories}
                    userId={userId}
                    currency={currency}
                    uniqueTags={uniqueTags}
                    budgetByCategory={budgetByCategory}
                    spentByCategory={spentByCategory}
                    profile={profile}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* ═══ TRANSACTION INFO DRAWER ═══ */}
            {infoTxn && (
                <TransactionInfoDrawer
                    transaction={infoTxn}
                    onClose={() => setInfoTxn(null)}
                    currency={currency}
                />
            )}
        </main>
    );
}

export default TransactionsPage;