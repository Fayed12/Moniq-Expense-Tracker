// local
import styles from "./OnboardingGoals.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// react router
import { useNavigate } from "react-router";

// react icons
import { FiArrowLeft, FiArrowRight, FiShield, FiSun, FiTarget } from "react-icons/fi";

const GOALS = [
    {
        icon: <FiShield size={22} />,
        title: "Emergency Fund",
        desc: "Build a financial safety net for unexpected life events.",
        progress: 65,
        color: "iconWarning",
        barColor: "progressFillWarning",
    },
    {
        icon: <FiSun size={22} />,
        title: "Vacation Savings",
        desc: "Save towards your dream holiday destination with milestone tracking.",
        progress: 40,
        color: "iconSuccess",
        barColor: "progressFillSuccess",
    },
    {
        icon: <FiTarget size={22} />,
        title: "Monthly Savings",
        desc: "Set monthly savings targets and track your consistency streak.",
        progress: 80,
        color: "iconPrimary",
        barColor: "",
    },
];

function OnboardingGoals() {
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

            // Slide-in from alternating sides
            gsap.fromTo(
                `.${styles.goalCard}`,
                (i) => ({ autoAlpha: 0, x: i % 2 === 0 ? -30 : 30 }),
                { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.15, delay: 0.4, ease: "power2.out" }
            );

            // Animate progress bars filling
            const bars = document.querySelectorAll(`.${styles.progressFill}`);
            bars.forEach((bar) => {
                const target = bar.dataset.progress || 0;
                gsap.fromTo(bar, { width: "0%" }, { width: `${target}%`, duration: 1.5, delay: 0.8, ease: "power2.out" });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef}>
            <div className={styles.card}>
                <h2 className={`formItem ${styles.title}`}>Set Your Goals</h2>
                <p className={`formItem ${styles.subtitle}`}>
                    Define financial milestones and watch your progress grow with beautiful visual trackers.
                </p>

                {/* Goal Cards */}
                <div className={`formItem ${styles.goalCards}`}>
                    {GOALS.map((g) => (
                        <div className={styles.goalCard} key={g.title}>
                            <div className={`${styles.goalIconWrap} ${styles[g.color]}`}>
                                {g.icon}
                            </div>
                            <div className={styles.goalContent}>
                                <span className={styles.goalTitle}>{g.title}</span>
                                <span className={styles.goalDesc}>{g.desc}</span>
                                <div className={styles.progressBar}>
                                    <div
                                        className={`${styles.progressFill} ${g.barColor ? styles[g.barColor] : ""}`}
                                        data-progress={g.progress}
                                        style={{ width: 0 }}
                                    />
                                </div>
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
                        clickEvent={() => navigate("/onboarding/analytics", { replace: true })}
                    >
                        <FiArrowLeft size={16} style={{ marginRight: "6px" }} /> Previous
                    </MainButton>
                    <MainButton
                        type="button"
                        title="Next"
                        action="primary"
                        clickEvent={() => navigate("/onboarding/quick-setup", { replace: true })}
                    >
                        Next <FiArrowRight size={16} style={{ marginLeft: "6px" }} />
                    </MainButton>
                </div>
            </div>
        </div>
    );
}

export default OnboardingGoals;
