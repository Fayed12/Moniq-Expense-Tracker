// local
import styles from "./OnboardingFinish.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// react router
import { useNavigate } from "react-router";

// react icons
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";

// Confetti color palette from theme
const CONFETTI_COLORS = [
    "#a0522d", "#c08050", "#d4a87a", "#e8ccac",
    "#3d8c5a", "#2471a3", "#7b68ee", "#c0392b",
];

function OnboardingFinish() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Card entrance
            gsap.fromTo(
                `.${styles.card}`,
                { autoAlpha: 0, scale: 0.9, y: 30 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 1.2, ease: "back.out(1.4)" }
            );

            // Celebration icon bounce
            gsap.fromTo(
                `.${styles.celebrationIcon}`,
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 1, delay: 0.3, ease: "elastic.out(1.2, 0.5)" }
            );

            // Text stagger
            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, y: 15 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.6, ease: "power3.out" }
            );

            // Confetti particles burst
            const card = document.querySelector(`.${styles.card}`);
            if (card) {
                for (let i = 0; i < 24; i++) {
                    const particle = document.createElement("div");
                    particle.className = styles.particle;
                    particle.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
                    particle.style.left = "50%";
                    particle.style.top = "30%";
                    particle.style.width = `${Math.random() * 6 + 4}px`;
                    particle.style.height = particle.style.width;
                    particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
                    card.appendChild(particle);

                    gsap.to(particle, {
                        x: (Math.random() - 0.5) * 300,
                        y: (Math.random() - 0.5) * 250 + 50,
                        opacity: 1,
                        duration: 0.4,
                        delay: 0.5 + Math.random() * 0.3,
                        ease: "power2.out",
                    });
                    gsap.to(particle, {
                        opacity: 0,
                        y: "+=60",
                        duration: 1,
                        delay: 1.2 + Math.random() * 0.5,
                        ease: "power1.in",
                    });
                }
            }
        }, containerRef);

        // Auto-redirect after 4 seconds
        const timer = setTimeout(() => {
            navigate("/dashboard", { replace: true });
        }, 4000);

        return () => {
            ctx.revert();
            clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <div ref={containerRef}>
            <div className={styles.card}>
                <div className={styles.celebrationIcon}>
                    <FiCheckCircle size={40} />
                </div>

                <h1 className={`formItem ${styles.title}`}>You're All Set!</h1>

                <p className={`formItem ${styles.subtitle}`}>
                    Your account is configured and ready to go. Start tracking your 
                    expenses and achieving your financial goals with Moniq.
                </p>

                <div className={`formItem ${styles.btnWrapper}`}>
                    <MainButton
                        type="button"
                        title="Go to Dashboard"
                        action="primary"
                        size="lg"
                        clickEvent={() => navigate("/dashboard", { replace: true })}
                    >
                        Go to Dashboard <FiArrowRight size={18} style={{ marginLeft: "8px" }} />
                    </MainButton>
                </div>

                <p className={`formItem ${styles.redirectNote}`}>
                    Redirecting automatically in a few seconds...
                </p>
            </div>
        </div>
    );
}

export default OnboardingFinish;
