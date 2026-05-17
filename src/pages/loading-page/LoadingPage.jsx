// local
import LoadingSpinner from "../../components/ui/loading-Spinner/loadingSpinner";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// styles
import styles from "./LoadingPage.module.css";

function LoadingPage() {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);

    // Subtle pulsing blobs
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(blob1Ref.current, {
                scale: 1.2,
                opacity: 0.15,
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            gsap.to(blob2Ref.current, {
                scale: 1.3,
                opacity: 0.12,
                duration: 4,
                delay: 1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            // Entry fade in
            gsap.from(contentRef.current, {
                opacity: 0,
                y: 10,
                duration: 0.5,
                ease: "power2.out"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.blob1} ref={blob1Ref}></div>
            <div className={styles.blob2} ref={blob2Ref}></div>

            <div className={styles.content} ref={contentRef}>
                <LoadingSpinner size="xl" color="primary" />
                <h1 className={styles.logoText}>Moniq</h1>
            </div>
        </div>
    );
}

export default LoadingPage;
