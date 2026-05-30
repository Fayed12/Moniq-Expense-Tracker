// local
import styles from "./categoriesPage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import FilterBar from "./FilterBar";
import CategoriesTable from "./CategoriesTable";
import AddCategoryModal from "./AddCategoryModal";
import CategoryInfoDrawer from "./CategoryInfoDrawer";
import { useCategoriesPageData } from "../../../hooks/useCategoriesPageData";
import { useSweetAlert } from "../../../hooks/useSweetAlert";
import { editCategory, doArchiveCategory, removeCategory } from "../../../redux/categoriesSlice";
import { removeBudget } from "../../../redux/budgetsSlice";
import { removeTransactions } from "../../../redux/transactionsSlice";
import { exportCategoriesToExcel } from "./exportCategories";
import { supabase } from "../../../config/supabase";

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

// SweetAlert2
import Swal from "sweetalert2";

// ── Constants ───────────────────────────────────────────────
const ROWS_PER_PAGE = 10;

// ════════════════════════════════════════════════════════════
// CATEGORIES PAGE COMPONENT
// ════════════════════════════════════════════════════════════
function CategoriesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const animRan = useRef(false);

    // ── Page data ───────────────────────────────────────────
    const {
        categories,
        transactions,
        currency,
        userId,
        categoryStats,
        loading,
    } = useCategoriesPageData();

    const { showSuccess } = useSweetAlert();

    // ── Local state ─────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [infoCat, setInfoCat] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [page, setPage] = useState(0);
    const [showArchived, setShowArchived] = useState(false); // Toggle active vs archived table

    // ── Filter state ────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [selectedType, setSelectedType] = useState(null);

    // ── Filter change handlers ──────────────────────────────
    const handleSearchChange = useCallback((val) => {
        setSearch(val);
        setPage(0);
    }, []);

    const handleTypeChange = useCallback((val) => {
        setSelectedType(val);
        setPage(0);
    }, []);

    const handleClearAll = useCallback(() => {
        setSearch("");
        setSelectedType(null);
        setPage(0);
    }, []);

    // ── Filtered Categories ─────────────────────────────────
    const filteredCategories = useMemo(() => {
        // First filter by archive status
        let result = categories.filter((c) => c.is_archived === showArchived);

        // Search by name
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter((c) => c.name?.toLowerCase().includes(term));
        }

        // Type filter (income, expense, both)
        if (selectedType) {
            result = result.filter((c) => c.type === selectedType.value);
        }

        return result;
    }, [categories, showArchived, search, selectedType]);

    // ── Pagination ──────────────────────────────────────────
    const totalFiltered = filteredCategories.length;
    const totalPages = Math.ceil(totalFiltered / ROWS_PER_PAGE);
    const pageStart = page * ROWS_PER_PAGE;
    const pageEnd = Math.min(pageStart + ROWS_PER_PAGE, totalFiltered);
    const paginatedCategories = filteredCategories.slice(
        pageStart,
        pageEnd,
    );

    // ── Toggle active/archived view ─────────────────────────
    const handleTabToggle = (archivedState) => {
        setShowArchived(archivedState);
        setPage(0);
        setSelectedIds(new Set());
    };

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

            // Toggles switcher
            tl.from(
                "[data-anim='toggles']",
                {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.3,
                    clearProps: "all",
                },
                "-=0.2",
            );

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

    // ── Star (Default) Registration Handler ────────────────
    const handleToggleDefault = useCallback(
        async (cat) => {
            try {
                await dispatch(
                    editCategory({
                        id: cat.id,
                        changes: { is_default: !cat.is_default },
                    })
                ).unwrap();
                showSuccess(
                    cat.is_default ? "Removed from Default" : "Added as Default Category",
                    `"${cat.name}" is ${cat.is_default ? "no longer default" : "now default"} for new transactions.`
                );
            } catch (err) {
                console.error("Toggle default failed:", err);
            }
        },
        [dispatch, showSuccess]
    );

    // ── Archive / Restore Handler ──────────────────────────
    const handleArchive = useCallback(
        async (cat) => {
            try {
                if (cat.is_archived) {
                    await dispatch(
                        editCategory({
                            id: cat.id,
                            changes: { is_archived: false },
                        })
                    ).unwrap();
                    showSuccess("Restored!", `"${cat.name}" has been unarchived.`);
                } else {
                    await dispatch(doArchiveCategory(cat.id)).unwrap();
                    showSuccess("Archived!", `"${cat.name}" has been moved to archives.`);
                }
            } catch (err) {
                console.error("Archive toggle failed:", err);
            }
        },
        [dispatch, showSuccess]
    );

    // ── Deletion Handler with Advanced Choices ─────────────
    const handleDelete = useCallback(
        async (cat) => {
            const stats = categoryStats[cat.id] || { transactionCount: 0, spentThisMonth: 0, budgetLimit: 0, budgetId: null };

            const dangerColor = getComputedStyle(document.documentElement).getPropertyValue("--color-danger").trim() || "#c0392b";
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#a0522d";
            const mutedColor = getComputedStyle(document.documentElement).getPropertyValue("--color-text-muted").trim() || "#a0522d";
            const elevatedColor = getComputedStyle(document.documentElement).getPropertyValue("--color-bg-elevated").trim() || "#ffffff";
            const textPrimary = getComputedStyle(document.documentElement).getPropertyValue("--color-text-primary").trim() || "#2d1409";

            const result = await Swal.fire({
                background: elevatedColor,
                color: textPrimary,
                title: "Delete Category?",
                html: `You are about to delete <strong>"${cat.name}"</strong>.<br><br>` +
                      `This category is linked to <strong>${stats.transactionCount} transactions</strong>.<br><br>` +
                      `How do you want to proceed with the deletion?`,
                icon: "warning",
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: "Delete Everything (Category, budgets & transactions)",
                denyButtonText: "Delete Category Only (Keep transactions)",
                cancelButtonText: "Cancel",
                confirmButtonColor: dangerColor,
                denyButtonColor: primaryColor,
                cancelButtonColor: mutedColor,
                reverseButtons: true,
            });

            if (result.isConfirmed) {
                // Choice 1: Delete Everything (Cascade)
                try {
                    // 1. Delete associated budget
                    if (stats.budgetId) {
                        await dispatch(removeBudget(stats.budgetId)).unwrap();
                    }

                    // 2. Delete all related transactions
                    const relatedTxIds = transactions
                        .filter((t) => String(t.category_id) === String(cat.id))
                        .map((t) => t.id);
                    if (relatedTxIds.length > 0) {
                        await dispatch(removeTransactions(relatedTxIds)).unwrap();
                    }

                    // 3. Delete category
                    await dispatch(removeCategory(cat.id)).unwrap();
                    showSuccess("Deleted Everything!", `Category "${cat.name}" and all related budgets and transactions were removed.`);
                } catch (err) {
                    console.error("Cascade deletion failed:", err);
                }
            } else if (result.isDenied) {
                // Choice 2: Delete Category only (preserve transactions)
                try {
                    // 1. Delete associated budget
                    if (stats.budgetId) {
                        await dispatch(removeBudget(stats.budgetId)).unwrap();
                    }

                    // 2. Disassociate category on all database transactions
                    const { error: dbError } = await supabase
                        .from("transactions")
                        .update({
                            category_id: null,
                            category_name: null,
                            category_icon: null,
                            category_color: null
                        })
                        .eq("category_id", cat.id);

                    if (dbError) throw dbError;

                    // 3. Delete category
                    await dispatch(removeCategory(cat.id)).unwrap();
                    showSuccess("Deleted Category Only!", `Category "${cat.name}" and its budgets were removed. Transactions were preserved.`);
                } catch (err) {
                    console.error("Preserving deletion failed:", err);
                }
            }
        },
        [dispatch, transactions, categoryStats, showSuccess]
    );

    // ── Edit Click Handler ──────────────────────────────────
    const handleEdit = useCallback((cat) => {
        setEditCat(cat);
        setModalOpen(true);
    }, []);

    // ── Export Handler ──────────────────────────────────────
    const handleExport = useCallback(() => {
        exportCategoriesToExcel(filteredCategories, categoryStats, currency);
    }, [filteredCategories, categoryStats, currency]);

    // ── Modal Success Handler ───────────────────────────────
    const handleModalSuccess = useCallback((modalAction = "add") => {
        if (modalAction === "edit") {
            showSuccess("Updated!", "Category updated successfully.");
        } else {
            showSuccess("Added!", "Category created successfully.");
        }
    }, [showSuccess]);

    return (
        <main
            className={styles.container}
            ref={containerRef}
            aria-label="Categories page"
        >
            {/* ═══ REDIRECT ADVICE BANNER ═══ */}
            <div className={styles.budgetHint} data-anim="hint" role="note">
                <FaLightbulb className={styles.hintIcon} aria-hidden="true" />
                <p className={styles.hintText}>
                    Adding new categories? Remember to go to your **Budgets** section to define monthly spending allocations for each new active category.
                </p>
                <MainButton
                    action="outline"
                    size="sm"
                    title="Manage budgets"
                    clickEvent={() => navigate("/dashboard/budgets")}
                    className={styles.hintBtn}
                >
                    Manage Budgets
                </MainButton>
            </div>

            {/* ═══ TAB SEGMENTED SWITCHER ═══ */}
            <div className={styles.toggleContainer} data-anim="toggles">
                <div className={styles.toggleSwitch}>
                    <button
                        className={`${styles.toggleBtn} ${!showArchived ? styles.toggleBtnActive : ""}`}
                        onClick={() => handleTabToggle(false)}
                        type="button"
                    >
                        Active
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${showArchived ? styles.toggleBtnActive : ""}`}
                        onClick={() => handleTabToggle(true)}
                        type="button"
                    >
                        Archived
                    </button>
                    <div
                        className={`${styles.toggleSlider} ${showArchived ? styles.toggleSliderRight : ""}`}
                    />
                </div>
            </div>

            {/* ═══ PAGE HEADER ═══ */}
            <header className={styles.pageHeader} data-anim="header">
                <div className={styles.titleRow}>
                    <h1 className={styles.pageTitle} id="categories-page-title">
                        {showArchived ? "Archived Categories" : "Categories"}
                    </h1>
                    <span
                        className={styles.countBadge}
                        aria-live="polite"
                        aria-label={`${totalFiltered} categories`}
                    >
                        {totalFiltered.toLocaleString()}
                    </span>
                </div>

                <div className={styles.headerActions}>
                    {/* Export Button */}
                    <MainButton
                        action="outline"
                        size="md"
                        title="Export to Excel"
                        clickEvent={handleExport}
                        isDisabled={!filteredCategories.length}
                    >
                        <FiDownload size={16} />
                        Export
                    </MainButton>

                    {/* Add Category Button */}
                    {!showArchived && (
                        <MainButton
                            action="primary"
                            size="md"
                            title="Add new category"
                            clickEvent={() => {
                                setEditCat(null);
                                setModalOpen(true);
                            }}
                        >
                            <FiPlus size={16} />
                            Add Category
                        </MainButton>
                    )}
                </div>
            </header>

            {/* ═══ FILTER BAR ═══ */}
            <section className={styles.filterSection}>
                <FilterBar
                    search={search}
                    onSearchChange={handleSearchChange}
                    selectedType={selectedType}
                    onTypeChange={handleTypeChange}
                    onClearAll={handleClearAll}
                />
            </section>

            {/* ═══ CATEGORIES TABLE ═══ */}
            <section className={styles.tableSection}>
                <CategoriesTable
                    key={`table-${showArchived}-${page}`}
                    categories={paginatedCategories}
                    categoryStats={categoryStats}
                    currency={currency}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onInfoClick={(cat) => setInfoCat(cat)}
                    onEditClick={handleEdit}
                    onArchiveClick={handleArchive}
                    onDeleteClick={handleDelete}
                    onToggleDefaultClick={handleToggleDefault}
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
                            id="cat-page-prev"
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
                            id="cat-page-next"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </nav>
            )}

            {/* ═══ ADD/EDIT CATEGORY MODAL ═══ */}
            {modalOpen && (
                <AddCategoryModal
                    type={editCat ? "edit" : "add"}
                    categoryToEdit={editCat}
                    onClose={() => {
                        setModalOpen(false);
                        setEditCat(null);
                    }}
                    userId={userId}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* ═══ CATEGORY INFO DRAWER ═══ */}
            {infoCat && (
                <CategoryInfoDrawer
                    category={infoCat}
                    categoryStats={categoryStats}
                    onClose={() => setInfoCat(null)}
                    currency={currency}
                />
            )}
        </main>
    );
}

export default CategoriesPage;