// local
import styles from "./BudgetHealthChart.module.css";

// react
import { useRef, useEffect } from "react";

// recharts
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// gsap
import gsap from "gsap";

// prop-types
import PropTypes from "prop-types";

// ── Budget Health Doughnut Component ────────────────────────
export default function BudgetHealthChart({
    usedPercent = 0,
    remaining = 0,
    currency = "EGP",
}) {
    const containerRef = useRef(null);
    const percentRef = useRef(null);

    // Doughnut data
    const data = [
        { name: "Used", value: Math.min(usedPercent, 100) },
        { name: "Remaining", value: Math.max(100 - usedPercent, 0) },
    ];

    const COLORS = ["var(--chart-1)", "var(--color-border-subtle)"];

    // GSAP entrance animation
    useEffect(() => {
        if (!containerRef.current) return;
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.from(containerRef.current, {
                opacity: 0,
                x: 40,
                duration: 0.7,
                ease: "power3.out",
                delay: 0.5,
            });

            // Animate the percentage counter
            if (percentRef.current) {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: usedPercent,
                    duration: 1.5,
                    delay: 0.8,
                    ease: "power2.out",
                    onUpdate: () => {
                        if (percentRef.current) {
                            percentRef.current.textContent = `${Math.round(obj.val)}`;
                        }
                    },
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [usedPercent]);

    const formatCurrency = (val) => {
        return `${currency} ${val.toLocaleString()}`;
    };

    return (
        <section
            className={styles.container}
            ref={containerRef}
            aria-label={`Budget Health - ${usedPercent}% of budget used, ${formatCurrency(remaining)} remaining`}
            role="img"
        >
            {/* Title */}
            <h2 className={styles.title} id="budget-health-title">
                Budget Health
            </h2>

            {/* Doughnut */}
            <div
                className={styles.chartWrapper}
                aria-describedby="budget-health-title"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="65%"
                            outerRadius="85%"
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={COLORS[idx]}
                                    style={{
                                        filter:
                                            idx === 0
                                                ? "drop-shadow(0 2px 4px rgba(160,82,45,0.3))"
                                                : "none",
                                    }}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center overlay */}
                <div className={styles.centerLabel} aria-hidden="true">
                    <span className={styles.percentValue}>
                        <span ref={percentRef}>{usedPercent}</span>
                        <span className={styles.percentUnit}>%</span>
                    </span>
                    <span className={styles.usedLabel}>Used</span>
                </div>
            </div>

            {/* Remaining */}
            <div className={styles.remaining}>
                <span className={styles.remainingLabel}>Remaining</span>
                <span className={styles.remainingValue}>
                    {formatCurrency(remaining)}
                </span>
            </div>
        </section>
    );
}

BudgetHealthChart.propTypes = {
    usedPercent: PropTypes.number,
    remaining: PropTypes.number,
    currency: PropTypes.string,
};