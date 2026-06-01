// local
import { Avatar } from "@mui/material";

// MUI
import styles from "./ReportOverviewBanner.module.css";

export default function ReportOverviewBanner({
    reportTitle,
    periodLabel,
    overviewData,
}) {
    const {
        totalTxCount,
        activeAccountsCount,
        activeCategoriesCount,
        userName,
        photoUrl,
    } = overviewData;

    // Get formatted generated timestamp
    const now = new Date();
    const formattedTimestamp =
        now.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
        }) +
        " at " +
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Avatar initials
    const nameParts = userName.split(" ");
    const initials =
        nameParts.length > 1
            ? nameParts[0][0].toUpperCase() +
              nameParts[nameParts.length - 1][0].toUpperCase()
            : nameParts[0][0].toUpperCase();

    return (
        <article
            className={`${styles.bannerCard} glass-card`}
            data-anim="header"
        >
            <div className={styles.bannerGrid}>
                {/* Left Column */}
                <div className={styles.leftCol}>
                    <span className={styles.reportTypeBadge}>
                        Structured Report
                    </span>
                    <h2 className={styles.reportTitle}>{reportTitle}</h2>
                    <p className={styles.periodDesc}>{periodLabel}</p>
                    <span className={styles.timestamp}>
                        Generated on {formattedTimestamp}
                    </span>
                </div>

                {/* Middle Column — Micro Stats */}
                <div
                    className={styles.middleCol}
                    aria-label="Report overview stats"
                >
                    <div className={styles.microStat}>
                        <span className={styles.statVal}>{totalTxCount}</span>
                        <span className={styles.statLabel}>Transactions</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.microStat}>
                        <span className={styles.statVal}>
                            {activeAccountsCount}
                        </span>
                        <span className={styles.statLabel}>Accounts</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.microStat}>
                        <span className={styles.statVal}>
                            {activeCategoriesCount}
                        </span>
                        <span className={styles.statLabel}>Categories</span>
                    </div>
                </div>

                {/* Right Column — User Profile */}
                <div className={styles.rightCol}>
                    <div className={styles.userProfileGroup}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{userName}</span>
                            <span className={styles.userLabel}>
                                Moniq Member
                            </span>
                        </div>
                        <Avatar
                            src={photoUrl}
                            alt={userName}
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: "var(--color-primary)",
                                fontSize: "15px",
                                fontWeight: 600,
                                fontFamily: "var(--font-sans)",
                                border: "2px solid rgba(255, 255, 255, 0.25)",
                            }}
                        >
                            {initials}
                        </Avatar>
                    </div>
                </div>
            </div>
        </article>
    );
}
