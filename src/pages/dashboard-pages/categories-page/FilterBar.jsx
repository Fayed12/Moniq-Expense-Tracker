// local
import styles from "./FilterBar.module.css";
import { getSelectStyles } from "../../../utils/reactSelectStyles";

// react
import { useMemo } from "react";

// react-select
import Select from "react-select";

// react-icons
import { FiSearch, FiX } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ── Filter option constants ─────────────────────────────────
const TYPE_OPTIONS = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "both", label: "Both" },
];

// ════════════════════════════════════════════════════════════
// FILTER BAR COMPONENT FOR CATEGORIES
// ════════════════════════════════════════════════════════════
function FilterBar({
    search,
    onSearchChange,
    selectedType,
    onTypeChange,
    onClearAll,
}) {
    const selectStyles = useMemo(() => getSelectStyles(), []);

    // ── Check if any filter is active ───────────────────────
    const hasActiveFilters = search || selectedType;

    // ── Build active filter chips ───────────────────────────
    const activeChips = useMemo(() => {
        const chips = [];

        if (selectedType) {
            chips.push({
                key: "type",
                label: "Type",
                value: selectedType.label,
                onRemove: () => onTypeChange(null),
            });
        }

        return chips;
    }, [selectedType, onTypeChange]);

    return (
        <div data-anim="filter-bar">
            {/* ═══ FILTER CONTROLS ═══ */}
            <div
                className={styles.filterBar}
                role="search"
                aria-label="Filter categories"
            >
                {/* Search by name */}
                <div className={styles.searchWrap}>
                    <FiSearch className={styles.searchIcon} aria-hidden="true" />
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search categories by name"
                        id="cat-filter-search"
                    />
                </div>

                {/* Type — single select */}
                <div className={styles.selectWrap}>
                    <Select
                        options={TYPE_OPTIONS}
                        value={selectedType}
                        onChange={onTypeChange}
                        styles={selectStyles}
                        isClearable
                        placeholder="Type: All"
                        aria-label="Filter by type"
                        inputId="cat-filter-type"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Clear All */}
                {hasActiveFilters && (
                    <button
                        className={styles.clearBtn}
                        onClick={onClearAll}
                        type="button"
                        aria-label="Clear all filters"
                        id="cat-filter-clear"
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-primary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--weight-semibold)",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* ═══ ACTIVE FILTER CHIPS ═══ */}
            {activeChips.length > 0 && (
                <div
                    className={styles.chipsRow}
                    aria-label="Active filters"
                    role="list"
                    style={{ marginTop: "var(--space-2)" }}
                >
                    {activeChips.map((chip) => (
                        <span
                            key={chip.key}
                            className={styles.chip}
                            role="listitem"
                        >
                            <span className={styles.chipLabel}>
                                {chip.label}:
                            </span>
                            {chip.value}
                            <button
                                className={styles.chipRemove}
                                onClick={chip.onRemove}
                                aria-label={`Remove ${chip.label} filter`}
                                type="button"
                            >
                                <FiX />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

FilterBar.propTypes = {
    search: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    selectedType: PropTypes.object,
    onTypeChange: PropTypes.func.isRequired,
    onClearAll: PropTypes.func.isRequired,
};

export default FilterBar;
