// local
import styles from "./NotificationBell.module.css";
import NotificationCenter from "./NotificationCenter";

// react
import { useState } from "react";
import { useSelector } from "react-redux";

// react icons
import { FiBell } from "react-icons/fi";

function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const notifications = useSelector((state) => state.notifications.items) || [];
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className={styles.bellContainer}>
            <button 
                className={`${styles.bellBtn} ${unreadCount > 0 ? styles.hasUnread : ""}`}
                onClick={() => setIsOpen(true)}
                title="Notifications"
                aria-label={`Notifications (${unreadCount} unread)`}
                id="tour-header-notifications"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>
            <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}

export default NotificationBell;
