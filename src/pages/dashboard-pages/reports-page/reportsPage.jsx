// local
import styles from "./reportsPage.module.css";
import PageHeader from "../../../components/reportsPageComponents/PageHeader";
import ReportOverviewBanner from "../../../components/reportsPageComponents/ReportOverviewBanner";
import MonthlySummaryReport from "../../../components/reportsPageComponents/MonthlySummaryReport";
import CategoryReport from "../../../components/reportsPageComponents/CategoryReport";
import AccountStatementReport from "../../../components/reportsPageComponents/AccountStatementReport";
import BudgetPerformanceReport from "../../../components/reportsPageComponents/BudgetPerformanceReport";
import GoalsProgressReport from "../../../components/reportsPageComponents/GoalsProgressReport";
import IncomeExpenseReport from "../../../components/reportsPageComponents/IncomeExpenseReport";
import { useReportsPageData } from "../../../hooks/reportsPageData";

// React hooks
import { useState, useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

export default function ReportsPage() {
    const [selectedReportType, setSelectedReportType] =
        useState("monthly-summary");
    const [selectedPeriod, setSelectedPeriod] = useState("this-month");
    const [customRange, setCustomRange] = useState({ from: null, to: null });
    const [selectedAccountId, setSelectedAccountId] = useState("");

    const pageRef = useRef(null);

    // Load data from custom Redux reports hook
    const {
        isAppLoading,
        currency,
        dateRanges,
        bannerOverview,
        monthlySummary,
        categoryReport,
        accountStatement,
        budgetPerformance,
        goalsProgress,
        incomeExpenseReport,
        rawFilteredTransactions,
        accountsList,
    } = useReportsPageData(
        selectedPeriod,
        customRange,
        selectedAccountId,
    );

    // Synchronously set default account during render phase if empty or invalid
    if (accountsList.length > 0) {
        if (!selectedAccountId) {
            setSelectedAccountId(accountsList[0].id);
        } else if (!accountsList.some((a) => a.id === selectedAccountId)) {
            setSelectedAccountId(accountsList[0].id);
        }
    }

    // GSAP Opening stagger timeline trigger
    useEffect(() => {
        if (!isAppLoading) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    "[data-anim]",
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: "power2.out",
                        overwrite: "auto",
                    },
                );
            }, pageRef);

            return () => ctx.revert();
        }
    }, [selectedReportType, isAppLoading]);

    // Format human-readable period label
    const getPeriodLabel = () => {
        if (selectedPeriod === "custom") {
            const fromStr = customRange.from
                ? customRange.from.toLocaleDateString()
                : "...";
            const toStr = customRange.to
                ? customRange.to.toLocaleDateString()
                : "...";
            return `Custom Window: ${fromStr} to ${toStr}`;
        }

        const { start, end } = dateRanges;
        const options = { month: "long", year: "numeric" };
        if (selectedPeriod === "this-week") {
            return `Timeframe: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
        }
        return `Report Period: ${start.toLocaleDateString(undefined, options)}`;
    };

    // Determine correct export dataset based on chosen report type
    const getExportData = () => {
        switch (selectedReportType) {
            case "monthly-summary":
                return rawFilteredTransactions;
            case "category-report":
                return categoryReport.deepDiveList;
            case "account-statement":
                return accountStatement.ledger;
            case "budget-performance":
                return budgetPerformance.budgetCards;
            case "goals-progress":
                return goalsProgress.list;
            case "income-expense":
                return incomeExpenseReport.dailyTotals;
            default:
                return [];
        }
    };

    // Main Report rendering manager
    const renderActiveReport = () => {
        switch (selectedReportType) {
            case "category-report":
                return (
                    <CategoryReport data={categoryReport} currency={currency} />
                );
            case "account-statement":
                return (
                    <AccountStatementReport
                        data={accountStatement}
                        currency={currency}
                    />
                );
            case "budget-performance":
                return (
                    <BudgetPerformanceReport
                        data={budgetPerformance}
                        currency={currency}
                    />
                );
            case "goals-progress":
                return (
                    <GoalsProgressReport
                        data={goalsProgress}
                        currency={currency}
                    />
                );
            case "income-expense":
                return (
                    <IncomeExpenseReport
                        data={incomeExpenseReport}
                        currency={currency}
                    />
                );
            case "monthly-summary":
            default:
                return (
                    <MonthlySummaryReport
                        data={monthlySummary}
                        currency={currency}
                    />
                );
        }
    };

    const getReportTitle = () => {
        switch (selectedReportType) {
            case "category-report":
                return "Category Analysis Report";
            case "account-statement":
                return "Account Ledger Statement";
            case "budget-performance":
                return "Budget Limits Performance";
            case "goals-progress":
                return "Savings Goals Progression";
            case "income-expense":
                return "Cash Flow Income & Expense";
            case "monthly-summary":
            default:
                return "Monthly Financial Summary";
        }
    };

    // Premium Skeleton loaders
    if (isAppLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeletonHeader} />
                <div className={styles.skeletonBanner} />
                <div className={styles.skeletonGrid}>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </div>
                <div className={styles.skeletonChartCard} />
            </div>
        );
    }

    return (
        <div className={styles.container} ref={pageRef}>
            <PageHeader
                selectedReportType={selectedReportType}
                setSelectedReportType={setSelectedReportType}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                customRange={customRange}
                setCustomRange={setCustomRange}
                selectedAccountId={selectedAccountId}
                setSelectedAccountId={setSelectedAccountId}
                accountsList={accountsList}
                currency={currency}
                exportData={getExportData()}
            />

            <div className={styles.bannerSpacer} data-anim="banner">
                <ReportOverviewBanner
                    reportTitle={getReportTitle()}
                    periodLabel={getPeriodLabel()}
                    overviewData={bannerOverview}
                />
            </div>

            <main className={styles.reportContent} data-anim="report-content">
                {renderActiveReport()}
            </main>
        </div>
    );
}
