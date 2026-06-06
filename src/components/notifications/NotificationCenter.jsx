// local
import styles from "./NotificationCenter.module.css";
import NotificationItem from "./NotificationItem";
import { 
    readNotification, 
    readAllNotifications, 
    removeNotification, 
    clearNotifications 
} from "../../redux/notificationsSlice";

// react
import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSweetAlert } from "../../hooks/useSweetAlert";

// animation
import gsap from "gsap";

// icons
import { FiX, FiCheckSquare, FiTrash2, FiBell, FiInbox } from "react-icons/fi";

// prop types
import PropTypes from "prop-types";

function NotificationCenter({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { confirm } = useSweetAlert();
    const overlayRef = useRef(null);
    const panelRef = useRef(null);

    const [activeTab, setActiveTab] = useState("unread"); // "unread" or "read"

    const userId = useSelector((state) => state.auth.user?.id);
    const { items: notifications, loading } = useSelector((state) => state.notifications);

    const unread = notifications.filter((n) => !n.is_read);
    const read = notifications.filter((n) => n.is_read);
    const unreadCount = unread.length;

    const currentNotifications = activeTab === "unread" ? unread : read;

    // ── GSAP Entrance Animation ─────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(overlayRef.current, 
                { opacity: 0 },
                { opacity: 1, duration: 0.25, ease: "power2.out" }
            );
            gsap.fromTo(panelRef.current, 
                { x: "100%", opacity: 0.8 },
                { x: "0%", opacity: 1, duration: 0.45, ease: "power3.out" }
            );
        });

        // Lock background scroll when open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            ctx.revert();
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // ── Smooth Close Animation ──────────────────────────────
    const handleClose = useCallback(() => {
        const overlay = overlayRef.current;
        const panel = panelRef.current;
        if (!overlay || !panel) {
            onClose();
            return;
        }

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) {
            onClose();
            return;
        }

        gsap.to(panel, {
            x: "100%",
            opacity: 0.8,
            duration: 0.35,
            ease: "power3.in",
        });
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: onClose,
        });
    }, [onClose]);

    // ── Escape Key Listener ─────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    // ── Action Handlers ─────────────────────────────────────
    const handleMarkRead = (id) => {
        dispatch(readNotification(id));
    };

    const handleDelete = (id) => {
        dispatch(removeNotification(id));
    };

    const handleMarkAllRead = () => {
        if (userId) dispatch(readAllNotifications(userId));
    };

    const handleClearAll = async () => {
        const confirmMsg = activeTab === "unread" 
            ? "All unread notifications will be permanently deleted." 
            : "All read notifications will be permanently deleted.";
        
        const isConfirmed = await confirm({
            title: "Clear Notifications?",
            text: confirmMsg,
            icon: "warning",
            confirmText: "Clear All",
            cancelText: "Cancel",
            confirmColor: "var(--color-danger)",
            iconColor: "var(--color-danger)",
        });

        if (isConfirmed && userId) {
            dispatch(clearNotifications(userId));
        }
    };

    return createPortal(
        <div 
            className={styles.overlay} 
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && handleClose()}
            role="presentation"
        >
            <div className={styles.panel} ref={panelRef} role="dialog" aria-modal="true" aria-label="Notification Center">
                
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTitleContainer}>
                        <h2 className={styles.title}>Notifications</h2>
                        {unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount} new</span>
                        )}
                    </div>
                    <button 
                        className={styles.closeBtn} 
                        onClick={handleClose}
                        aria-label="Close panel"
                    >
                        <FiX size={20} />
                    </button>
                </header>

                {/* Tabs Toggles */}
                <div className={styles.tabsContainer}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === "unread" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("unread")}
                        role="tab"
                        aria-selected={activeTab === "unread"}
                    >
                        <span>Unread</span>
                        {unreadCount > 0 && (
                            <span className={styles.tabBadge}>{unreadCount}</span>
                        )}
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === "read" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("read")}
                        role="tab"
                        aria-selected={activeTab === "read"}
                    >
                        <span>Read</span>
                        {read.length > 0 && (
                            <span className={`${styles.tabBadge} ${styles.readBadgeCount}`}>{read.length}</span>
                        )}
                    </button>
                </div>

                {/* Bulk Actions Menu */}
                {currentNotifications.length > 0 && (
                    <div className={styles.bulkActions}>
                        {activeTab === "unread" && unreadCount > 0 && (
                            <button className={styles.bulkBtn} onClick={handleMarkAllRead}>
                                <FiCheckSquare size={14} />
                                <span>Mark all read</span>
                            </button>
                        )}
                        <button className={`${styles.bulkBtn} ${styles.clearBtn}`} onClick={handleClearAll}>
                            <FiTrash2 size={14} />
                            <span>Clear all</span>
                        </button>
                    </div>
                )}

                {/* List Container */}
                <div className={styles.listContainer}>
                    {loading && notifications.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.spinner} />
                            <p>Fetching notifications...</p>
                        </div>
                    ) : currentNotifications.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconContainer}>
                                {activeTab === "unread" ? <FiBell size={32} /> : <FiInbox size={32} />}
                            </div>
                            <h3>
                                {activeTab === "unread" 
                                    ? "You're all caught up!" 
                                    : "No read history"}
                            </h3>
                            <p>
                                {activeTab === "unread" 
                                    ? "No new alerts at the moment. We'll let you know when something requires your attention."
                                    : "Notifications you mark as read will be archived here."}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.itemsGrid} role="list">
                            {currentNotifications.map((n) => (
                                <NotificationItem 
                                    key={n.id}
                                    notification={n}
                                    onMarkRead={handleMarkRead}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

NotificationCenter.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default NotificationCenter;
