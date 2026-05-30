// local
import styles from "./CategoriesTable.module.css";

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
import { FiEdit2, FiTrash2, FiInfo, FiInbox, FiArchive, FiRotateCcw, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
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
} from "react-icons/fa";
import { LuStarOff } from "react-icons/lu";

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

// ════════════════════════════════════════════════════════════
// CATEGORIES TABLE COMPONENT
// ════════════════════════════════════════════════════════════
function CategoriesTable({
    categories = [],
    categoryStats = {},
    currency = "EGP",
    selectedIds,
    onSelectionChange,
    onInfoClick,
    onEditClick,
    onDeleteClick,
    onArchiveClick,
    onToggleDefaultClick,
}) {
    const tbodyRef = useRef(null);

    // ── GSAP row stagger animation ──────────────────────────
    useEffect(() => {
        if (!tbodyRef.current || !categories.length) return;
        
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
                stagger: 0.03,
                ease: "power3.out",
                clearProps: "all",
            });
        });

        return () => ctx.revert();
    }, [categories.length]);

    // ── Select all handler ──────────────────────────────────
    const allSelected =
        categories.length > 0 &&
        categories.every((c) => selectedIds.has(c.id));
    const someSelected =
        categories.some((c) => selectedIds.has(c.id)) && !allSelected;

    const handleSelectAll = () => {
        if (allSelected) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(categories.map((c) => c.id)));
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

    if (!categories.length) {
        return (
            <div className={styles.tableWrap} data-anim="table">
                <div className={styles.emptyState}>
                    <FiInbox className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyText}>
                        No categories found. Try adjusting your filters.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tableWrap} data-anim="table">
            <TableContainer className={styles.tableScroll}>
                <Table aria-label="Categories table" id="categories-table">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    onChange={handleSelectAll}
                                    slotProps={{
                                        input: {
                                            "aria-label": "Select all categories",
                                        },
                                    }}
                                />
                            </TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell className={styles.budgetCol}>Budget Limit</TableCell>
                            <TableCell className={styles.spentCol}>Spent This Month</TableCell>
                            <TableCell align="center" className={styles.txnsCol}>Transactions</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody ref={tbodyRef}>
                        {categories.map((cat) => {
                            const stats = categoryStats[cat.id] || {
                                transactionCount: 0,
                                spentThisMonth: 0,
                                budgetLimit: 0,
                            };

                            const isOverBudget = stats.budgetLimit > 0 && stats.spentThisMonth > stats.budgetLimit;

                            return (
                                <TableRow
                                    key={cat.id}
                                    hover
                                    selected={selectedIds.has(cat.id)}
                                    aria-label={`${cat.name} — Type: ${cat.type}`}
                                >
                                    {/* Checkbox */}
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedIds.has(cat.id)}
                                            onChange={() => handleSelectRow(cat.id)}
                                            slotProps={{
                                                input: {
                                                    "aria-label": `Select ${cat.name}`,
                                                },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Category name & icon */}
                                    <TableCell>
                                        <div className={styles.catCell}>
                                            <span
                                                className={styles.catIcon}
                                                style={{
                                                    background: `${cat.color || "var(--color-primary)"}18`,
                                                    color: cat.color || "var(--color-primary)",
                                                }}
                                                aria-hidden="true"
                                            >
                                                <DynamicIcon name={cat.icon} />
                                            </span>
                                            <div className={styles.catInfo}>
                                                <span className={styles.catName}>
                                                    {cat.name}
                                                </span>
                                                <div className={styles.tagBadgeRow}>
                                                    {cat.is_default && (
                                                        <span className={styles.defaultTag}>
                                                            Default
                                                        </span>
                                                    )}
                                                    {cat.is_archived && (
                                                        <span className={styles.archivedTag}>
                                                            Archived
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <span
                                            className={styles.typeBadge}
                                            data-type={cat.type || "both"}
                                        >
                                            {cat.type || "both"}
                                        </span>
                                    </TableCell>

                                    {/* Budget Limit */}
                                    <TableCell className={styles.budgetCol}>
                                        <span className={styles.budgetText}>
                                            {stats.budgetLimit > 0 ? (
                                                <>
                                                    {currency}{" "}
                                                    {stats.budgetLimit.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                    <span className={styles.perMonth}> / mo</span>
                                                </>
                                            ) : (
                                                <span className={styles.noBudget}>No Budget</span>
                                            )}
                                        </span>
                                    </TableCell>

                                    {/* Spent This Month */}
                                    <TableCell className={styles.spentCol}>
                                        <span
                                            className={
                                                isOverBudget
                                                    ? styles.spentOverBudget
                                                    : styles.spentNormal
                                            }
                                        >
                                            {currency}{" "}
                                            {stats.spentThisMonth.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </TableCell>

                                    {/* Linked Transactions */}
                                    <TableCell align="center" className={styles.txnsCol}>
                                        <span className={styles.txnBadge}>
                                            {stats.transactionCount}
                                        </span>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="center">
                                        <div className={styles.actionsCell}>
                                            {/* Toggle Default Action */}
                                            {stats.budgetLimit > 0 && (
                                                <button
                                                    className={styles.actionBtn}
                                                    data-action="default"
                                                    onClick={() => onToggleDefaultClick(cat)}
                                                    aria-label={
                                                        cat.is_default
                                                            ? `Remove Default for ${cat.name}`
                                                            : `Make Default for ${cat.name}`
                                                    }
                                                    title={
                                                        cat.is_default
                                                            ? "Remove Default Category"
                                                            : "Make Default Category"
                                                    }
                                                    type="button"
                                                >
                                                    {cat.is_default ? (
                                                        <LuStarOff style={{ color: "#ffb300" }} />
                                                    ) : (
                                                        <FiStar />
                                                    )}
                                                </button>
                                            )}

                                            {/* Info */}
                                            <button
                                                className={styles.actionBtn}
                                                data-action="info"
                                                onClick={() => onInfoClick(cat)}
                                                aria-label={`View details for ${cat.name}`}
                                                title="View details"
                                                type="button"
                                            >
                                                <FiInfo />
                                            </button>

                                            {/* Edit */}
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => onEditClick(cat)}
                                                aria-label={`Edit ${cat.name}`}
                                                title="Edit category"
                                                type="button"
                                            >
                                                <FiEdit2 />
                                            </button>

                                            {/* Archive/Restore */}
                                            <button
                                                className={styles.actionBtn}
                                                data-action="archive"
                                                onClick={() => onArchiveClick(cat)}
                                                aria-label={
                                                    cat.is_archived
                                                        ? `Restore ${cat.name}`
                                                        : `Archive ${cat.name}`
                                                }
                                                title={cat.is_archived ? "Restore category" : "Archive category"}
                                                type="button"
                                            >
                                                {cat.is_archived ? <FiRotateCcw /> : <FiArchive />}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                className={styles.actionBtn}
                                                data-action="delete"
                                                onClick={() => onDeleteClick(cat)}
                                                aria-label={`Delete ${cat.name}`}
                                                title="Delete category"
                                                type="button"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

CategoriesTable.propTypes = {
    categories: PropTypes.array.isRequired,
    categoryStats: PropTypes.object,
    currency: PropTypes.string,
    selectedIds: PropTypes.instanceOf(Set).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    onInfoClick: PropTypes.func.isRequired,
    onEditClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onArchiveClick: PropTypes.func.isRequired,
    onToggleDefaultClick: PropTypes.func.isRequired,
};

export default CategoriesTable;
