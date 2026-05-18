import styles from "./ErrorPage.module.css";
import MainButton from "../../components/ui/button/MainButton";
import { useEffect, useRef } from "react";
import { useRouteError, useNavigate } from "react-router";
import gsap from "gsap";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    
    const containerRef = useRef(null);
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);
    const bgTextRef = useRef(null);
    const contentRef = useRef(null);
    const iconRef = useRef(null);

    // Mouse parallax effect for blobs and background text
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xOffset = (clientX / window.innerWidth - 0.5);
            const yOffset = (clientY / window.innerHeight - 0.5);

            gsap.to(blob1Ref.current, { x: xOffset * 60, y: yOffset * 60, duration: 1.2, ease: "power2.out" });
            gsap.to(blob2Ref.current, { x: -xOffset * 80, y: -yOffset * 80, duration: 1.2, ease: "power2.out" });
            gsap.to(bgTextRef.current, { x: -xOffset * 40, y: -yOffset * 40, duration: 1.5, ease: "power2.out" });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Entry animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background text fades in slowly
            gsap.from(bgTextRef.current, {
                opacity: 0,
                scale: 0.9,
                duration: 1.5,
                ease: "power2.out"
            });

            // Card pops up
            gsap.from(contentRef.current, {
                scale: 0.95,
                opacity: 0,
                y: 40,
                duration: 0.7,
                ease: "back.out(1.2)"
            });

            // Stagger card contents
            // Note: button is wrapped in .btnWrapper so GSAP animates the wrapper, avoiding CSS transition bugs
            gsap.from(contentRef.current.children, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3
            });
            
            // Continuous floating effect on the icon
            gsap.to(iconRef.current, {
                y: -12,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const goHome = () => navigate("/");

    const errorMessage = error?.statusText || error?.message || "We couldn't find the page you're looking for.";
    const errorCode = error?.status || "404";

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Animated Background Layers */}
            <div className={styles.bgText} ref={bgTextRef}>{errorCode}</div>
            <div className={styles.blob1} ref={blob1Ref}></div>
            <div className={styles.blob2} ref={blob2Ref}></div>

            <div className={styles.content} ref={contentRef}>
                <div className={styles.iconWrap} ref={iconRef}>
                    <FaExclamationTriangle />
                </div>
                
                <h2 className={styles.title}>Oops! Something went wrong</h2>
                <p className={styles.message}>{errorMessage}</p>
                
                {/* Wrapped button to prevent GSAP fighting with CSS transitions */}
                <div className={styles.btnWrapper}>
                    <MainButton action="primary" size="lg" clickEvent={goHome}>
                        <FaHome /> Return Home
                    </MainButton>
                </div>
            </div>
        </div>
    );
}
