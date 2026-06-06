// local
import styles from "./NotificationItem.module.css";

// react
import { useState } from "react";

// react icons
import { 
    FiDollarSign, FiAward, FiTarget, FiAlertTriangle, 
    FiArrowRight, FiBarChart2, FiTrash2, FiCheck, FiBell,
    FiChevronDown, FiChevronUp
} from "react-icons/fi";
import PropTypes from "prop-types";

// ── Icon and Label map based on notification type ──────────────────────────
const TYPE_CONFIG = {
    budget_alert: { icon: FiDollarSign, label: "Budget", color: "var(--color-expense)" },
    goal_reached: { icon: FiAward, label: "Goal Reached", color: "var(--color-success)" },
    goal_milestone: { icon: FiTarget, label: "Goal Milestone", color: "var(--color-primary)" },
    low_balance: { icon: FiAlertTriangle, label: "Account Warning", color: "var(--color-danger)" },
    transfer_complete: { icon: FiArrowRight, label: "Transfer", color: "var(--color-transfer)" },
    weekly_digest: { icon: FiBarChart2, label: "Digest", color: "var(--color-info)" },
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({ notification, onMarkRead, onDelete }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { id, type, title, message, is_read, priority, created_at } = notification;

    const config = TYPE_CONFIG[type] || { icon: FiBell, label: "Notification", color: "var(--color-primary)" };
    const IconComponent = config.icon;

    const handleToggleExpand = (e) => {
        // Prevent expansion if clicking on action buttons
        if (e.target.closest("button")) return;
        setIsExpanded(prev => !prev);
    };

    return (
        <div 
            className={`${styles.card} ${!is_read ? styles.unread : ""} ${isExpanded ? styles.expanded : ""} ${styles["priority-" + priority]}`}
            onClick={handleToggleExpand}
            role="listitem"
            aria-expanded={isExpanded}
        >
            <div className={styles.topRow}>
                {/* Icon wrapper */}
                <div 
                    className={styles.iconContainer}
                    style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                    <IconComponent size={18} />
                </div>

                {/* Header text info */}
                <div className={styles.headerInfo}>
                    <div className={styles.typeRow}>
                        <span className={styles.typeLabel}>{config.label}</span>
                        <span className={styles.timeAgo}>{timeAgo(created_at)}</span>
                    </div>
                    <h4 className={styles.cardTitle}>{title}</h4>
                </div>

                {/* Expand Chevron / Unread Dot */}
                <div className={styles.rightIndicators}>
                    {!is_read && <span className={styles.unreadDot} />}
                    <span className={styles.chevron}>
                        {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </span>
                </div>
            </div>

            {/* Collapsible details message */}
            <div className={`${styles.messageContainer} ${isExpanded ? styles.show : ""}`}>
                <p className={styles.messageText}>{message}</p>
                
                {/* Actions row */}
                <div className={styles.actionsRow}>
                    {!is_read && (
                        <button 
                            className={`${styles.actionBtn} ${styles.readBtn}`}
                            onClick={(e) => { e.stopPropagation(); onMarkRead(id); }}
                            title="Mark as read"
                        >
                            <FiCheck size={14} />
                            <span>Mark Read</span>
                        </button>
                    )}
                    <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                        title="Delete notification"
                    >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        is_read: PropTypes.bool.isRequired,
        priority: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
    }).isRequired,
    onMarkRead: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default NotificationItem;
