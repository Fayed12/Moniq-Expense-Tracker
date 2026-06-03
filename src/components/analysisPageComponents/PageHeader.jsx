// local
import styles from "./PageHeader.module.css";

// react
import { useState, useRef, useEffect } from "react";

// react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// react icons
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import { FaUniversity, FaCheck } from "react-icons/fa";

export default function PageHeader({
    selectedPeriod,
    setSelectedPeriod,
    customRange,
    setCustomRange,
    selectedAccountIds,
    setSelectedAccountIds,
    accountsList,
    currency,
}) {
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAccountDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAccountToggle = (accountId) => {
        if (selectedAccountIds.includes(accountId)) {
            setSelectedAccountIds(selectedAccountIds.filter((id) => id !== accountId));
        } else {
            setSelectedAccountIds([...selectedAccountIds, accountId]);
        }
    };

    const handleSelectAllAccounts = () => {
        if (selectedAccountIds.length === accountsList.length) {
            setSelectedAccountIds([]);
        } else {
            setSelectedAccountIds(accountsList.map((a) => a.id));
        }
    };

    const periodOptions = [
        { value: "this-week", label: "This Week" },
        { value: "this-month", label: "This Month" },
        { value: "last-month", label: "Last Month" },
        { value: "last-3-months", label: "Last 3M" },
        { value: "last-6-months", label: "Last 6M" },
        { value: "this-year", label: "This Year" },
        { value: "custom", label: "Custom" },
    ];

    const activeAccountNames = selectedAccountIds.length === 0
        ? "All Accounts"
        : selectedAccountIds.length === accountsList.length
        ? "All Accounts"
        : `${selectedAccountIds.length} Selected`;

    return (
        <header className={styles.headerContainer} data-anim="header">
            <div className={styles.titleSection}>
                <h1 className={styles.title}>Analysis</h1>
                <p className={styles.subtitle}>Track your financial patterns and behavior</p>
            </div>

            <div className={styles.controlsRow}>
                {/* Period Selector Pills */}
                <div className={styles.segmentedControl} role="tablist" aria-label="Select period">
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

                {/* Account Filter Popover */}
                <div className={styles.accountFilterWrapper} ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className={styles.dropdownBtn}
                        aria-expanded={isAccountDropdownOpen}
                        aria-label="Filter transactions by account"
                    >
                        <FaUniversity className={styles.bankIcon} />
                        <span className={styles.btnLabel}>{activeAccountNames}</span>
                        <FiChevronDown className={`${styles.chevron} ${isAccountDropdownOpen ? styles.chevronOpen : ""}`} />
                    </button>

                    {isAccountDropdownOpen && (
                        <div className={styles.dropdownPopover}>
                            <div className={styles.popoverHeader}>
                                <span>Filter by Accounts</span>
                                <button
                                    type="button"
                                    onClick={handleSelectAllAccounts}
                                    className={styles.selectAllBtn}
                                >
                                    {selectedAccountIds.length === accountsList.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                            <div className={styles.accountsChecklist}>
                                {accountsList.map((acc) => {
                                    return (
                                        <label key={acc.id} className={styles.checkboxItem} htmlFor={`account-chk-${acc.id}`}>
                                            <input
                                                id={`account-chk-${acc.id}`}
                                                type="checkbox"
                                                checked={selectedAccountIds.includes(acc.id)}
                                                onChange={() => handleAccountToggle(acc.id)}
                                                className={styles.hiddenCheckbox}
                                            />
                                            <div className={`${styles.customCheckbox} ${selectedAccountIds.includes(acc.id) ? styles.checked : ""}`}>
                                                {selectedAccountIds.includes(acc.id) && <FaCheck size={8} />}
                                            </div>
                                            <span className={styles.colorDot} style={{ backgroundColor: acc.color || "var(--color-primary)" }} />
                                            <span className={styles.accountName}>{acc.name}</span>
                                            <span className={styles.accountBalance}>
                                                {currency} {acc.balance?.toLocaleString()}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Date Range Picker Dropdown (Slides down smoothly) */}
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
