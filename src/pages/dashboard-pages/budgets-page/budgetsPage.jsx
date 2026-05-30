// local
import styles from "./budgetsPage.module.css";
import { BudgetCard, UnbudgetedCard } from "./BudgetCard";
import AddBudgetModal from "./AddBudgetModal";
import BudgetInfoDrawer from "./BudgetInfoDrawer";
import { exportBudgetsToExcel } from "./exportBudgets";
import MainButton from "../../../components/ui/button/MainButton";
import { getSelectStyles } from "../../../utils/reactSelectStyles";
import { useBudgetsPageData } from "../../../hooks/useBudgetsPageData";
import { useSweetAlert } from "../../../hooks/useSweetAlert";

// react
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// redux
import { useDispatch } from "react-redux";
import { setCurrentMonth } from "../../../redux/budgetsSlice";
import { removeBudget } from "../../../redux/budgetsSlice";
import { editCategory } from "../../../redux/categoriesSlice";

// supabase
import { supabase } from "../../../config/supabase";

// gsap
import gsap from "gsap";

// react-select
import Select from "react-select";

// react-icons
import {
    FiPlus,
    FiDownload,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiTarget,
    FiAlertTriangle,
    FiTrendingUp,
    FiClock,
} from "react-icons/fi";
import { FaBoxOpen } from "react-icons/fa";

// ── Constants ───────────────────────────────────────────────
const ITEMS_PER_PAGE = 9;

const STATUS_OPTIONS = [
    { value: "on-track", label: "On Track" },
    { value: "at-risk", label: "At Risk" },
    { value: "over-budget", label: "Over Budget" },
];

