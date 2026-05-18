// local
import styles from "./landingFooter.module.css";

export default function LandingFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                {/* Brand Column */}
                <div className={styles.brandCol}>
                    <a href="#" className={styles.logo} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <img src="/logo.png" alt="Moniq Logo" />
                    </a>
                    <p className={styles.tagline}>
                        "Your money, clearly."<br />
                        Track your income, expenses, and savings in one beautiful dashboard.
                    </p>
                </div>

                {/* Product Links */}
                <div className={styles.linksCol}>
                    <h4 className={styles.colTitle}>Product</h4>
                    <a href="#features" className={styles.footerLink}>Features</a>
                    <a href="#how-it-works" className={styles.footerLink}>How it Works</a>
                </div>

                {/* Company Links */}
                <div className={styles.linksCol}>
                    <h4 className={styles.colTitle}>Company</h4>
                    <a href="#about-us" className={styles.footerLink}>About Us</a>
                    <a href="#contact" className={styles.footerLink}>Contact</a>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className={styles.copyright}>
                    &copy; 2026 Moniq. All rights reserved by <span>Mohamed Fayed</span>.
                </div>
            </div>
        </footer>
    );
}