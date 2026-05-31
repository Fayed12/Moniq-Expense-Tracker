// local
import styles from "./GoalDetailsPanel.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import ContributionsTable from "./ContributionsTable";

// react
import { useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

// react icons
import {
    FiX,
    FiCalendar,
    FiTarget,
    FiInfo,
    FiChevronRight,
    FiAlertTriangle,
} from "react-icons/fi";
import {
    FaFlag,
    FaHome,
    FaCar,
    FaShieldAlt,
    FaLaptop,
    FaPlane,
    FaGamepad,
    FaGraduationCap,
    FaHeart,
    FaBriefcase,
    FaShoppingBag,
    FaGift,
    FaDollarSign,
    FaPiggyBank,
    FaEllipsisH,
} from "react-icons/fa";

// gsap
import gsap from "gsap";

// prop-types
import PropTypes from "prop-types";

// ── Icons grid options ───────────────────────────────────────
const ICON_MAP = {
    FaFlag,
    FaHome,
    FaCar,
    FaShieldAlt,
    FaLaptop,
    FaPlane,
    FaGamepad,
    FaGraduationCap,
    FaHeart,
    FaBriefcase,
    FaShoppingBag,
    FaGift,
    FaDollarSign,
    FaPiggyBank,
    FaEllipsisH,
};

function DynamicIcon({ name, ...props }) {
    const IconComp = ICON_MAP[name] || FaFlag;
    return <IconComp {...props} />;
}

// ════════════════════════════════════════════════════════════
// GOAL DETAILS SLIDE-IN PANEL (Right-to-left)
// ════════════════════════════════════════════════════════════
function GoalDetailsPanel({
    goal,
    contributions = [],
    onClose,
    userId,
    accounts = [],
    defaultAccount,
    budgetByCategory = {},
    spentByCategory = {},
    currency = "EGP",
    onAddContribution,
    onRefresh,
}) {
    // ── Animation Refs ──────────────────────────────────────
    const overlayRef = useRef(null);
    const panelRef = useRef(null);

    // ── GSAP Entrance Animation (Right-to-left) ─────────────
    useEffect(() => {
        const overlay = overlayRef.current;
        const panel = panelRef.current;
        if (!overlay || !panel) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            gsap.from(overlay, {
                opacity: 0,
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.fromTo(
                panel,
                { x: "100%" },
                { x: "0%", duration: 0.35, ease: "power3.out" },
            );
        });

        // Scroll lock
        document.body.style.overflow = "hidden";

        return () => {
            ctx.revert();
            document.body.style.overflow = "";
        };
    }, []);

    // ── Close Animation ─────────────────────────────────────
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
            duration: 0.25,
            ease: "power3.in",
        });
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
            onComplete: onClose,
        });
    }, [onClose]);

    // ── Escape Key Listener ─────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose]);

    // Active Account object
    const linkedAccount = useMemo(() => {
        if (!goal.linked_account_id) return null;
        return accounts.find((a) => a.id === goal.linked_account_id) || null;
    }, [accounts, goal.linked_account_id]);

    // Days remaining till deadline
    const deadlineText = useMemo(() => {
        if (!goal.deadline) return "No target deadline set";
        const target = new Date(goal.deadline);
        const today = new Date();
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "Deadline passed";
        if (diffDays === 0) return "Deadline is today!";
        if (diffDays === 1) return "1 day remaining";
        if (diffDays < 30) return `${diffDays} days remaining`;

        const diffMonths = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        if (remainingDays === 0) return `${diffMonths} months remaining`;
        return `${diffMonths}m ${remainingDays}d remaining`;
    }, [goal.deadline]);

    // Remaining money to save
    const remainingAmount = useMemo(() => {
        return Math.max(
            Number(goal.target_amount || 0) - Number(goal.current_amount || 0),
            0,
        );
    }, [goal.target_amount, goal.current_amount]);

    return createPortal(
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && handleClose()}
            role="presentation"
        >
            <div
                className={styles.panel}
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="details-panel-title"
            >
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTitleWrap}>
                        <span
                            className={styles.goalIcon}
                            style={{
                                background:
                                    goal.color || "var(--color-primary)",
                            }}
                        >
                            <DynamicIcon name={goal.icon} />
                        </span>
                        <div>
                            <h2
                                id="details-panel-title"
                                className={styles.title}
                            >
                                {goal.name}
                            </h2>
                            <span
                                className={styles.statusTag}
                                data-status={goal.status}
                            >
                                {goal.is_completed ? "Completed" : goal.status}
                            </span>
                        </div>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={handleClose}
                        aria-label="Close details panel"
                        type="button"
                    >
                        <FiX />
                    </button>
                </header>

                {/* Body scroll wrap */}
                <div className={styles.body}>
                    {/* Goal Description */}
                    {goal.description && (
                        <div className={styles.descCard}>
                            <FiInfo className={styles.descIcon} />
                            <p className={styles.descText}>
                                {goal.description}
                            </p>
                        </div>
                    )}

                    {/* Math progress metrics */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <p className={styles.statLabel}>Current Saved</p>
                            <p
                                className={styles.statVal}
                                style={{ color: "var(--color-success)" }}
                            >
                                {currency}{" "}
                                {Number(
                                    goal.current_amount || 0,
                                ).toLocaleString()}
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <p className={styles.statLabel}>Target Goal</p>
                            <p className={styles.statVal}>
                                {currency}{" "}
                                {Number(
                                    goal.target_amount || 0,
                                ).toLocaleString()}
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <p className={styles.statLabel}>
                                Remaining to Save
                            </p>
                            <p
                                className={styles.statVal}
                                style={{
                                    color:
                                        remainingAmount > 0
                                            ? "var(--color-primary)"
                                            : "var(--color-success)",
                                }}
                            >
                                {currency} {remainingAmount.toLocaleString()}
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <p className={styles.statLabel}>Contributions</p>
                            <p className={styles.statVal}>
                                {goal.contribution_count || 0} times
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar large */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabels}>
                            <span>Accumulated Progression</span>
                            <span>{goal.pct}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${goal.pct}%`,
                                    background:
                                        goal.color || "var(--color-primary)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Deadline countdown & Linked Account details */}
                    <div className={styles.detailsGroup}>
                        <div className={styles.detailRow}>
                            <FiCalendar className={styles.detailIcon} />
                            <div>
                                <p className={styles.detailLabel}>
                                    Deadline Target
                                </p>
                                <p className={styles.detailVal}>
                                    {goal.deadline
                                        ? new Date(
                                              goal.deadline,
                                          ).toLocaleDateString(undefined, {
                                              month: "long",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : "No target set"}
                                </p>
                                <p className={styles.detailSub}>
                                    {deadlineText}
                                </p>
                            </div>
                        </div>

                        <div className={styles.detailRow}>
                            <FiTarget className={styles.detailIcon} />
                            <div>
                                <p className={styles.detailLabel}>
                                    Linked Funding Source
                                </p>
                                <p className={styles.detailVal}>
                                    {linkedAccount
                                        ? linkedAccount.name
                                        : "General cash flow (No specific linked account)"}
                                </p>
                                {linkedAccount && (
                                    <p className={styles.detailSub}>
                                        Balance: {linkedAccount.currency}{" "}
                                        {Number(
                                            linkedAccount.balance,
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pause warning if active */}
                    {goal.is_paused && (
                        <div className={styles.pausedBanner}>
                            <FiAlertTriangle className={styles.pausedIcon} />
                            <span>
                                This goal is currently paused. Resume this goal
                                in the edit settings to log new contributions.
                            </span>
                        </div>
                    )}

                    {/* Contributions History table (Material UI) */}
                    <ContributionsTable
                        goal={goal}
                        contributions={contributions}
                        userId={userId}
                        accounts={accounts}
                        defaultAccount={defaultAccount}
                        budgetByCategory={budgetByCategory}
                        spentByCategory={spentByCategory}
                        currency={currency}
                        onRefresh={onRefresh}
                    />
                </div>

                {/* Footer sticky action */}
                <footer className={styles.footer}>
                    <MainButton
                        action="ghost"
                        size="md"
                        title="Close details"
                        clickEvent={handleClose}
                    >
                        Close
                    </MainButton>
                    {!goal.is_completed && !goal.is_paused && (
                        <MainButton
                            action="primary"
                            size="md"
                            title="Add Contribution"
                            clickEvent={() => onAddContribution(goal)}
                        >
                            Add Contribution{" "}
                            <FiChevronRight style={{ marginLeft: "4px" }} />
                        </MainButton>
                    )}
                </footer>
            </div>
        </div>,
        document.body,
    );
}

GoalDetailsPanel.propTypes = {
    goal: PropTypes.object.isRequired,
    contributions: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    accounts: PropTypes.array,
    defaultAccount: PropTypes.object,
    budgetByCategory: PropTypes.object,
    spentByCategory: PropTypes.object,
    currency: PropTypes.string,
    onAddContribution: PropTypes.func.isRequired,
    onRefresh: PropTypes.func,
};

export default GoalDetailsPanel;