// ── Helpers ─────────────────────────────────────────────────
function formatMonth(monthStr) {
    if (!monthStr) return "";
    const [y, m] = monthStr.split("-");
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(monthStr, delta) {
    const [y, m] = monthStr.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ════════════════════════════════════════════════════════════
// BUDGETS PAGE
// ════════════════════════════════════════════════════════════
function BudgetsPage() {
    const dispatch = useDispatch();
    const selectStyles = useMemo(() => getSelectStyles(), []);
    const { showSuccess } = useSweetAlert();

    // ── Data Hook ───────────────────────────────────────────
    const {
        enrichedBudgets,
        currency,
        userId,
        currentMonth,
        loading,
        totalLimit,
        totalSpent,
        totalPct,
        onTrackCount,
        overBudgetCount,
        atRiskCount,
        daysRemaining,
        availableCategories,
    } = useBudgetsPageData();

    // ── UI state ────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(null);
    const [page, setPage] = useState(1);
    const [modalState, setModalState] = useState({
        open: false,
        type: "add",
        budget: null,
    });
    const [drawerBudget, setDrawerBudget] = useState(null);
    const [showUnbudgeted, setShowUnbudgeted] = useState(false);

    // ── GSAP refs ───────────────────────────────────────────
    const containerRef = useRef(null);
    const cardRefs = useRef([]);

    // ── Entrance Animation ──────────────────────────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            const animTargets = el.querySelectorAll("[data-anim]");
            gsap.from(animTargets, {
                y: 24,
                opacity: 0,
                duration: 0.5,
                stagger: 0.07,
                ease: "power3.out",
            });
        }, el);

        return () => ctx.revert();
    }, []);

    // ── Card stagger animation on data change ───────────────
    useEffect(() => {
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const cards = cardRefs.current.filter(Boolean);
        if (cards.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.from(cards, {
                y: 20,
                opacity: 0,
                scale: 0.97,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
                clearProps: "all",
            });
        });

        return () => ctx.revert();
    }, [enrichedBudgets, page, search, statusFilter]);

    // ── Month Navigation ────────────────────────────────────
    const handlePrevMonth = useCallback(() => {
        dispatch(setCurrentMonth(shiftMonth(currentMonth, -1)));
        setPage(1);
    }, [dispatch, currentMonth]);

    const handleNextMonth = useCallback(() => {
        dispatch(setCurrentMonth(shiftMonth(currentMonth, 1)));
        setPage(1);
    }, [dispatch, currentMonth]);

    const handleToday = useCallback(() => {
        dispatch(setCurrentMonth(getToday()));
        setPage(1);
    }, [dispatch]);

    // ── Filtering ───────────────────────────────────────────
    const filteredBudgets = useMemo(() => {
        let list = [...enrichedBudgets];

        if (search) {
            const q = search.toLowerCase();
            list = list.filter((b) =>
                (b.category_name || "").toLowerCase().includes(q),
            );
        }

        if (statusFilter) {
            list = list.filter((b) => b.status === statusFilter.value);
        }

        return list;
    }, [enrichedBudgets, search, statusFilter]);

    const hasActiveFilters = search || statusFilter;

    const clearAllFilters = useCallback(() => {
        setSearch("");
        setStatusFilter(null);
        setPage(1);
    }, []);

    // ── Pagination ──────────────────────────────────────────
    const totalPages = Math.max(
        1,
        Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE),
    );
    const pagedBudgets = useMemo(
        () =>
            filteredBudgets.slice(
                (page - 1) * ITEMS_PER_PAGE,
                page * ITEMS_PER_PAGE,
            ),
        [filteredBudgets, page],
    );

    // ── Handlers ────────────────────────────────────────────
    const openAddModal = useCallback(() => {
        setModalState({ open: true, type: "add", budget: null });
    }, []);

    const openEditModal = useCallback((budget) => {
        setModalState({ open: true, type: "edit", budget });
    }, []);

    const closeModal = useCallback(() => {
        setModalState({ open: false, type: "add", budget: null });
    }, []);

    const handleModalSuccess = useCallback(
        (action) => {
            const msg =
                action === "add"
                    ? "Budget created successfully!"
                    : "Budget updated successfully!";
            showSuccess("Success!", msg);
        },
        [showSuccess],
    );

    const handleInfoClick = useCallback((budget) => {
        setDrawerBudget(budget);
    }, []);

    const handleExport = useCallback(() => {
        exportBudgetsToExcel(filteredBudgets, currency, currentMonth);
    }, [filteredBudgets, currency, currentMonth]);

    // ── Delete Handler ──────────────────────────────────────
    const handleDelete = useCallback(
        async (budget) => {
            const Swal = (await import("sweetalert2")).default;

            const dangerColor =
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-danger")
                    .trim() || "#c0392b";
            const primaryColor =
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-primary")
                    .trim() || "#a0522d";
            const mutedColor =
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-text-muted")
                    .trim() || "#a0522d";
            const elevatedColor =
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-bg-elevated")
                    .trim() || "#ffffff";
            const textPrimary =
                getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-text-primary")
                    .trim() || "#2d1409";

            const result = await Swal.fire({
                background: elevatedColor,
                color: textPrimary,
                title: "Delete Budget?",
                html:
                    `You are about to delete the budget for <strong>"${budget.category_name}"</strong> (${formatMonth(budget.month)}).<br><br>` +
                    `This budget has <strong>${budget.txCount || 0} transactions</strong> this month.<br><br>` +
                    `How would you like to proceed?`,
                icon: "warning",
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: "Delete Budget & Nullify Transactions",
                denyButtonText: "Delete Budget Only",
                cancelButtonText: "Cancel",
                confirmButtonColor: dangerColor,
                denyButtonColor: primaryColor,
                cancelButtonColor: mutedColor,
                reverseButtons: true,
            });

            if (result.isConfirmed) {
                // Delete budget + null out category on transactions
                try {
                    // 1. Null category on related transactions in DB
                    const { error: dbError } = await supabase
                        .from("transactions")
                        .update({
                            category_id: null,
                            category_name: null,
                            category_icon: null,
                            category_color: null,
                        })
                        .eq("category_id", budget.category_id);

                    if (dbError) throw dbError;

                    // 2. Set is_default = false on the category
                    await dispatch(
                        editCategory({
                            id: budget.category_id,
                            changes: { is_default: false },
                        }),
                    ).unwrap();

                    // 3. Delete budget
                    await dispatch(removeBudget(budget.id)).unwrap();
                    showSuccess(
                        "Budget Deleted!",
                        `Budget for "${budget.category_name}" was removed. Related transactions were disassociated.`,
                    );
                } catch (err) {
                    console.error("Budget delete + nullify failed:", err);
                }
            } else if (result.isDenied) {
                // Delete budget only — keep transactions with their category
                try {
                    // 1. Set is_default = false on the category
                    await dispatch(
                        editCategory({
                            id: budget.category_id,
                            changes: { is_default: false },
                        }),
                    ).unwrap();

                    // 2. Delete budget
                    await dispatch(removeBudget(budget.id)).unwrap();
                    showSuccess(
                        "Budget Deleted!",
                        `Budget for "${budget.category_name}" was removed. Transactions remain unchanged.`,
                    );
                } catch (err) {
                    console.error("Budget delete failed:", err);
                }
            }
        },
        [dispatch, showSuccess],
    );

    // ── Loading State ───────────────────────────────────────
    if (loading) {
        return (
            <section className={styles.container}>
                <div className={styles.emptyState}>
                    <p className={styles.emptyDesc}>Loading budgets...</p>
                </div>
            </section>
        );
    }

    const isCurrentMonth = currentMonth === getToday();

    return (
        <section
            className={styles.container}
            ref={containerRef}
            aria-label="Budgets management page"
        >
            {/* ═══ PAGE HEADER ═══ */}
            <header className={styles.pageHeader} data-anim="header">
                <div className={styles.titleRow}>
                    <h1 className={styles.pageTitle}>Budgets</h1>
                    <span
                        className={styles.countBadge}
                        aria-label={`${enrichedBudgets.length} budgets`}
                    >
                        {enrichedBudgets.length}
                    </span>
                </div>
                <div className={styles.headerActions}>
                    <MainButton
                        action="outline"
                        size="sm"
                        title="Export to Excel"
                        clickEvent={handleExport}
                        isDisabled={filteredBudgets.length === 0}
                    >
                        <FiDownload size={15} />
                        Export
                    </MainButton>
                    <MainButton
                        action="primary"
                        size="sm"
                        title="Add a new budget"
                        clickEvent={openAddModal}
                    >
                        <FiPlus size={15} />
                        Add Budget
                    </MainButton>
                </div>
            </header>

            {/* ═══ MONTH NAVIGATOR ═══ */}
            <nav
                className={styles.monthNav}
                data-anim="month-nav"
                aria-label="Month navigation"
            >
                <button
                    className={styles.monthBtn}
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    type="button"
                >
                    <FiChevronLeft />
                </button>
                <span className={styles.monthLabel}>
                    {formatMonth(currentMonth)}
                </span>
                <button
                    className={styles.monthBtn}
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    type="button"
                >
                    <FiChevronRight />
                </button>
                {!isCurrentMonth && (
                    <button
                        className={styles.todayBtn}
                        onClick={handleToday}
                        type="button"
                    >
                        Today
                    </button>
                )}
            </nav>

            {/* ═══ OVERVIEW STATS ═══ */}
            <div className={styles.overviewRow} data-anim="overview">
                <div className={styles.overviewCard}>
                    <span
                        className={styles.overviewIconWrap}
                        style={{
                            background: "var(--color-primary-light)",
                            color: "var(--color-primary)",
                        }}
                    >
                        <FiTarget />
                    </span>
                    <div className={styles.overviewMeta}>
                        <span className={styles.overviewLabel}>
                            Total Budget
                        </span>
                        <span className={styles.overviewValue}>
                            {currency}{" "}
                            {totalLimit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>

                <div className={styles.overviewCard}>
                    <span
                        className={styles.overviewIconWrap}
                        style={{
                            background: "var(--color-expense-bg)",
                            color: "var(--color-expense)",
                        }}
                    >
                        <FiTrendingUp />
                    </span>
                    <div className={styles.overviewMeta}>
                        <span className={styles.overviewLabel}>
                            Total Spent
                        </span>
                        <span className={styles.overviewValue}>
                            {currency}{" "}
                            {totalSpent.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>

                <div className={styles.overviewCard}>
                    <span
                        className={styles.overviewIconWrap}
                        style={{
                            background:
                                overBudgetCount > 0
                                    ? "var(--color-danger-bg)"
                                    : "var(--color-success-bg)",
                            color:
                                overBudgetCount > 0
                                    ? "var(--color-danger)"
                                    : "var(--color-success)",
                        }}
                    >
                        <FiAlertTriangle />
                    </span>
                    <div className={styles.overviewMeta}>
                        <span className={styles.overviewLabel}>Status</span>
                        <span className={styles.overviewValue}>
                            {onTrackCount} ✓ · {atRiskCount} ⚠ ·{" "}
                            {overBudgetCount} ✗
                        </span>
                    </div>
                </div>

                <div className={styles.overviewCard}>
                    <span
                        className={styles.overviewIconWrap}
                        style={{
                            background: "var(--color-transfer-bg)",
                            color: "var(--color-transfer)",
                        }}
                    >
                        <FiClock />
                    </span>
                    <div className={styles.overviewMeta}>
                        <span className={styles.overviewLabel}>Days Left</span>
                        <span className={styles.overviewValue}>
                            {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══ TOTAL PROGRESS BAR ═══ */}
            {enrichedBudgets.length > 0 && (
                <div className={styles.summaryProgress} data-anim="progress">
                    <div className={styles.summaryLabelRow}>
                        <span className={styles.summaryLabelText}>
                            Overall Budget Usage
                        </span>
                        <span className={styles.summaryPct}>
                            {Math.round(totalPct)}%
                        </span>
                    </div>
                    <div className={styles.summaryBarBg}>
                        <div
                            className={styles.summaryBarFill}
                            style={{ width: `${Math.min(totalPct, 100)}%` }}
                            data-danger={totalPct >= 100 ? "true" : undefined}
                            data-warning={
                                totalPct >= 85 && totalPct < 100
                                    ? "true"
                                    : undefined
                            }
                        />
                    </div>
                    <div className={styles.summaryAmounts}>
                        <span>
                            {currency}{" "}
                            {totalSpent.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}{" "}
                            spent
                        </span>
                        <span>
                            of {currency}{" "}
                            {totalLimit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>
            )}

            {/* ═══ FILTER BAR ═══ */}
            <div
                className={styles.filterBar}
                data-anim="filter-bar"
                role="search"
                aria-label="Filter budgets"
            >
                <div className={styles.searchWrap}>
                    <FiSearch
                        className={styles.searchIcon}
                        aria-hidden="true"
                    />
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search budgets..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        aria-label="Search budgets by category name"
                        id="budget-filter-search"
                    />
                </div>
                <div className={styles.selectWrap}>
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(v) => {
                            setStatusFilter(v);
                            setPage(1);
                        }}
                        styles={selectStyles}
                        isClearable
                        placeholder="Status: All"
                        aria-label="Filter by status"
                        inputId="budget-filter-status"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                {hasActiveFilters && (
                    <button
                        className={styles.clearBtn}
                        onClick={clearAllFilters}
                        type="button"
                        aria-label="Clear all filters"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* ═══ BUDGET CARDS GRID ═══ */}
            {pagedBudgets.length > 0 ? (
                <>
                    <h2
                        className={styles.sectionHeading}
                        data-anim="section-heading"
                    >
                        Active Budgets ({filteredBudgets.length})
                    </h2>
                    <div className={styles.cardGrid}>
                        {pagedBudgets.map((budget, i) => (
                            <div
                                key={budget.id}
                                ref={(el) => (cardRefs.current[i] = el)}
                            >
                                <BudgetCard
                                    budget={budget}
                                    currency={currency}
                                    onInfoClick={handleInfoClick}
                                    onEditClick={openEditModal}
                                    onDeleteClick={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.emptyState} data-anim="empty">
                    <FaBoxOpen className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>
                        {hasActiveFilters
                            ? "No Matching Budgets"
                            : "No Budgets Yet"}
                    </h2>
                    <p className={styles.emptyDesc}>
                        {hasActiveFilters
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : `No budgets are set for ${formatMonth(currentMonth)}. Create one to start tracking your spending.`}
                    </p>
                    {!hasActiveFilters && (
                        <MainButton
                            action="primary"
                            size="md"
                            title="Create your first budget"
                            clickEvent={openAddModal}
                        >
                            <FiPlus size={15} />
                            Add Budget
                        </MainButton>
                    )}
                </div>
            )}

            {/* ═══ UNBUDGETED CATEGORIES ═══ */}
            {availableCategories.length > 0 && (
                <>
                    <button
                        className={styles.clearBtn}
                        onClick={() => setShowUnbudgeted((prev) => !prev)}
                        type="button"
                        style={{
                            textAlign: "left",
                            marginTop: "var(--space-1)",
                        }}
                    >
                        {showUnbudgeted ? "Hide" : "Show"} Unbudgeted Categories
                        ({availableCategories.length})
                    </button>
                    {showUnbudgeted && (
                        <div className={styles.cardGrid}>
                            {availableCategories.map((cat) => (
                                <UnbudgetedCard
                                    key={cat.id}
                                    category={cat}
                                    onSetBudget={(c) => {
                                        // Pre-select this category in the add modal
                                        setModalState({
                                            open: true,
                                            type: "add",
                                            budget: null,
                                            preselect: c,
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ═══ PAGINATION ═══ */}
            {filteredBudgets.length > ITEMS_PER_PAGE && (
                <nav
                    className={styles.pagination}
                    data-anim="pagination"
                    aria-label="Budget pages navigation"
                >
                    <span className={styles.pageInfo}>
                        Page {page} of {totalPages} · {filteredBudgets.length}{" "}
                        budget{filteredBudgets.length !== 1 ? "s" : ""}
                    </span>
                    <div className={styles.pageButtons}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            aria-label="Previous page"
                            type="button"
                        >
                            <FiChevronLeft />
                        </button>
                        <button
                            className={styles.pageBtn}
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages}
                            aria-label="Next page"
                            type="button"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </nav>
            )}

            {/* ═══ ADD/EDIT BUDGET MODAL ═══ */}
            {modalState.open && (
                <AddBudgetModal
                    type={modalState.type}
                    budgetToEdit={modalState.budget}
                    onClose={closeModal}
                    userId={userId}
                    currentMonth={currentMonth}
                    availableCategories={availableCategories}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* ═══ BUDGET INFO DRAWER ═══ */}
            {drawerBudget && (
                <BudgetInfoDrawer
                    budget={drawerBudget}
                    onClose={() => setDrawerBudget(null)}
                    currency={currency}
                />
            )}
        </section>
    );
}

export default BudgetsPage;
