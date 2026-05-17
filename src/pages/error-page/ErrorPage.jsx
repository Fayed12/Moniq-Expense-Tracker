// local
import styles from "./ErrorPage.module.css";
import MainButton from "../../components/ui/button/MainButton";

// react
import { useEffect, useRef } from "react";
import { useRouteError, useNavigate } from "react-router";

// gsap
import gsap from "gsap";

// icons
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    
    const containerRef = useRef(null);
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);
    const contentRef = useRef(null);

    // Mouse parallax effect for blobs
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xOffset = (clientX / window.innerWidth - 0.5) * 40;
            const yOffset = (clientY / window.innerHeight - 0.5) * 40;

            gsap.to(blob1Ref.current, { x: xOffset, y: yOffset, duration: 1.2, ease: "power2.out" });
            gsap.to(blob2Ref.current, { x: -xOffset * 1.2, y: -yOffset * 1.2, duration: 1.2, ease: "power2.out" });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Entry animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: "back.out(1.5)"
            });

            gsap.from(contentRef.current.children, {
                y: 15,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2
            });
            
            // Subtle floating effect on the icon
            gsap.to(`.${styles.iconWrap}`, {
                y: -10,
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
            {/* Animated Background Blobs */}
            <div className={styles.blob1} ref={blob1Ref}></div>
            <div className={styles.blob2} ref={blob2Ref}></div>

            <div className={styles.content} ref={contentRef}>
                <div className={styles.iconWrap}>
                    <FaExclamationTriangle />
                </div>
                <h1 className={styles.errorCode}>{errorCode}</h1>
                <h2 className={styles.title}>Oops! Something went wrong</h2>
                <p className={styles.message}>{errorMessage}</p>
                
                <MainButton action="primary" size="lg" clickEvent={goHome}>
                    <FaHome /> Return Home
                </MainButton>
            </div>
        </div>
    );
}
