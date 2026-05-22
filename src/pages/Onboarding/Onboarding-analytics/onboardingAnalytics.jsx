// local
import styles from "./OnboardingAnalytics.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// react router
import { useNavigate } from "react-router";

// react icons
import { FiArrowLeft, FiArrowRight, FiPieChart, FiTrendingUp, FiBarChart2 } from "react-icons/fi";

const FEATURES = [
    {
        icon: <FiPieChart size={22} />,
        title: "Spending Breakdown",
        desc: "Visualize how your expenses split across categories with interactive charts.",
        color: "iconPurple",
    },
    {
        icon: <FiTrendingUp size={22} />,
        title: "Category Trends",
        desc: "Track spending patterns over time and spot areas to improve your budgeting.",
        color: "iconGreen",
    },
    {
        icon: <FiBarChart2 size={22} />,
        title: "Budget Progress",
        desc: "Monitor your budget in real-time with intuitive progress indicators.",
        color: "iconBlue",
    },
];

function OnboardingAnalytics() {
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
                { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: "power3.out" }
            );

            // Scale-bounce icons
            gsap.fromTo(
                `.${styles.featureIconWrap}`,
                { scale: 0 },
                { scale: 1, duration: 0.5, stagger: 0.15, delay: 0.5, ease: "back.out(1.8)" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef}>
            <div className={styles.card}>
                <h2 className={`formItem ${styles.title}`}>Smart Analytics</h2>
                <p className={`formItem ${styles.subtitle}`}>
                    Gain deep insights into your spending habits with powerful, beautiful analytics built right in.
                </p>

                {/* Feature Cards */}
                <div className={`formItem ${styles.featureGrid}`}>
                    {FEATURES.map((f) => (
                        <div className={styles.featureCard} key={f.title}>
                            <div className={`${styles.featureIconWrap} ${styles[f.color]}`}>
                                {f.icon}
                            </div>
                            <div className={styles.featureContent}>
                                <span className={styles.featureTitle}>{f.title}</span>
                                <span className={styles.featureDesc}>{f.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation */}
                <div className={`formItem ${styles.navActions}`}>
                    <MainButton
                        type="button"
                        title="Previous"
                        action="outline"
                        clickEvent={() => navigate("/onboarding/expense", { replace: true })}
                    >
                        <FiArrowLeft size={16} style={{ marginRight: "6px" }} /> Previous
                    </MainButton>
                    <MainButton
                        type="button"
                        title="Next"
                        action="primary"
                        clickEvent={() => navigate("/onboarding/goals", { replace: true })}
                    >
                        Next <FiArrowRight size={16} style={{ marginLeft: "6px" }} />
                    </MainButton>
                </div>
            </div>
        </div>
    );
}

export default OnboardingAnalytics;
