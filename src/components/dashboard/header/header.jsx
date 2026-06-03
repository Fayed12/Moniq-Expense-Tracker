// local
import styles from "./header.module.css";
import useGetLocationPathValue from "../../../hooks/getLocationPathValue";
import { themeSelector, toggleTheme } from "../../../redux/theme/themeSlice";
import MainButton from "../../ui/button/MainButton";
import { startDashboardTour } from "../../../utils/guidedTour";

// react
import { useState, useEffect, useRef } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";

// gsap
import gsap from "gsap";

// react icons
import { FaSun, FaMoon } from "react-icons/fa";
import { FiBell, FiHelpCircle, FiMenu } from "react-icons/fi";

// MUI
import { Modal, Box, Avatar, Typography } from "@mui/material";

function Header({ setIsSidebarOpen }) {
    const dispatch = useDispatch();
    const themeValue = useSelector(themeSelector);
    const { profile } = useSelector((s) => s.auth);
    const headerRef = useRef(null);

    const nameArray = profile?.display_name?.split(" ");
    const avatarName =
        nameArray?.at(0)?.toUpperCase().slice(0, 1) +
        nameArray
            ?.at(nameArray.length - 1)
            ?.toUpperCase()
            .slice(0, 1);

    const locationValue = useGetLocationPathValue();

    // Profile Modal State
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // GSAP entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                y: -50,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
            });
        }, headerRef);
        return () => ctx.revert();
    }, []);

    const handleHelpClick = () => {
        startDashboardTour();
    };

    return (
        <header className={styles.header} ref={headerRef}>
            <div className={styles.leftSection}>
                {/* Hamburger — mobile only */}
                <MainButton
                    action="ghost"
                    className={styles.menuBtn}
                    clickEvent={() => setIsSidebarOpen(true)}
                    title="Open Sidebar"
                >
                    <FiMenu size={22} />
                </MainButton>

                <h1 className={styles.title} id="tour-header-location">
                    dashboard/
                    <span className={styles.locationValue}>
                        {locationValue}
                    </span>
                </h1>
            </div>

            <div className={styles.rightSection}>
                {/* Theme toggle */}
                <MainButton
                    id="tour-header-theme"
                    action="ghost"
                    className={styles.iconBtn}
                    clickEvent={() => dispatch(toggleTheme())}
                    title={
                        themeValue === "dark"
                            ? "Switch to Light"
                            : "Switch to Dark"
                    }
                >
                    {themeValue === "dark" ? (
                        <FaSun size={19} />
                    ) : (
                        <FaMoon size={19} />
                    )}
                </MainButton>

                {/* Notifications */}
                <MainButton
                    id="tour-header-notifications"
                    action="ghost"
                    className={styles.iconBtn}
                    title="Notifications"
                >
                    <FiBell size={19} />
                </MainButton>

                {/* Help */}
                <MainButton
                    id="tour-header-help"
                    action="ghost"
                    className={styles.iconBtn}
                    title="Help"
                    clickEvent={handleHelpClick}
                >
                    <FiHelpCircle size={19} />
                </MainButton>

                {/* Avatar — opens profile modal */}
                <div id="tour-header-avatar" style={{ display: "inline-flex" }}>
                    <Avatar
                        onClick={() => setIsProfileOpen(true)}
                        src={profile?.photo_url}
                        alt={profile?.display_name}
                        sx={{
                            width: 38,
                            height: 38,
                            cursor: "pointer",
                            bgcolor: "var(--color-primary)",
                            fontSize: "14px",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                        }}
                    >
                        {avatarName}
                    </Avatar>
                </div>
            </div>

            {/* Profile Modal */}
            <Modal
                open={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                aria-labelledby="profile-modal-title"
                aria-describedby="profile-modal-description"
            >
                <Box className={styles.profileModal}>
                    <Avatar
                        src={profile?.photo_url}
                        alt={profile?.display_name}
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "var(--color-primary)",
                            mb: 2,
                            fontSize: "28px",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 700,
                        }}
                    >
                        {avatarName}
                    </Avatar>
                    <Typography
                        id="profile-modal-title"
                        variant="h6"
                        component="h2"
                        sx={{
                            color: "var(--color-text-primary)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                        }}
                    >
                        {profile?.display_name}
                    </Typography>
                    <Typography
                        id="profile-modal-description"
                        sx={{
                            mt: 0.5,
                            color: "var(--color-text-secondary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "14px",
                        }}
                    >
                        {profile?.email}
                    </Typography>

                    {/* Modal close button */}
                    <MainButton
                        action="outline"
                        size="sm"
                        className={styles.modalCloseBtn}
                        clickEvent={() => setIsProfileOpen(false)}
                    >
                        Close
                    </MainButton>
                </Box>
            </Modal>
        </header>
    );
}

export default Header;
