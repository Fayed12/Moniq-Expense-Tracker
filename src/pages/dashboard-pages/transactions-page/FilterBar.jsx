// local
import styles from "./FilterBar.module.css";
import { getSelectStyles } from "../../../utils/reactSelectStyles";

// react
import { useMemo, forwardRef } from "react";

// react-select
import Select from "react-select";

// react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// react-icons
import { FiSearch, FiX } from "react-icons/fi";

// prop-types
import PropTypes from "prop-types";

// ── Filter option constants ─────────────────────────────────
const TYPE_OPTIONS = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
    { value: "transfer", label: "Transfer" },
];

// ── Custom date input ───────────────────────────────────
const DateInput = forwardRef(({ value, onClick }, ref) => (
    <input
        ref={ref}
        className={styles.dateInput}
        onClick={onClick}
        value={value}
        readOnly
        placeholder="Date range"
        aria-label="Date range filter"
        id="txn-filter-date"
    />
));
DateInput.displayName = "DateInput";

// ════════════════════════════════════════════════════════════
// FILTER BAR COMPONENT
// ════════════════════════════════════════════════════════════
function FilterBar({
    search,
    onSearchChange,
    selectedTypes,
    onTypesChange,
    selectedCategory,
    onCategoryChange,
    selectedAccount,
    onAccountChange,
    dateRange,
    onDateChange,
    categories = [],
    accounts = [],
    onClearAll,
}) {
    const selectStyles = useMemo(() => getSelectStyles(), []);

    // ── Category options for react-select ───────────────────
    const categoryOptions = useMemo(
        () =>
            categories.map((c) => ({
                value: c.id,
                label: c.name,
            })),
        [categories],
    );

    // ── Account options for react-select ────────────────────
    const accountOptions = useMemo(
        () =>
            accounts.map((a) => ({
                value: a.id,
                label: a.name,
            })),
        [accounts],
    );

    // ── Check if any filter is active ───────────────────────
    const hasActiveFilters =
        search ||
        selectedTypes?.length > 0 ||
        selectedCategory ||
        selectedAccount ||
        dateRange[0] ||
        dateRange[1];

    // ── Build active filter chips ───────────────────────────
    const activeChips = useMemo(() => {
        const chips = [];

        if (selectedTypes?.length > 0) {
            selectedTypes.forEach((t) => {
                chips.push({
                    key: `type-${t.value}`,
                    label: "Type",
                    value: t.label,
                    onRemove: () =>
                        onTypesChange(
                            selectedTypes.filter(
                                (st) => st.value !== t.value,
                            ),
                        ),
                });
            });
        }

        if (selectedCategory) {
            chips.push({
                key: "category",
                label: "Category",
                value: selectedCategory.label,
                onRemove: () => onCategoryChange(null),
            });
        }

        if (selectedAccount) {
            chips.push({
                key: "account",
                label: "Account",
                value: selectedAccount.label,
                onRemove: () => onAccountChange(null),
            });
        }

        if (dateRange[0] || dateRange[1]) {
            const fmt = (d) =>
                d?.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
            chips.push({
                key: "date",
                label: "Date",
                value: `${fmt(dateRange[0]) || "..."} – ${fmt(dateRange[1]) || "..."}`,
                onRemove: () => onDateChange([null, null]),
            });
        }

        return chips;
    }, [
        selectedTypes,
        selectedCategory,
        selectedAccount,
        dateRange,
        onTypesChange,
        onCategoryChange,
        onAccountChange,
        onDateChange,
    ]);



    return (
        <div data-anim="filter-bar">
            {/* ═══ FILTER CONTROLS ═══ */}
            <div
                className={styles.filterBar}
                role="search"
                aria-label="Filter transactions"
            >
                {/* Search by name */}
                <div className={styles.searchWrap}>
                    <FiSearch className={styles.searchIcon} aria-hidden="true" />
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search transactions by name"
                        id="txn-filter-search"
                    />
                </div>

                {/* Type — multi select */}
                <div className={styles.selectWrap}>
                    <Select
                        options={TYPE_OPTIONS}
                        value={selectedTypes}
                        onChange={onTypesChange}
                        styles={selectStyles}
                        isMulti
                        isClearable
                        placeholder="Type: All"
                        aria-label="Filter by type"
                        inputId="txn-filter-type"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Category */}
                <div className={styles.selectWrap}>
                    <Select
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={onCategoryChange}
                        styles={selectStyles}
                        isClearable
                        placeholder="Category"
                        aria-label="Filter by category"
                        inputId="txn-filter-category"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Account */}
                <div className={styles.selectWrap}>
                    <Select
                        options={accountOptions}
                        value={selectedAccount}
                        onChange={onAccountChange}
                        styles={selectStyles}
                        isClearable
                        placeholder="Account"
                        aria-label="Filter by account"
                        inputId="txn-filter-account"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* Date Range */}
                <div className={styles.dateWrap}>
                    <DatePicker
                        selectsRange
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        onChange={onDateChange}
                        customInput={<DateInput />}
                        dateFormat="MMM d, yyyy"
                        isClearable
                        placeholderText="Date range"
                        portalId="root-portal"
                    />
                </div>

                {/* Clear All */}
                {hasActiveFilters && (
                    <button
                        className={styles.clearBtn}
                        onClick={onClearAll}
                        type="button"
                        aria-label="Clear all filters"
                        id="txn-filter-clear"
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
    selectedTypes: PropTypes.array,
    onTypesChange: PropTypes.func.isRequired,
    selectedCategory: PropTypes.object,
    onCategoryChange: PropTypes.func.isRequired,
    selectedAccount: PropTypes.object,
    onAccountChange: PropTypes.func.isRequired,
    dateRange: PropTypes.array.isRequired,
    onDateChange: PropTypes.func.isRequired,
    categories: PropTypes.array,
    accounts: PropTypes.array,
    onClearAll: PropTypes.func.isRequired,
};

export default FilterBar;
