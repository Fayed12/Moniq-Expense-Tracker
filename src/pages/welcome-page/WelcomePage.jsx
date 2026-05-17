// local
import styles from "./WelcomePage.module.css";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// icons
import { FaWallet, FaChartPie, FaPiggyBank } from "react-icons/fa";

export default function WelcomePage() {
    const containerRef = useRef(null);
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);
    const cardRef = useRef(null);
    const progressRef = useRef(null);

    // Mouse parallax effect for blobs
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xOffset = (clientX / window.innerWidth - 0.5) * 60;
            const yOffset = (clientY / window.innerHeight - 0.5) * 60;

            gsap.to(blob1Ref.current, {
                x: xOffset,
                y: yOffset,
                duration: 1.5,
                ease: "power2.out"
            });

            gsap.to(blob2Ref.current, {
                x: -xOffset * 1.5,
                y: -yOffset * 1.5,
                duration: 1.5,
                ease: "power2.out"
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Entry and Exit animations + Progress Bar
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Card scales up and fades in
            gsap.from(cardRef.current, {
                scale: 0.85,
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: "back.out(1.2)"
            });

            // Stagger children inside the card
            gsap.from(cardRef.current.children, {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2
            });

            // Animate progress bar over 4.5 seconds
            gsap.to(progressRef.current, {
                width: "100%",
                duration: 4.5,
                ease: "linear"
            });

            // Trigger exit animation just before 5 seconds (when App unmounts it)
            gsap.to(containerRef.current, {
                opacity: 0,
                scale: 1.05,
                duration: 0.5,
                ease: "power2.inOut",
                delay: 4.5
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Animated Background Blobs */}
            <div className={styles.blob1} ref={blob1Ref}></div>
            <div className={styles.blob2} ref={blob2Ref}></div>

            {/* Content Card */}
            <div className={styles.contentCard} ref={cardRef}>
                <div className={styles.logoBox}>
                    <FaWallet />
                </div>
                
                <h1 className={styles.title}>Welcome to Moniq</h1>
                <p className={styles.subtitle}>
                    Your personal finance and expense tracking companion. Clear, beautiful, and effortless.
                </p>

                <div className={styles.features}>
                    <div className={styles.featurePill}>
                        <FaWallet className={styles.featureIcon} /> Track Expenses
                    </div>
                    <div className={styles.featurePill}>
                        <FaChartPie className={styles.featureIcon} /> Visual Analytics
                    </div>
                    <div className={styles.featurePill}>
                        <FaPiggyBank className={styles.featureIcon} /> Save Money
                    </div>
                </div>

                {/* Progress bar instead of a button for the splash screen */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar} ref={progressRef}></div>
                </div>
            </div>
        </div>
    );
}
