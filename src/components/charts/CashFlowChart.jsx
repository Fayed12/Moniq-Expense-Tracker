// local
import styles from "./CashFlowChart.module.css";

// react
import { useRef, useEffect } from "react";

// recharts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// gsap
import gsap from "gsap";

// prop-types
import PropTypes from "prop-types";

// ── Custom Tooltip ──────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className={styles.tooltip} role="tooltip">
            <p className={styles.tooltipLabel}>{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className={styles.tooltipRow}>
                    <span
                        className={styles.tooltipDot}
                        style={{ background: entry.color }}
                    />
                    <span>
                        {entry.dataKey === "income" ? "Income" : "Expense"}:{" "}
                        {entry.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
};

// ── Cash Flow Chart Component ───────────────────────────────
export default function CashFlowChart({ data = [], currency = "EGP" }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.from(containerRef.current, {
                opacity: 0,
                x: -40,
                duration: 0.7,
                ease: "power3.out",
                delay: 0.4,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Format Y axis values
    const formatYAxis = (value) => {
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value;
    };

    return (
        <section
            className={styles.container}
            ref={containerRef}
            aria-label="Cash Flow Chart - Weekly income and expenses comparison"
            role="img"
        >
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title} id="cashflow-chart-title">
                    Cash Flow
                </h2>
                <div
                    className={styles.legend}
                    role="list"
                    aria-label="Chart legend"
                >
                    <div className={styles.legendItem} role="listitem">
                        <span
                            className={styles.legendDot}
                            style={{ background: "var(--color-income)" }}
                        />
                        Income
                    </div>
                    <div className={styles.legendItem} role="listitem">
                        <span
                            className={styles.legendDot}
                            style={{ background: "var(--chart-1)" }}
                        />
                        Expenses
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div
                className={styles.chartWrapper}
                aria-describedby="cashflow-chart-title"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                        barCategoryGap="20%"
                        barGap={4}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border-subtle)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="week"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "var(--color-text-muted)",
                                fontSize: 12,
                                fontFamily: "var(--font-sans)",
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatYAxis}
                            tick={{
                                fill: "var(--color-text-muted)",
                                fontSize: 11,
                                fontFamily: "var(--font-sans)",
                            }}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip currency={currency} />
                            }
                            cursor={{
                                fill: "var(--color-border-subtle)",
                                radius: 6,
                            }}
                        />
                        <Bar
                            dataKey="income"
                            fill="var(--color-income)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={32}
                        />
                        <Bar
                            dataKey="expense"
                            fill="var(--chart-1)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

CashFlowChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            week: PropTypes.string,
            income: PropTypes.number,
            expense: PropTypes.number,
        }),
    ),
    currency: PropTypes.string,
};