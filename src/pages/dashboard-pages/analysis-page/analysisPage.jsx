// local
import styles from "./analysisPage.module.css";
import { useAnalysisPageData } from "../../../hooks/analysisPageData";
import PageHeader from "../../../components/analysisPageComponents/PageHeader";
import KPISummaryRow from "../../../components/analysisPageComponents/KPISummaryRow";
import CashFlowComparisonChart from "../../../components/analysisPageComponents/CashFlowComparisonChart";
import CategoryDonutAndRankings from "../../../components/analysisPageComponents/CategoryDonutAndRankings";
import DailySpendingHeatmap from "../../../components/analysisPageComponents/DailySpendingHeatmap";
import IncomeAndPatterns from "../../../components/analysisPageComponents/IncomeAndPatterns";
import AccountPerformanceList from "../../../components/analysisPageComponents/AccountPerformanceList";
import TagsAndHighlights from "../../../components/analysisPageComponents/TagsAndHighlights";

// react
import { useState, useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// Skeleton Shimmer Loader
function SkeletonLoader() {
    return (
        <div className={styles.skeletonContainer}>
            <div className={`${styles.shimmer} ${styles.skeletonHeader}`} />
            <div className={styles.skeletonKpiGrid}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${styles.shimmer} ${styles.skeletonKpiCard}`} />
                ))}
            </div>
            <div className={`${styles.shimmer} ${styles.skeletonChart}`} />
            <div className={styles.skeletonDoubleCol}>
                <div className={`${styles.shimmer} ${styles.skeletonColLeft}`} />
                <div className={`${styles.shimmer} ${styles.skeletonColRight}`} />
            </div>
        </div>
    );
}

function AnalysisPage() {
    const [selectedPeriod, setSelectedPeriod] = useState("this-month");
    const [customRange, setCustomRange] = useState({ from: null, to: null });
    const [selectedAccountIds, setSelectedAccountIds] = useState([]);
    
    const containerRef = useRef(null);
    const animRan = useRef(false);

    const {
        isAppLoading,
        currency,
        kpis,
        cashFlowData,
        categoryBreakdown,
        rankedCategories,
        dailyHeatmap,
        incomeSources,
        spendingTimePattern,
        accountPerformance,
        tagAnalysis,
        periodHighlights,
        accountsList,
    } = useAnalysisPageData(selectedPeriod, customRange, selectedAccountIds);

    // ── GSAP Entrance Timeline Animation ──────────────────────
    useEffect(() => {
        if (!containerRef.current || animRan.current || isAppLoading) return;
        animRan.current = true;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out", duration: 0.6 },
            });

            // Slide down Page Header
            tl.from("[data-anim='header']", {
                y: -40,
                opacity: 0,
            });

            // Stagger stat cards slide-up with back easing
            tl.from(
                "[data-anim='overview-card']",
                {
                    y: 40,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "back.out(1.2)",
                },
                "-=0.2"
            );

            // Stagger charts and table rows fading up
            tl.from(
                "[data-anim='charts-row']",
                {
                    y: 35,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.12,
                },
                "-=0.3"
            );

            // Slide in category double blocks and grids
            tl.from(
                "[data-anim='middle-card']",
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "back.out(1.1)",
                },
                "-=0.2"
            );
        }, containerRef);

        return () => ctx.revert();
    }, [isAppLoading]);

    // Handle smooth period switches transition (fade-out then fade-in)
    useEffect(() => {
        if (isAppLoading || !containerRef.current) return;
        
        // Trigger soft refresh animations for charts on period adjustments
        const elements = containerRef.current.querySelectorAll(".recharts-responsive-container");
        if (elements.length > 0) {
            gsap.fromTo(
                elements,
                { opacity: 0.4, scale: 0.98 },
                { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", stagger: 0.05 }
            );
        }
    }, [selectedPeriod, selectedAccountIds, customRange, isAppLoading]);

    if (isAppLoading) {
        return (
            <main className={styles.container} role="main" aria-label="Loading Analysis Page">
                <SkeletonLoader />
            </main>
        );
    }

    return (
        <main
            className={styles.container}
            ref={containerRef}
            role="main"
            aria-label="Moniq spending and balance analysis page"
        >
            {/* Header filters controls */}
            <PageHeader
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                customRange={customRange}
                setCustomRange={setCustomRange}
                selectedAccountIds={selectedAccountIds}
                setSelectedAccountIds={setSelectedAccountIds}
                accountsList={accountsList}
                currency={currency}
            />

            {/* Content Body Grid Wrapper */}
            <div className={styles.contentGrid}>
                {/* 1. KPI Stats Summary Row */}
                <KPISummaryRow kpis={kpis} currency={currency} />

                {/* 2. Main Cash Flow Income vs Expense Chart */}
                <CashFlowComparisonChart data={cashFlowData} currency={currency} />

                {/* 3. Category Breakdown Double Cards */}
                <CategoryDonutAndRankings
                    categoryBreakdown={categoryBreakdown}
                    rankedCategories={rankedCategories}
                    currency={currency}
                />

                {/* 4. Daily Spending Heatmap */}
                <DailySpendingHeatmap dailyHeatmap={dailyHeatmap} currency={currency} />

                {/* 5. Income Sources and time clocks */}
                <IncomeAndPatterns
                    incomeSources={incomeSources}
                    spendingTimePattern={spendingTimePattern}
                    currency={currency}
                />

                {/* 6. Account Performance Ledger Sparklines */}
                <AccountPerformanceList accountPerformance={accountPerformance} currency={currency} />

                {/* 7. Tags Cloud and Period Highlights */}
                <TagsAndHighlights
                    tagAnalysis={tagAnalysis}
                    periodHighlights={periodHighlights}
                    currency={currency}
                />
            </div>
        </main>
    );
}

export default AnalysisPage;