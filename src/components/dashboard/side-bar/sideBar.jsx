// local
import styles from "./sideBar.module.css";
import LogoutButton from "../logout/logout";

// react router
import { NavLink } from "react-router";

// react
import { useEffect, useRef } from "react";

// gsap
import gsap from "gsap";

// react icons
import { MdDashboard, MdOutlineAccountBalanceWallet, MdOutlineEventRepeat } from "react-icons/md";
import { RiBankLine } from "react-icons/ri";
import { TbReceipt2 } from "react-icons/tb";
import { IoAnalyticsOutline } from "react-icons/io5";
import { GoGoal } from "react-icons/go";
import { HiOutlineChartBar } from "react-icons/hi";
import { FiSettings, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const navItems = [
    { name: "Home", path: "/dashboard/home", icon: <MdDashboard /> },
    { name: "Accounts", path: "/dashboard/accounts", icon: <RiBankLine /> },
    { name: "Transactions", path: "/dashboard/transactions", icon: <TbReceipt2 /> },
    { name: "Analytics", path: "/dashboard/analytics", icon: <IoAnalyticsOutline /> },
    { name: "Budget", path: "/dashboard/budget", icon: <MdOutlineAccountBalanceWallet /> },
    { name: "Goals", path: "/dashboard/goals", icon: <GoGoal /> },
    { name: "Recurring", path: "/dashboard/recurring", icon: <MdOutlineEventRepeat /> },
    { name: "Reports", path: "/dashboard/reports", icon: <HiOutlineChartBar /> },
    { name: "Settings", path: "/dashboard/settings", icon: <FiSettings /> },
];

function SideBar({ isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed }) {
    const sidebarRef = useRef(null);
    const navLinksContainerRef = useRef(null);

    useEffect(() => {
        // Sidebar entrance animation — desktop only
        if (window.innerWidth > 992) {
            const ctx = gsap.context(() => {
                // Animate the sidebar panel itself
                gsap.fromTo(sidebarRef.current,
                    { x: -280, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
                );

                // Animate each direct child link of the nav container
                const links = navLinksContainerRef.current?.querySelectorAll("a");
                if (links && links.length > 0) {
                    gsap.fromTo(links,
                        { x: -20, opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.3 }
                    );
                }
            }, sidebarRef);

            return () => ctx.revert();
        }
    }, []);

    const handleNavClick = () => {
        // Always close on mobile when a link is clicked
        if (window.innerWidth <= 992) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <aside
            ref={sidebarRef}
            className={`${styles.sideBar} ${isSidebarOpen ? styles.sideBarOpen : ""} ${isSidebarCollapsed ? styles.sideBarCollapsed : ""}`}
        >
            {/* Logo */}
            <div className={styles.logoContainer}>
                <img src="/logo.png" alt="Moniq Logo" className={styles.logo} />
            </div>

            {/* Navigation */}
            <nav ref={navLinksContainerRef} className={styles.navLinks}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                        title={item.name}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navText}>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className={styles.footerActions}>
                {/* Collapse toggle — hidden on mobile via CSS */}
                <button
                    className={styles.collapseBtn}
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                    {!isSidebarCollapsed && <span>Collapse</span>}
                </button>

                {/* <MainButton
                    action="ghost"
                    className={styles.logoutBtn}
                    clickEvent={() => console.log("Logout clicked")}
                >
                    <FiLogOut size={18} />
                    {!isSidebarCollapsed && <span>Logout</span>}
                </MainButton> */}

                <LogoutButton collapse={isSidebarCollapsed}/>
            </div>
        </aside>
    );
}

export default SideBar;