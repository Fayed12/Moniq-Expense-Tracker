import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./OfflinePage.module.css";
import { FaWifi } from "react-icons/fa";
import MainButton from "../../components/ui/button/MainButton";

export default function OfflinePage() {
    const containerRef = useRef(null);
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);
    const contentRef = useRef(null);
    const iconRef = useRef(null);

    // Subtle background breathing animation to keep the interface alive
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(blob1Ref.current, {
                scale: 1.1,
                opacity: 0.15,
                duration: 4,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            gsap.to(blob2Ref.current, {
                scale: 1.2,
                opacity: 0.12,
                duration: 5,
                delay: 1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            // Card entry
            gsap.from(contentRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: "power2.out"
            });

            // Staggered content
            gsap.from(contentRef.current.children, {
                opacity: 0,
                y: 15,
                duration: 0.5,
                stagger: 0.1,
                delay: 0.2,
                ease: "power2.out"
            });

            // Icon pulsing effect
            gsap.to(iconRef.current, {
                opacity: 0.6,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.blob1} ref={blob1Ref}></div>
            <div className={styles.blob2} ref={blob2Ref}></div>

            <div className={styles.content} ref={contentRef}>
                <div className={styles.iconBox} ref={iconRef}>
                    <FaWifi />
                </div>
                <h1 className={styles.title}>You are offline</h1>
                <p className={styles.message}>
                    It seems you've lost your internet connection. Please check your network and try again.
                </p>

                <MainButton action="primary" size="lg" clickEvent={handleRetry}>
                    Retry Connection
                </MainButton>
            </div>
        </div>
    );
}
