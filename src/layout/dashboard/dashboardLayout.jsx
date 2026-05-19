// local
import styles from "./dashboardLayout.module.css";
import SideBar from "../../components/dashboard/side-bar/sideBar";
import Footer from "../../components/dashboard/footer/footer";
import Header from "../../components/dashboard/header/header";

// react
import { useState } from "react";

// react router
import { Outlet } from "react-router";

function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Auto-collapse logic for small screens is handled by CSS mostly, but we can sync state if needed.

    return (
        <div className={styles.appLayout}>
            <SideBar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
            />
            
            <div className={styles.mainContent}>
                <Header setIsSidebarOpen={setIsSidebarOpen} />
                <main className={styles.main}>
                    <div className={styles.pageContainer}>
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}
        </div>
    );
}

export default DashboardLayout;