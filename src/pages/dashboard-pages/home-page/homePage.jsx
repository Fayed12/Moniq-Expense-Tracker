// local
import styles from "./homePage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import CashFlowChart from "../../../components/charts/CashFlowChart";
import BudgetHealthChart from "../../../components/charts/BudgetHealthChart";
import { useHomePageData } from "../../../hooks/useHomePageData";

// react
import { useState, useEffect, useRef, useCallback } from "react";

// react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// gsap
import gsap from "gsap";

// react-icons
import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiArrowUpRight,
    FiArrowDownRight,
    FiTarget,
    FiCalendar,
    FiPlus,
    FiInbox,
    FiPieChart,
} from "react-icons/fi";
import {
    FaWallet,
    FaShoppingBag,
    FaUtensils,
    FaCar,
    FaHome,
    FaHeartbeat,
    FaFilm,
    FaBook,
    FaPlane,
    FaBolt,
    FaSpa,
    FaGift,
    FaBriefcase,
    FaLaptopCode,
    FaChartLine,
    FaPlusCircle,
    FaUniversity,
    FaMoneyBillWave,
    FaCreditCard,
    FaFlag,
    FaShieldAlt,
    FaLaptop,
    FaEllipsisH,
} from "react-icons/fa";

// ── Icon map for dynamic rendering ──────────────────────────
const ICON_MAP = {
    FaWallet: FaWallet,
    FaShoppingBag: FaShoppingBag,
    FaUtensils: FaUtensils,
    FaCar: FaCar,
    FaHome: FaHome,
    FaHeartbeat: FaHeartbeat,
    FaFilm: FaFilm,
    FaBook: FaBook,
    FaPlane: FaPlane,
    FaBolt: FaBolt,
    FaSpa: FaSpa,
    FaGift: FaGift,
    FaBriefcase: FaBriefcase,
    FaLaptopCode: FaLaptopCode,
    FaChartLine: FaChartLine,
    FaPlusCircle: FaPlusCircle,
    FaUniversity: FaUniversity,
    FaMoneyBillWave: FaMoneyBillWave,
    FaCreditCard: FaCreditCard,
    FaFlag: FaFlag,
    FaShieldAlt: FaShieldAlt,
    FaLaptop: FaLaptop,
    FaEllipsisH: FaEllipsisH,
};

