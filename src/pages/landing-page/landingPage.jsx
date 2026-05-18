// local
import styles from "./landingPage.module.css";
import LandingNavBar from "../../components/navBar/landingNavBar";
import LandingFooter from "../../components/landing-footer/landingFooter";
import MainButton from "../../components/ui/button/MainButton";
import Contact from "./contact/contact";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// react icons
import { FaShieldAlt, FaDesktop, FaChartPie, FaWallet, FaRegMoneyBillAlt, FaBullseye, FaSyncAlt } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
    const mainRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // ── Hero Entry Animation ─────────────────────────────
            gsap.from(".hero-anim", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out"
            });

            gsap.to(".hero-float", {
                y: -15,
                duration: 2.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            // ── Stats Scroll Animation ───────────────────────────
            gsap.from(".stat-anim", {
                scrollTrigger: {
                    trigger: `.${styles.statsBar}`,
                    start: "top 85%",
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: "power2.out"
            });

            // ── About Us Scroll Animation ────────────────────────
            gsap.from(".about-anim", {
                scrollTrigger: {
                    trigger: `.${styles.aboutUs}`,
                    start: "top 80%",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out"
            });

            // ── Features Scroll Animation ────────────────────────
            gsap.from(".feature-anim", {
                scrollTrigger: {
                    trigger: `.${styles.features}`,
                    start: "top 80%",
                },
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "back.out(1.2)"
            });

            // ── App Preview Scroll Animation ─────────────────────
            gsap.from(`.${styles.browserMockup}`, {
                scrollTrigger: {
                    trigger: `.${styles.preview}`,
                    start: "top 70%",
                },
                y: 60,
                scale: 0.95,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });

            // ── How It Works Scroll Animation ────────────────────
            gsap.from(".step-anim", {
                scrollTrigger: {
                    trigger: `.${styles.howItWorks}`,
                    start: "top 75%",
                },
                x: -30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            });

        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={styles.landingPage} ref={mainRef}>
            <LandingNavBar />

            {/* ── SECTION 1: HERO ── */}
            <section className={styles.hero} id="home">
                <div className={styles.heroBlob1}></div>
                <div className={styles.heroBlob2}></div>
                
                <div className={styles.heroContent}>
                    <div>
                        <span className={`${styles.heroEyebrow} hero-anim`}>Personal Finance, Simplified</span>
                        <h1 className={`${styles.heroTitle} hero-anim`}>Know where your money goes.</h1>
                        <p className={`${styles.heroSubtitle} hero-anim`}>
                            Moniq tracks your income, expenses, and savings in one beautiful dashboard — completely free.
                        </p>
                        
                        <div className={`${styles.heroActions} hero-anim`}>
                            <MainButton action="primary" size="lg">
                                Get Started Free
                            </MainButton>
                        </div>
                        <div className={`${styles.heroNote} hero-anim`}>
                            <FaShieldAlt /> No credit card required · Free forever
                        </div>
                    </div>

                    <div className="hero-float">
                        <div className={styles.heroGraphic}>
                            <div className={styles.heroCard}>
                                <div className={styles.cardSkeletonLine}></div>
                                <div className={styles.cardSkeletonLine}></div>
                                <div className={styles.cardSkeletonLine}></div>
                                <div className={styles.cardSkeletonLine}></div>
                                <div className={styles.cardSkeletonLine}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 2: STATS ── */}
            <section className={styles.statsBar}>
                <div className={styles.statsGrid}>
                    <div className={`${styles.statItem} stat-anim`}>
                        <div className={styles.statIcon}>100%</div>
                        <span className={styles.statLabel}>Free Forever</span>
                    </div>
                    <div className={`${styles.statItem} stat-anim`}>
                        <div className={styles.statIcon}><FaShieldAlt /></div>
                        <span className={styles.statLabel}>All Data Local & Secure</span>
                    </div>
                    <div className={`${styles.statItem} stat-anim`}>
                        <div className={styles.statIcon}><FaDesktop /></div>
                        <span className={styles.statLabel}>Works on All Devices</span>
                    </div>
                </div>
            </section>

            {/* ── SECTION: ABOUT US ── */}
            <section className={styles.aboutUs} id="about-us">
                <div className={styles.aboutContent}>
                    <h2 className={`${styles.sectionTitle} about-anim`}>About Moniq</h2>
                    <p className={`${styles.aboutText} about-anim`}>
                        We are on a mission to simplify personal finance. Managing money shouldn't require a degree in accounting or an expensive subscription. We built Moniq to be beautiful, intuitive, and completely free—giving you the clarity you need to reach your financial goals.
                    </p>
                </div>
            </section>

            {/* ── SECTION 3: FEATURES ── */}
            <section className={styles.features} id="features">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Everything you need to manage money</h2>
                </div>
                <div className={styles.featuresGrid}>
                    {[
                        { icon: <FaChartPie />, title: "Dashboard overview", desc: "Get a bird's-eye view of your financial health at a single glance." },
                        { icon: <FaWallet />, title: "Transaction management", desc: "Easily log and categorize all your daily expenses and incomes." },
                        { icon: <FaRegMoneyBillAlt />, title: "Budget tracking", desc: "Set limits on categories so you never overspend again." },
                        { icon: <FaChartPie />, title: "Analytics & charts", desc: "Deep dive into your spending habits with interactive beautiful charts." },
                        { icon: <FaBullseye />, title: "Savings goals", desc: "Set targets for a new car or vacation, and track your progress." },
                        { icon: <FaSyncAlt />, title: "Recurring transactions", desc: "Never forget a bill. Set it up once, and let Moniq handle the rest." }
                    ].map((feature, i) => (
                        <div className={`${styles.featureCard} feature-anim`} key={i}>
                            <div className={styles.featureIconCircle}>{feature.icon}</div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDesc}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SECTION 4: APP PREVIEW ── */}
            <section className={styles.preview}>
                <h2 className={styles.previewTitle}>A dashboard that actually makes sense</h2>
                <div className={styles.browserMockup}>
                    <div className={styles.browserChrome}>
                        <div className={`${styles.browserDot} ${styles.dotRed}`}></div>
                        <div className={`${styles.browserDot} ${styles.dotYellow}`}></div>
                        <div className={`${styles.browserDot} ${styles.dotGreen}`}></div>
                    </div>
                    <div className={styles.browserContent}>
                        {/* Placeholder for the dashboard preview UI */}
                        <div className={styles.cardSkeletonLine} style={{width: '200px', marginBottom: '24px'}}></div>
                        <div style={{display: 'flex', gap: '16px'}}>
                            <div className={styles.cardSkeletonLine} style={{flex: 1, height: '100px'}}></div>
                            <div className={styles.cardSkeletonLine} style={{flex: 1, height: '100px'}}></div>
                            <div className={styles.cardSkeletonLine} style={{flex: 1, height: '100px'}}></div>
                        </div>
                        <div style={{display: 'flex', gap: '16px', marginTop: '16px'}}>
                            <div className={styles.cardSkeletonLine} style={{flex: 2, height: '200px'}}></div>
                            <div className={styles.cardSkeletonLine} style={{flex: 1, height: '200px'}}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 5: HOW IT WORKS ── */}
            <section className={styles.howItWorks} id="how-it-works">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>How it works</h2>
                </div>
                <div className={styles.stepsGrid}>
                    {[
                        { num: 1, title: "Add transactions", desc: "Quickly log your daily spending and earnings." },
                        { num: 2, title: "Set budgets", desc: "Assign spending limits to keep yourself in check." },
                        { num: 3, title: "Reach your goals", desc: "Watch your savings grow and hit your targets." }
                    ].map((step, i) => (
                        <div className={`${styles.stepCard} step-anim`} key={i}>
                            <div className={styles.stepNumber}>{step.num}</div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SECTION 6: CTA BANNER ── */}
            <section className={styles.ctaBanner}>
                <h2 className={styles.ctaTitle}>Start tracking for free today</h2>
                <p className={styles.ctaSubtitle}>Join thousands of users who have taken control of their financial lives. No credit card required.</p>
                <MainButton action="primary" size="lg" className="bg-white text-brown-500">
                    Create Free Account
                </MainButton>
            </section>

            {/* ── SECTION 7: CONTACT ── */}
            <section id="contact">
                <Contact />
            </section>

            <LandingFooter />
        </div>
    );
}

export default LandingPage;
