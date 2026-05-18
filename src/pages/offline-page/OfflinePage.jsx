import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./OfflinePage.module.css";
import { FaWifi } from "react-icons/fa";
import MainButton from "../../components/ui/button/MainButton";

export default function OfflinePage() {
    const containerRef = useRef(null);
    const ring1Ref = useRef(null);
    const ring2Ref = useRef(null);
    const ring3Ref = useRef(null);
    const contentRef = useRef(null);
    const iconRef = useRef(null);

    // Radar rings animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const rings = [ring1Ref.current, ring2Ref.current, ring3Ref.current];
            
            // Pulse rings outward continuously
            rings.forEach((ring, index) => {
                gsap.fromTo(ring, 
                    { scale: 0.5, opacity: 0.8 },
                    {
                        scale: 1.5,
                        opacity: 0,
                        duration: 3,
                        repeat: -1,
                        ease: "power1.out",
                        delay: index * 1 // staggered start
                    }
                );
            });

            // Card entry
            gsap.from(contentRef.current, {
                opacity: 0,
                y: 40,
                scale: 0.95,
                duration: 0.8,
                ease: "back.out(1.2)"
            });

            // Staggered content inside the card
            // Button is wrapped in .btnWrapper so GSAP avoids breaking its CSS opacity transition
            gsap.from(contentRef.current.children, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.1,
                delay: 0.3,
                ease: "power2.out"
            });

            // Icon dimming effect
            gsap.to(iconRef.current, {
                opacity: 0.5,
                duration: 2,
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
            {/* Pulsing Radar Rings */}
            <div className={styles.ringContainer}>
                <div className={`${styles.ring} ${styles.ring1}`} ref={ring1Ref}></div>
                <div className={`${styles.ring} ${styles.ring2}`} ref={ring2Ref}></div>
                <div className={`${styles.ring} ${styles.ring3}`} ref={ring3Ref}></div>
            </div>

            <div className={styles.content} ref={contentRef}>
                <div className={styles.iconCircle} ref={iconRef}>
                    <FaWifi />
                </div>
                
                <h1 className={styles.title}>You are offline</h1>
                <p className={styles.message}>
                    It seems you've lost your internet connection. Please check your network and try again.
                </p>

                {/* Wrapped button to prevent GSAP fighting with CSS transitions */}
                <div className={styles.btnWrapper}>
                    <MainButton action="primary" size="lg" clickEvent={handleRetry}>
                        Retry Connection
                    </MainButton>
                </div>
            </div>
        </div>
    );
}