// ── Helper: render icon from string key ─────────────────────
function DynamicIcon({ name, size = 16, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

// ── Helper: format currency ─────────────────────────────────
function formatAmount(value, currency = "EGP") {
    const num = Number(value) || 0;
    if (num >= 1000000) {
        return `${currency} ${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${currency} ${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    }
    return `${currency} ${num.toLocaleString()}`;
}

function formatFullAmount(value, currency = "EGP") {
    const num = Number(value) || 0;
    return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ── Helper: relative date ───────────────────────────────────
function relativeDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays === 1) {
        return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString([], {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ================================================================
// HOME PAGE COMPONENT
// ================================================================
export default function HomePage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const containerRef = useRef(null);

    const {
        totalBalance,
        totalIncome,
        incomeSources,
        totalExpenses,
        expenseCount,
        totalSavings,
        activeGoalsCount,
        balanceChangePercent,
        cashFlowData,
        budgetUsedPercent,
        budgetRemaining,
        recentTransactions,
        topCategories,
        activeGoals,
        userName,
        currency,
        monthLabel,
        isLoading,
    } = useHomePageData(selectedMonth);

    // ── Month picker handler ────────────────────────────────
    const handleMonthChange = useCallback((date) => {
        if (date) setSelectedMonth(date);
    }, []);

    // ── GSAP Page entrance animation ────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Welcome header slides in from top
            tl.from("[data-anim='welcome']", {
                y: -30,
                opacity: 0,
                duration: 0.6,
            });

            // Overview cards stagger up
            tl.from(
                "[data-anim='overview-card']",
                {
                    y: 50,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "back.out(1.4)",
                },
                "-=0.3",
            );

            // Charts row
            tl.from(
                "[data-anim='charts-row']",
                {
                    y: 40,
                    opacity: 0,
                    duration: 0.6,
                },
                "-=0.2",
            );

            // Middle row stagger
            tl.from(
                "[data-anim='middle-card']",
                {
                    y: 35,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.15,
                    ease: "back.out(1.2)",
                },
                "-=0.3",
            );

            // Footer goals
            tl.from(
                "[data-anim='goals-section']",
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.out(1.2)",
                },
                "-=0.2",
            );

            // Goal cards stagger
            tl.from(
                "[data-anim='goal-card']",
                {
                    scale: 0.85,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "back.out(1.7)",
                },
                "-=0.1",
            );
        }, containerRef);

        return () => ctx.revert();
    }, [isLoading]);

    // ── First name extraction ───────────────────────────────
    const firstName = userName?.split(" ")[0] || "User";

    return (
        <div
            className={styles.container}
            ref={containerRef}
            role="main"
            aria-label="Dashboard homepage"
        >
            {/* ═══ WELCOME HEADER ═══ */}
            <header className={styles.welcomeSection} data-anim="welcome">
                <div className={styles.welcomeText}>
                    <h1 id="home-welcome-heading">Welcome back, {firstName}</h1>
                    <p>Here is your financial overview for {monthLabel}.</p>
                </div>

                <div className={styles.monthPicker}>
                    <DatePicker
                        selected={selectedMonth}
                        onChange={handleMonthChange}
                        dateFormat="MMM yyyy"
                        showMonthYearPicker
                        showPopperArrow={false}
                        customInput={
                            <button
                                className={styles.monthPickerBtn}
                                aria-label={`Select month, currently ${monthLabel}`}
                                id="home-month-picker"
                                type="button"
                            >
                                <FiCalendar size={16} />
                                <span>{monthLabel}</span>
                            </button>
                        }
                    />
                </div>
            </header>

            {/* ═══ OVERVIEW CARDS ═══ */}
            <section
                className={styles.overviewGrid}
                aria-label="Financial overview cards"
            >
                {/* Total Balance */}
                <article
                    className={styles.overviewCardPrimary}
                    data-anim="overview-card"
                    aria-label={`Total balance: ${formatFullAmount(totalBalance, currency)}`}
                    id="home-card-balance"
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Total Balance</span>
                        <span className={styles.cardIconWrap}>
                            <FaWallet size={16} />
                        </span>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.cardValue}>
                            {formatFullAmount(totalBalance, currency)}
                        </p>
                        <div className={styles.cardSub}>
                            {balanceChangePercent !== null && (
                                <span
                                    className={
                                        Number(balanceChangePercent) >= 0
                                            ? styles.trendUpPrimary
                                            : styles.trendDownPrimary
                                    }
                                >
                                    {Number(balanceChangePercent) >= 0 ? (
                                        <FiTrendingUp size={12} />
                                    ) : (
                                        <FiTrendingDown size={12} />
                                    )}
                                    {balanceChangePercent > 0 ? "+" : ""}
                                    {balanceChangePercent}%
                                </span>
                            )}
                            <span>vs last month</span>
                        </div>
                    </div>
                </article>

                {/* Income */}
                <article
                    className={styles.overviewCard}
                    data-anim="overview-card"
                    aria-label={`Income: ${formatFullAmount(totalIncome, currency)}`}
                    id="home-card-income"
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Income</span>
                        <span className={styles.cardIconWrap}>
                            <FiArrowUpRight size={16} />
                        </span>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.cardValue}>
                            {formatFullAmount(totalIncome, currency)}
                        </p>
                        <div className={styles.cardSub}>
                            {incomeSources}{" "}
                            {incomeSources === 1 ? "source" : "sources"}
                        </div>
                    </div>
                </article>

                {/* Expenses */}
                <article
                    className={styles.overviewCard}
                    data-anim="overview-card"
                    aria-label={`Expenses: ${formatFullAmount(totalExpenses, currency)}`}
                    id="home-card-expenses"
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Expenses</span>
                        <span className={styles.cardIconWrap}>
                            <FiArrowDownRight size={16} />
                        </span>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.cardValue}>
                            {formatFullAmount(totalExpenses, currency)}
                        </p>
                        <div className={styles.cardSub}>
                            {expenseCount}{" "}
                            {expenseCount === 1
                                ? "transaction"
                                : "transactions"}
                        </div>
                    </div>
                </article>

                {/* Savings */}
                <article
                    className={styles.overviewCard}
                    data-anim="overview-card"
                    aria-label={`Savings: ${formatFullAmount(totalSavings, currency)}`}
                    id="home-card-savings"
                >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardLabel}>Savings</span>
                        <span className={styles.cardIconWrap}>
                            <FiTarget size={16} />
                        </span>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.cardValue}>
                            {formatFullAmount(totalSavings, currency)}
                        </p>
                        <div className={styles.cardSub}>
                            {activeGoalsCount}{" "}
                            {activeGoalsCount === 1
                                ? "goal active"
                                : "goals active"}
                        </div>
                    </div>
                </article>
            </section>

            {/* ═══ CHARTS ROW ═══ */}
            <section
                className={styles.chartsRow}
                aria-label="Financial charts"
                data-anim="charts-row"
            >
                <CashFlowChart data={cashFlowData} currency={currency} />
                <BudgetHealthChart
                    usedPercent={budgetUsedPercent}
                    remaining={budgetRemaining}
                    currency={currency}
                />
            </section>

            {/* ═══ MIDDLE ROW ═══ */}
            <section
                className={styles.middleRow}
                aria-label="Transactions and categories"
            >
                {/* Recent Transactions */}
                <div className={styles.sectionCard} data-anim="middle-card">
                    <div className={styles.sectionHeader}>
                        <h2
                            className={styles.sectionTitle}
                            id="home-recent-tx-title"
                        >
                            Recent Transactions
                        </h2>
                        <MainButton
                            action="ghost"
                            size="sm"
                            className={styles.sectionAction}
                            title="View all transactions"
                            href="/dashboard/transactions"
                            id="home-view-all-tx"
                        >
                            View All
                        </MainButton>
                    </div>

                    {recentTransactions.length > 0 ? (
                        <ul
                            className={styles.txList}
                            aria-labelledby="home-recent-tx-title"
                            role="list"
                        >
                            {recentTransactions.map((tx) => (
                                <li
                                    key={tx.id}
                                    className={styles.txItem}
                                    role="listitem"
                                >
                                    <span
                                        className={styles.txIcon}
                                        style={{
                                            background: tx.category_color
                                                ? `${tx.category_color}18`
                                                : "var(--color-primary-light)",
                                            color:
                                                tx.category_color ||
                                                "var(--color-primary)",
                                        }}
                                        aria-hidden="true"
                                    >
                                        <DynamicIcon
                                            name={tx.category_icon}
                                            size={16}
                                        />
                                    </span>
                                    <div className={styles.txInfo}>
                                        <p className={styles.txTitle}>
                                            {tx.title}
                                        </p>
                                        <p className={styles.txDate}>
                                            {relativeDate(tx.date)}
                                        </p>
                                    </div>
                                    <div className={styles.txAmountWrap}>
                                        <p
                                            className={
                                                tx.type === "income"
                                                    ? styles.txAmountIncome
                                                    : tx.type === "transfer"
                                                    ? styles.txAmountTransfer
                                                    : styles.txAmountExpense
                                            }
                                        >
                                            <span className={styles.txPrefix}>
                                                {tx.type === "income"
                                                    ? "+"
                                                    : "-"}
                                            </span>
                                            {formatFullAmount(
                                                tx.amount,
                                                currency,
                                            )}
                                        </p>
                                        <p className={styles.txCategory}>
                                            {tx.category_name ||
                                                "Uncategorized"}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div
                            className={styles.emptyState}
                            role="status"
                            aria-label="No recent transactions"
                        >
                            <FiInbox
                                className={styles.emptyIcon}
                                aria-hidden="true"
                            />
                            <p className={styles.emptyText}>
                                No transactions yet
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Categories */}
                <div className={styles.sectionCard} data-anim="middle-card">
                    <div className={styles.sectionHeader}>
                        <h2
                            className={styles.sectionTitle}
                            id="home-top-categories-title"
                        >
                            Top Categories
                        </h2>
                    </div>

                    {topCategories.length > 0 ? (
                        <div
                            className={styles.catList}
                            role="list"
                            aria-labelledby="home-top-categories-title"
                        >
                            {topCategories.map((cat) => (
                                <div
                                    key={cat.name}
                                    className={styles.catItem}
                                    role="listitem"
                                    aria-label={`${cat.name}: ${cat.percent}% of expenses`}
                                >
                                    <div className={styles.catInfo}>
                                        <span className={styles.catName}>
                                            {cat.name}
                                        </span>
                                        <span className={styles.catPercent}>
                                            {cat.percent}%
                                        </span>
                                    </div>
                                    <div
                                        className={styles.catBar}
                                        role="progressbar"
                                        aria-valuenow={cat.percent}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className={styles.catBarFill}
                                            style={{
                                                width: `${cat.percent}%`,
                                                background:
                                                    cat.color ||
                                                    "var(--chart-1)",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className={styles.emptyState}
                            role="status"
                            aria-label="No category data"
                        >
                            <FiPieChart
                                className={styles.emptyIcon}
                                aria-hidden="true"
                            />
                            <p className={styles.emptyText}>
                                No expense data this month
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ ACTIVE GOALS — Full Width Footer ═══ */}
            <section
                className={styles.goalsSection}
                data-anim="goals-section"
                aria-label="Active savings goals"
            >
                <div className={styles.sectionHeader}>
                    <h2
                        className={styles.sectionTitle}
                        id="home-active-goals-title"
                    >
                        Active Goals
                    </h2>
                    <MainButton
                        action="ghost"
                        size="sm"
                        className={styles.sectionAction}
                        title="Add new goal"
                        href="/dashboard/goals"
                        id="home-add-goal-btn"
                    >
                        <FiPlus size={14} />
                        Add Goal
                    </MainButton>
                </div>

                {activeGoals.length > 0 ? (
                    <div
                        className={styles.goalsGrid}
                        aria-labelledby="home-active-goals-title"
                    >
                        {activeGoals.map((goal) => {
                            const progress = goal.target_amount
                                ? Math.min(
                                    Math.round(
                                        (Number(goal.current_amount) /
                                              Number(goal.target_amount)) *
                                            100,
                                    ),
                                    100,
                                )
                                : 0;

                            return (
                                <article
                                    key={goal.id}
                                    className={styles.goalCard}
                                    data-anim="goal-card"
                                    aria-label={`${goal.name}: ${progress}% complete — ${formatFullAmount(goal.current_amount, currency)} of ${formatFullAmount(goal.target_amount, currency)}`}
                                    style={{
                                        "--goal-color":
                                            goal.color || "var(--chart-5)",
                                    }}
                                >
                                    {/* Goal color circle decoration */}
                                    <style>{`
                                        [data-goal-id="${goal.id}"]::before {
                                            background: ${goal.color || "var(--chart-5)"};
                                        }
                                    `}</style>

                                    <div className={styles.goalTop}>
                                        <span
                                            className={styles.goalIcon}
                                            style={{
                                                background: `${goal.color || "var(--chart-5)"}18`,
                                                color:
                                                    goal.color ||
                                                    "var(--chart-5)",
                                            }}
                                            aria-hidden="true"
                                        >
                                            <DynamicIcon
                                                name={goal.icon}
                                                size={16}
                                            />
                                        </span>
                                        <span className={styles.goalName}>
                                            {goal.name}
                                        </span>
                                    </div>

                                    <div className={styles.goalProgress}>
                                        <div
                                            className={styles.goalBar}
                                            role="progressbar"
                                            aria-valuenow={progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label={`${goal.name} progress`}
                                        >
                                            <div
                                                className={styles.goalBarFill}
                                                style={{
                                                    width: `${progress}%`,
                                                    background:
                                                        goal.color ||
                                                        "var(--chart-5)",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.goalAmounts}>
                                        <span className={styles.goalCurrent}>
                                            {formatAmount(
                                                goal.current_amount,
                                                currency,
                                            )}
                                        </span>
                                        <span className={styles.goalTarget}>
                                            of{" "}
                                            {formatAmount(
                                                goal.target_amount,
                                                currency,
                                            )}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        className={styles.emptyState}
                        role="status"
                        aria-label="No active goals"
                    >
                        <FiTarget
                            className={styles.emptyIcon}
                            aria-hidden="true"
                        />
                        <p className={styles.emptyText}>
                            No active goals yet. Start saving!
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
