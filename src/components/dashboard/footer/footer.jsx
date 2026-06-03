// local
import styles from "./footer.module.css";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

function Footer() {
    const footerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(footerRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: 0.5
            });
        }, footerRef);
        return () => ctx.revert();
    }, []);

    return (
        <footer className={styles.footer} ref={footerRef}>
            <p>
                Copyright © {new Date().getFullYear()} Moniq, All rights reserved. by <a href="https://mohamed-fayed-porfile.vercel.app/" target="_blank" className={styles.highlight}>Mohamed Fayed</a>
            </p>
        </footer>
    );
}

export default Footer;