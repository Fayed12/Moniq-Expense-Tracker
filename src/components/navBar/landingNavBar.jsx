// local
import styles from "./LandingNavBar.module.css";
import MainButton from "../ui/button/MainButton";
import { themeSelector } from "../../redux/theme/themeSlice";
import { toggleTheme } from "../../redux/theme/themeSlice";

// gsap
import gsap from "gsap";

// react
import { useState, useEffect, useRef } from "react";

// redux
import { useSelector, useDispatch } from "react-redux";

// icons
import { FaMoon, FaSun } from "react-icons/fa";

// react router
import { Link } from "react-router";


export default function LandingNavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const menuRef = useRef(null);
    const linksRef = useRef(null);

    const { user } = useSelector((state) => state.auth);

    // redux
    const dispatch = useDispatch()
    const themeValue = useSelector(themeSelector)

    // Handle scroll effect & active section
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Determine active section based on scroll position
            const sections = ['home', 'about-us', 'features', 'how-it-works', 'contact'];
            let current = 'home';
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // if the top of the element is above the middle of the screen
                    if (rect.top <= window.innerHeight / 2.5) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll(); // initialize
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle Mobile Menu Animation
    useEffect(() => {
        if (isMenuOpen) {
            gsap.to(menuRef.current, {
                autoAlpha: 1,
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.fromTo(linksRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: "power2.out" }
            );
        } else {
            gsap.to(menuRef.current, {
                autoAlpha: 0,
                duration: 0.3,
                ease: "power2.in"
            });
        }
    }, [isMenuOpen]);

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            <nav className={`${styles.navBar} ${isScrolled ? styles.navScrolled : ""}`}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <img src="/logo.png" alt="Moniq Logo" />
                </Link>

                <div className={styles.links}>
                    <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className={activeSection === 'home' ? styles.navLinkActive : styles.navLink}>Home</a>
                    <a href="#about-us" onClick={(e) => { e.preventDefault(); scrollToSection('about-us'); }} className={activeSection === 'about-us' ? styles.navLinkActive : styles.navLink}>About Us</a>
                    <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className={activeSection === 'features' ? styles.navLinkActive : styles.navLink}>Features</a>
                    <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className={activeSection === 'how-it-works' ? styles.navLinkActive : styles.navLink}>How it Works</a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={activeSection === 'contact' ? styles.navLinkActive : styles.navLink}>Contact</a>
                </div>

                {/* Right Section: Actions + Burger */}
                <div className={styles.rightSection}>
                    {/* Desktop Actions (Now always visible) */}
                    <div className={styles.actions}>
                        <button className={styles.themeToggle} onClick={() => dispatch(toggleTheme())} aria-label="Toggle Theme">
                            {themeValue === "dark" ? <FaSun /> : <FaMoon />}
                        </button>
                        {user ? (
                            <Link to="/dashboard">
                                <MainButton action="primary" size="md">
                                    Dashboard
                                </MainButton>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <MainButton action="primary" size="md">
                                    Login
                                </MainButton>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Burger Icon */}
                    <button
                        className={styles.burger}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <div className={styles.burgerLine} style={{ transform: isMenuOpen ? 'rotate(45deg)' : 'rotate(0)' }}></div>
                        <div className={styles.burgerLine} style={{ opacity: isMenuOpen ? 0 : 1, transform: isMenuOpen ? 'translateX(20px)' : 'translateX(0)' }}></div>
                        <div className={styles.burgerLine} style={{ transform: isMenuOpen ? 'rotate(-45deg)' : 'rotate(0)' }}></div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={styles.mobileMenu} ref={menuRef}>
                <div ref={linksRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                    <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className={activeSection === 'home' ? styles.mobileLinkActive : styles.mobileLink}>Home</a>
                    <a href="#about-us" onClick={(e) => { e.preventDefault(); scrollToSection('about-us'); }} className={activeSection === 'about-us' ? styles.mobileLinkActive : styles.mobileLink}>About Us</a>
                    <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className={activeSection === 'features' ? styles.mobileLinkActive : styles.mobileLink}>Features</a>
                    <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className={activeSection === 'how-it-works' ? styles.mobileLinkActive : styles.mobileLink}>How it Works</a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={activeSection === 'contact' ? styles.mobileLinkActive : styles.mobileLink}>Contact</a>
                </div>
            </div>
        </>
    );
}