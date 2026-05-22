// local
import styles from "./OnboardingExpense.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// react router
import { useNavigate } from "react-router";

// react icons
import { FiArrowLeft, FiArrowRight, FiZap, FiGrid, FiCamera } from "react-icons/fi";

const PREVIEW_TRANSACTIONS = [
    { icon: "🍕", label: "Food", amount: "-120 EGP", type: "expense" },
    { icon: "💰", label: "Salary", amount: "+5,000 EGP", type: "income" },
    { icon: "🚗", label: "Uber", amount: "-70 EGP", type: "expense" },
];

const FEATURES = [
    { icon: <FiZap />, title: "Instant Logging" },
    { icon: <FiGrid />, title: "Smart Categories" },
    { icon: <FiCamera />, title: "Receipt Scan" },
    { icon: <FiArrowRight />, title: "Quick Actions" },
];

function OnboardingExpense() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                `.${styles.card}`,
                { autoAlpha: 0, scale: 0.95, y: 25 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.15)" }
            );

            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, y: 18 },
                { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.2, ease: "power3.out" }
            );

            // Float animation on preview cards
            gsap.to(`.${styles.previewItem}`, {
                y: -4,
                duration: 2,
                stagger: 0.3,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: 1,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef}>
            <div className={styles.card}>
                <h2 className={`formItem ${styles.title}`}>Track Every Expense</h2>
                <p className={`formItem ${styles.subtitle}`}>
                    Log your daily transactions effortlessly. See where your money goes with beautifully organized categories.
                </p>

                {/* Mini Transaction Preview */}
                <div className={`formItem ${styles.previewList}`}>
                    {PREVIEW_TRANSACTIONS.map((tx) => (
                        <div className={styles.previewItem} key={tx.label}>
                            <div className={styles.previewLeft}>
                                <div className={`${styles.previewIcon} ${
                                    tx.type === "expense" ? styles.previewIconExpense : styles.previewIconIncome
                                }`}>
                                    {tx.icon}
                                </div>
                                <span className={styles.previewLabel}>{tx.label}</span>
                            </div>
                            <span className={`${styles.previewAmount} ${
                                tx.type === "expense" ? styles.amountExpense : styles.amountIncome
                            }`}>
                                {tx.amount}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Feature Highlight Cards */}
                <div className={`formItem ${styles.featureCards}`}>
                    {FEATURES.map((f) => (
                        <div className={styles.featureCard} key={f.title}>
                            <div className={styles.featureCardIcon}>{f.icon}</div>
                            <span className={styles.featureCardTitle}>{f.title}</span>
                        </div>
                    ))}
                </div>

                {/* Navigation */}
                <div className={`formItem ${styles.navActions}`}>
                    <MainButton
                        type="button"
                        title="Previous"
                        action="outline"
                        clickEvent={() => navigate("/onboarding/welcome", { replace: true })}
                    >
                        <FiArrowLeft size={16} style={{ marginRight: "6px" }} /> Previous
                    </MainButton>
                    <MainButton
                        type="button"
                        title="Next"
                        action="primary"
                        clickEvent={() => navigate("/onboarding/analytics", { replace: true })}
                    >
                        Next <FiArrowRight size={16} style={{ marginLeft: "6px" }} />
                    </MainButton>
                </div>
            </div>
        </div>
    );
}

export default OnboardingExpense;
