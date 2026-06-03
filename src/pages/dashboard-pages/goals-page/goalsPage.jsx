// local
import styles from "./goalsPage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { useGoalsPageData } from "../../../hooks/useGoalsPageData";
import AddGoalModal from "./AddGoalModal";
import AddContributionModal from "./AddContributionModal";
import DeleteGoalModal from "./DeleteGoalModal";
import GoalDetailsPanel from "./GoalDetailsPanel";

// react
import { useState, useEffect, useRef } from "react";

// redux
import { useDispatch } from "react-redux";
import { loadContributions } from "../../../redux/goalsSlice";

// gsap
import gsap from "gsap";

// react-icons
import {
    FiPlus,
    FiMoreVertical,
    FiEdit2,
    FiInfo,
    FiTrash2,
    FiAlertCircle,
    FiCompass,
    FiAward,
    FiCreditCard,
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

// ── Icon Map resolver ────────────────────────────────────────
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

function GoalsPage() {
    const dispatch = useDispatch();

    // ── Fetch unified page data via custom hook ──────────────
    const pageData = useGoalsPageData();
    const {
        goals,
        contributions,
        accounts,
        defaultAccount,
        profile,
        currency,
        totalTarget,
        totalAccumulated,
        overallProgress,
        milestones,
        smartSuggestions,
        activeExpenseCategories,
        budgetByCategory,
        spentByCategory,
        userId,
        loading,
    } = pageData;

    // ── Load contributions for all goals on mount ────────────
    const goalIdsKey = goals.map((g) => g.id).join(",");

    useEffect(() => {
        if (!userId || goals.length === 0) return;
        goals.forEach((g) => {
            dispatch(loadContributions(g.id));
        });
        // We depend on goalIdsKey instead of goals to prevent reference-invalidation rendering loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, goalIdsKey, dispatch]);

    // ── Modals and Popups States ────────────────────────────
    const [activeModal, setActiveModal] = useState(null); // 'add' | 'edit' | 'contrib' | 'delete' | null
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [activeDetailsGoal, setActiveDetailsGoal] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // tracking open goal card action list

    // ── Animation Refs ──────────────────────────────────────
    const containerRef = useRef(null);

    // ── Opening GSAP stagger entrance ────────────────────────
    useEffect(() => {
        const container = containerRef.current;
        if (!container || loading) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            // Main elements stagger up
            gsap.fromTo(
                `.${styles.animateItem}`,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: "power3.out",
                },
            );

            // Progress bar filling animations
            const bars = document.querySelectorAll(`.${styles.progressFill}`);
            bars.forEach((bar) => {
                const targetWidth = bar.dataset.width || "0%";
                gsap.fromTo(
                    bar,
                    { width: "0%" },
                    {
                        width: targetWidth,
                        duration: 1.2,
                        delay: 0.3,
                        ease: "power2.out",
                    },
                );
            });
        }, container);

        return () => ctx.revert();
    }, [loading, goals.length]);

    // Close all menus on click outside
    useEffect(() => {
        const handleOutsideClick = () => setOpenMenuId(null);
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    // ── Deletion triggers ───────────────────────────────────
    const handleDeleteGoalClick = (goalItem) => {
        setSelectedGoal(goalItem);
        setActiveModal("delete");
    };

    // ── Contributions addition triggers ─────────────────────
    const handleAddContribClick = (goalItem) => {
        setSelectedGoal(goalItem);
        setActiveModal("contrib");
    };

    // ── Goal Edit triggers ──────────────────────────────────
    const handleEditGoalClick = (goalItem) => {
        setSelectedGoal(goalItem);
        setActiveModal("edit");
    };

    return (
        <div ref={containerRef} className={styles.container}>
            {/* Header section */}
            <header className={`${styles.header} ${styles.animateItem}`}>
                <div>
                    <h1 className={styles.mainTitle}>Savings Goals</h1>
                    <p className={styles.subtitle}>
                        Track and accelerate your financial aspirations.
                    </p>
                </div>
                <MainButton
                    id="tour-goals-add"
                    action="primary"
                    size="md"
                    title="Add New Goal"
                    clickEvent={() => {
                        setSelectedGoal(null);
                        setActiveModal("add");
                    }}
                >
                    <FiPlus style={{ marginRight: "6px" }} /> Add New Goal
                </MainButton>
            </header>

            {loading && goals.length === 0 ? (
                /* Skeleton loader */
                <div className={styles.loadingState}>
                    <div
                        className="skeleton"
                        style={{
                            height: 180,
                            borderRadius: 24,
                            marginBottom: 24,
                        }}
                    />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: 24,
                        }}
                    >
                        <div
                            className="skeleton"
                            style={{ height: 400, borderRadius: 24 }}
                        />
                        <div
                            className="skeleton"
                            style={{ height: 400, borderRadius: 24 }}
                        />
                    </div>
                </div>
            ) : (
                /* Dashboard layout */
                <div className={styles.dashboardGrid}>
                    {/* Main left content */}
                    <div className={styles.mainColumn}>
                        {/* Overall Accumulated Card */}
                        <section
                            id="tour-goals-overall"
                            className={`${styles.accumulatedCard} ${styles.animateItem} glass-card`}
                        >
                            <div className={styles.accLeft}>
                                <span className={styles.accLabel}>
                                    TOTAL ACCUMULATED
                                </span>
                                <h2 className={styles.accValue}>
                                    <span className={styles.currencySymbol}>
                                        {currency}
                                    </span>{" "}
                                    {totalAccumulated.toLocaleString()}
                                </h2>
                                <p className={styles.accTarget}>
                                    of {currency} {totalTarget.toLocaleString()}{" "}
                                    target{" "}
                                    <span className={styles.accBadge}>
                                        {overallProgress}%
                                    </span>
                                </p>
                            </div>
                            <div className={styles.accRight}>
                                <div className={styles.progressHeader}>
                                    <span>Current</span>
                                    <span>Target</span>
                                </div>
                                <div className={styles.accProgressBar}>
                                    <div
                                        className={styles.progressFill}
                                        data-width={`${overallProgress}%`}
                                        style={{ width: 0 }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Staggered Goals Cards List */}
                        <div id="tour-goals-list" className={styles.goalsList}>
                            {goals.length === 0 ? (
                                <div
                                    className={`${styles.emptyState} ${styles.animateItem} glass-card`}
                                >
                                    <FiAlertCircle
                                        size={48}
                                        className={styles.emptyIcon}
                                    />
                                    <h2>No Goals Set</h2>
                                    <p>
                                        Start your financial journey by defining
                                        your first savings milestones.
                                    </p>
                                    <MainButton
                                        action="primary"
                                        size="md"
                                        title="Create First Goal"
                                        clickEvent={() => setActiveModal("add")}
                                    >
                                        Create First Goal
                                    </MainButton>
                                </div>
                            ) : (
                                goals.map((g) => (
                                    <article
                                        key={g.id}
                                        className={`${styles.goalCard} ${styles.animateItem} glass-card`}
                                        style={{
                                            opacity: g.is_paused ? 0.65 : 1,
                                        }}
                                    >
                                        {/* Card Top */}
                                        <div className={styles.cardHeader}>
                                            <div
                                                className={styles.cardIconWrap}
                                                style={{
                                                    background: `${g.color}15`,
                                                    color: g.color,
                                                }}
                                            >
                                                <DynamicIcon name={g.icon} />
                                            </div>
                                            <div
                                                className={styles.cardTitleWrap}
                                            >
                                                <h3 className={styles.goalName}>
                                                    {g.name}
                                                </h3>
                                                <span
                                                    className={styles.dueDate}
                                                >
                                                    {g.deadline
                                                        ? `Due ${new Date(
                                                              g.deadline,
                                                          ).toLocaleDateString(
                                                              "en-US",
                                                              {
                                                                  month: "short",
                                                                  year: "numeric",
                                                              },
                                                          )}`
                                                        : "No target date"}
                                                </span>
                                                <span
                                                    className={
                                                        styles.cardAccountName
                                                    }
                                                >
                                                    <FiCreditCard
                                                        size={12}
                                                        style={{
                                                            marginRight: "3px",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    />
                                                    {accounts.find(
                                                        (a) =>
                                                            a.id ===
                                                            g.linked_account_id,
                                                    )?.name ||
                                                        defaultAccount?.name ||
                                                        "Main Account"}
                                                </span>
                                            </div>

                                            {/* Action Ellipsis Menu */}
                                            <div
                                                className={
                                                    styles.actionMenuWrap
                                                }
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <button
                                                    className={
                                                        styles.menuTrigger
                                                    }
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            openMenuId === g.id
                                                                ? null
                                                                : g.id,
                                                        )
                                                    }
                                                    aria-label="Toggle actions"
                                                >
                                                    <FiMoreVertical size={18} />
                                                </button>
                                                {openMenuId === g.id && (
                                                    <div
                                                        className={
                                                            styles.actionMenu
                                                        }
                                                    >
                                                        <button
                                                            className={
                                                                styles.menuItem
                                                            }
                                                            onClick={() => {
                                                                setActiveDetailsGoal(
                                                                    g,
                                                                );
                                                                setOpenMenuId(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            <FiInfo size={14} />{" "}
                                                            Info Details
                                                        </button>
                                                        <button
                                                            className={
                                                                styles.menuItem
                                                            }
                                                            onClick={() => {
                                                                handleEditGoalClick(
                                                                    g,
                                                                );
                                                                setOpenMenuId(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            <FiEdit2
                                                                size={14}
                                                            />{" "}
                                                            Edit Goal
                                                        </button>
                                                        <button
                                                            className={
                                                                styles.menuItem
                                                            }
                                                            style={{
                                                                color: "var(--color-danger)",
                                                            }}
                                                            onClick={() => {
                                                                handleDeleteGoalClick(
                                                                    g,
                                                                );
                                                                setOpenMenuId(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            <FiTrash2
                                                                size={14}
                                                            />{" "}
                                                            Delete Goal
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Progress Math */}
                                        <div className={styles.cardMath}>
                                            <p
                                                className={
                                                    styles.cardCurrentAmt
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.currencySmall
                                                    }
                                                >
                                                    {currency}
                                                </span>{" "}
                                                {Number(
                                                    g.current_amount || 0,
                                                ).toLocaleString()}
                                            </p>
                                            <p className={styles.cardTargetAmt}>
                                                Target: {currency}{" "}
                                                {Number(
                                                    g.target_amount || 0,
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className={styles.cardProgress}>
                                            <div
                                                className={
                                                    styles.accProgressBar
                                                }
                                                style={{ height: 8 }}
                                            >
                                                <div
                                                    className={
                                                        styles.progressFill
                                                    }
                                                    data-width={`${g.pct}%`}
                                                    style={{
                                                        width: 0,
                                                        background: g.color,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Card Footer info */}
                                        <div className={styles.cardFooter}>
                                            <span className={styles.footerRate}>
                                                {g.is_completed
                                                    ? "Goal Fully Funded!"
                                                    : g.monthlySaving > 0
                                                      ? `Saved ${currency} ${Number(g.monthlySaving).toLocaleString()}/mo`
                                                      : "No contributions this month"}
                                            </span>
                                            <span
                                                className={styles.statusTag}
                                                data-status={g.status}
                                            >
                                                {g.is_completed
                                                    ? "Completed"
                                                    : g.status}
                                            </span>
                                        </div>

                                        {/* Add contribution large action button */}
                                        {!g.is_completed && !g.is_paused && (
                                            <div
                                                className={styles.cardActionRow}
                                            >
                                                <MainButton
                                                    action="outline"
                                                    size="sm"
                                                    title="Add Contribution"
                                                    className={
                                                        styles.addContribButton
                                                    }
                                                    clickEvent={() =>
                                                        handleAddContribClick(g)
                                                    }
                                                >
                                                    Add Contribution
                                                </MainButton>
                                            </div>
                                        )}
                                    </article>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right side widgets column */}
                    <aside className={styles.sidebarColumn}>
                        {/* Smart Suggestions Card */}
                        <section
                            id="tour-goals-suggestions"
                            className={`${styles.widgetCard} ${styles.animateItem} glass-card`}
                        >
                            <header className={styles.widgetHeader}>
                                <span
                                    className={styles.widgetIcon}
                                    style={{
                                        background: "var(--color-warning-bg)",
                                        color: "var(--color-warning)",
                                    }}
                                >
                                    <FiCompass size={18} />
                                </span>
                                <h2 className={styles.widgetTitle}>
                                    Smart Suggestions
                                </h2>
                            </header>
                            <div className={styles.widgetContent}>
                                {smartSuggestions.map((s) => (
                                    <div
                                        key={s.id}
                                        className={styles.suggestItem}
                                    >
                                        <p className={styles.suggestText}>
                                            {s.text}
                                        </p>
                                        <button
                                            className={styles.suggestAction}
                                        >
                                            {s.actionLabel}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Milestones Card */}
                        <section
                            id="tour-goals-milestones"
                            className={`${styles.widgetCard} ${styles.animateItem} glass-card`}
                        >
                            <header className={styles.widgetHeader}>
                                <span
                                    className={styles.widgetIcon}
                                    style={{
                                        background: "var(--color-success-bg)",
                                        color: "var(--color-success)",
                                    }}
                                >
                                    <FiAward size={18} />
                                </span>
                                <h2 className={styles.widgetTitle}>
                                    Recent Milestones
                                </h2>
                            </header>
                            <div className={styles.widgetContent}>
                                {milestones.length === 0 ? (
                                    <p className={styles.noMilestones}>
                                        No completed milestones yet. Fund goals
                                        to unlock achievements!
                                    </p>
                                ) : (
                                    milestones.map((m) => (
                                        <div
                                            key={m.id}
                                            className={styles.milestoneItem}
                                        >
                                            <span
                                                className={styles.mIcon}
                                                style={{
                                                    background: `${m.color}15`,
                                                    color: m.color,
                                                }}
                                            >
                                                <DynamicIcon name={m.icon} />
                                            </span>
                                            <div>
                                                <p className={styles.mName}>
                                                    {m.name} Fully Funded!
                                                </p>
                                                <p className={styles.mTime}>
                                                    Completed {m.completedAtStr}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            )}

            {/* ── Sub-Modals Mounts ──────────────────────────────── */}

            {/* Add Goal Modal */}
            {activeModal === "add" && (
                <AddGoalModal
                    type="add"
                    userId={userId}
                    accounts={accounts}
                    onClose={() => setActiveModal(null)}
                    onSuccess={() => {}} // new goals have 0 contributions, no need to load
                />
            )}

            {/* Edit Goal Modal */}
            {activeModal === "edit" && (
                <AddGoalModal
                    type="edit"
                    goalToEdit={selectedGoal}
                    userId={userId}
                    accounts={accounts}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {/* Add Contribution Modal */}
            {activeModal === "contrib" && (
                <AddContributionModal
                    goal={selectedGoal}
                    userId={userId}
                    accounts={accounts}
                    defaultAccount={defaultAccount}
                    categories={activeExpenseCategories}
                    budgetByCategory={budgetByCategory}
                    spentByCategory={spentByCategory}
                    profile={profile}
                    currency={currency}
                    onClose={() => setActiveModal(null)}
                    onSuccess={() => {
                        dispatch(loadContributions(selectedGoal.id));
                    }}
                />
            )}

            {/* Delete Goal Options Modal */}
            {activeModal === "delete" && (
                <DeleteGoalModal
                    goal={selectedGoal}
                    contributions={contributions[selectedGoal.id] || []}
                    userId={userId}
                    defaultAccount={defaultAccount}
                    budgetByCategory={budgetByCategory}
                    currency={currency}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {/* Goal Details RTL Slide-in Panel */}
            {activeDetailsGoal && (
                <GoalDetailsPanel
                    goal={activeDetailsGoal}
                    contributions={contributions[activeDetailsGoal.id] || []}
                    userId={userId}
                    accounts={accounts}
                    defaultAccount={defaultAccount}
                    budgetByCategory={budgetByCategory}
                    spentByCategory={spentByCategory}
                    currency={currency}
                    onClose={() => setActiveDetailsGoal(null)}
                    onAddContribution={(g) => {
                        setActiveDetailsGoal(null);
                        handleAddContribClick(g);
                    }}
                    onRefresh={() =>
                        dispatch(loadContributions(activeDetailsGoal.id))
                    }
                />
            )}
        </div>
    );
}

export default GoalsPage;
