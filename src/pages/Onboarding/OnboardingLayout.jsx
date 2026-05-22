// local
import styles from "./OnboardingLayout.module.css";

// react
import { useMemo } from "react";

// react router
import { Outlet, useLocation } from "react-router";

const STEPS = [
    { path: "welcome", label: "Welcome" },
    { path: "expense", label: "Expense" },
    { path: "analytics", label: "Analytics" },
    { path: "goals", label: "Goals" },
    { path: "quick-setup", label: "Setup" },
    { path: "finish", label: "Finish" },
];

function OnboardingLayout() {
    const location = useLocation();

    const currentIndex = useMemo(() => {
        const segment = location.pathname.split("/").pop();
        const idx = STEPS.findIndex((s) => s.path === segment);
        return idx === -1 ? 0 : idx;
    }, [location.pathname]);

    return (
        <div className={styles.layoutContainer}>
            <div className={styles.bgOverlay}></div>

            <div className={styles.contentArea}>
                {/* Step Progress Dots */}
                <div className={styles.stepDots}>
                    {STEPS.map((step, i) => (
                        <div key={step.path} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                            <div
                                className={`${styles.dot} ${
                                    i === currentIndex
                                        ? styles.dotActive
                                        : i < currentIndex
                                        ? styles.dotCompleted
                                        : ""
                                }`}
                                title={step.label}
                            />
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`${styles.dotConnector} ${
                                        i < currentIndex ? styles.dotConnectorCompleted : ""
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Active Step Page */}
                <div className={styles.pageWrapper}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default OnboardingLayout;
