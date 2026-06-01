// local
import styles from "./PageHeader.module.css";
import MainButton from "../ui/button/MainButton";

// react
import { useState, useRef, useEffect } from "react";

// data
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import Select from "react-select";

// react icons
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import { FaFileExcel, FaUniversity, FaCheck } from "react-icons/fa";

export default function PageHeader({
    selectedReportType,
    setSelectedReportType,
    selectedPeriod,
    setSelectedPeriod,
    customRange,
    setCustomRange,
    selectedAccountId,
    setSelectedAccountId,
    accountsList,
    currency,
    exportData, // current active report dataset passed down for Excel export
}) {
    const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Custom styles for react-select to perfectly fit our glassmorphism UI
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            background: "var(--color-bg-sunken)",
            borderColor: state.isFocused ? "var(--color-primary)" : "var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            minHeight: "var(--input-height-sm)",
            height: "var(--input-height-sm)",
            boxShadow: "none",
            cursor: "pointer",
            width: "100%",
            transition: "var(--transition-base)",
            "&:hover": {
                borderColor: "var(--color-border-strong)",
            },
            paddingLeft: "24px", // Space for bank icon offset
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: "0 var(--space-2)",
            height: "var(--input-height-sm)",
            display: "flex",
            alignItems: "center",
        }),
        input: (provided) => ({
            ...provided,
            margin: "0px",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: "var(--input-height-sm)",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: "var(--color-text-muted)",
            padding: "0 var(--space-2)",
            "&:hover": {
                color: "var(--color-text-primary)",
            },
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        menu: (provided) => ({
            ...provided,
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 999,
        }),
        option: (provided, state) => ({
            ...provided,
            background: state.isSelected
                ? "var(--color-primary-light)"
                : state.isFocused
                  ? "var(--color-bg-sunken)"
                  : "transparent",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: state.isSelected ? "var(--weight-semibold)" : "var(--weight-normal)",
            "&:active": {
                background: "var(--color-primary-light)",
            },
        }),
    };

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsReportDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const reportOptions = [
        { value: "monthly-summary", label: "📅 Monthly Summary", desc: "Overview of stats, budgets limit adherence, and top transactions." },
        { value: "category-report", label: "📊 Category Report", desc: "Spending rankings, deep dive lists, and category comparisons." },
        { value: "account-statement", label: "🏦 Account Statement", desc: "Collapsible accounts list, opening balances, and chronological ledgers." },
        { value: "budget-performance", label: "💰 Budget Performance", desc: "Overall health dial gauge score and horizontal limits cards." },
        { value: "goals-progress", label: "🎯 Goals Progress", desc: "Goal grids depicting SVG rings, deadlines countdown, and logs." },
        { value: "income-expense", label: "📈 Income & Expense", desc: "Daily transaction balances and category flow summaries." },
    ];

    const periodOptions = [
        { value: "this-week", label: "This Week" },
        { value: "this-month", label: "This Month" },
        { value: "last-month", label: "Last Month" },
        { value: "last-3-months", label: "Last 3M" },
        { value: "last-6-months", label: "Last 6M" },
        { value: "this-year", label: "This Year" },
        { value: "custom", label: "Custom" },
    ];

    const currentReport = reportOptions.find((r) => r.value === selectedReportType) || reportOptions[0];

    // Trigger XLSX download using sheetjs
    const handleExportExcel = () => {
        if (!exportData || exportData.length === 0) return;

        // Clean columns for better looking spreadsheet
        const cleanData = exportData.map((item) => {
            const copy = { ...item };
            delete copy.id;
            delete copy.categoryColor;
            delete copy.categoryIcon;
            delete copy.category_color;
            delete copy.category_icon;
            return copy;
        });

        const ws = XLSX.utils.json_to_sheet(cleanData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        
        // Save workbook
        XLSX.writeFile(wb, `Moniq_${selectedReportType}_report.xlsx`);
    };

    return (
        <header className={styles.headerContainer} data-anim="header">
            <div className={styles.titleSection}>
                <h1 className={styles.title}>Reports</h1>
                <p className={styles.subtitle}>Generate structured financial summaries and exports</p>
            </div>

            <div className={styles.controlsRow}>
                {/* 1. Report Type Custom Selector Dropdown */}
                <div className={styles.dropdownSelectorWrap} ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                        className={styles.dropdownBtn}
                        aria-expanded={isReportDropdownOpen}
                        aria-label="Select report type"
                    >
                        <span className={styles.dropdownLabel}>{currentReport.label}</span>
                        <FiChevronDown className={`${styles.chevron} ${isReportDropdownOpen ? styles.chevronOpen : ""}`} />
                    </button>

                    {isReportDropdownOpen && (
                        <div className={styles.dropdownPopover}>
                            {reportOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedReportType(opt.value);
                                        setIsReportDropdownOpen(false);
                                    }}
                                    className={`${styles.popoverItem} ${selectedReportType === opt.value ? styles.activePopoverItem : ""}`}
                                >
                                    <div className={styles.itemMeta}>
                                        <span className={styles.itemLabel}>{opt.label}</span>
                                        <span className={styles.itemDesc}>{opt.desc}</span>
                                    </div>
                                    {selectedReportType === opt.value && <FaCheck size={10} className={styles.checkIcon} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Period Selector Pills */}
                <div className={styles.segmentedControl} role="tablist" aria-label="Select report timeframe">
                    {periodOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            role="tab"
                            aria-selected={selectedPeriod === opt.value}
                            className={`${styles.pillBtn} ${selectedPeriod === opt.value ? styles.activePill : ""}`}
                            onClick={() => setSelectedPeriod(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* 3. Export XLSX Action */}
                <MainButton
                    action="glass"
                    size="sm"
                    className={styles.exportBtn}
                    clickEvent={handleExportExcel}
                    title="Export Report to Excel"
                    isDisabled={!exportData || exportData.length === 0}
                >
                    <FaFileExcel className={styles.excelIcon} />
                    <span>Export Excel</span>
                </MainButton>
            </div>

            {/* Custom Account Selector (Only shown for Account Statement Report) */}
            {selectedReportType === "account-statement" && accountsList.length > 0 && (
                <div className={styles.accountSelectorBox} data-anim="custom-date-picker">
                    <label className={styles.accountSelectLabel} htmlFor="statement-account-select">Select Account for Ledger:</label>
                    <div className={styles.selectWrapper}>
                        <FaUniversity className={styles.bankSelectIcon} />
                        <Select
                            id="statement-account-select"
                            options={accountsList.map((acc) => ({
                                value: acc.id,
                                label: `${acc.name} (${currency} ${acc.balance?.toLocaleString()})`,
                            }))}
                            value={accountsList
                                .map((acc) => ({
                                    value: acc.id,
                                    label: `${acc.name} (${currency} ${acc.balance?.toLocaleString()})`,
                                }))
                                .find((opt) => opt.value === selectedAccountId) || null}
                            onChange={(opt) => setSelectedAccountId(opt ? opt.value : "")}
                            styles={customSelectStyles}
                            placeholder="-- Choose Account --"
                            isSearchable={false}
                            className={styles.reactSelectContainer}
                        />
                    </div>
                </div>
            )}

            {/* Custom Date Picker slide-down */}
            {selectedPeriod === "custom" && (
                <div className={styles.customDateSlider} data-anim="custom-date-picker">
                    <div className={styles.pickerField}>
                        <label className={styles.dateLabel} htmlFor="custom-from-date">From</label>
                        <div className={styles.datePickerInputWrap}>
                            <FiCalendar className={styles.calendarIcon} />
                            <DatePicker
                                id="custom-from-date"
                                selected={customRange.from}
                                onChange={(date) => setCustomRange({ ...customRange, from: date })}
                                selectStart
                                startDate={customRange.from}
                                endDate={customRange.to}
                                dateFormat="yyyy-MM-dd"
                                className={styles.dateInput}
                                placeholderText="Select start date"
                            />
                        </div>
                    </div>

                    <div className={styles.pickerField}>
                        <label className={styles.dateLabel} htmlFor="custom-to-date">To</label>
                        <div className={styles.datePickerInputWrap}>
                            <FiCalendar className={styles.calendarIcon} />
                            <DatePicker
                                id="custom-to-date"
                                selected={customRange.to}
                                onChange={(date) => setCustomRange({ ...customRange, to: date })}
                                selectEnd
                                startDate={customRange.from}
                                endDate={customRange.to}
                                minDate={customRange.from}
                                dateFormat="yyyy-MM-dd"
                                className={styles.dateInput}
                                placeholderText="Select end date"
                            />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
