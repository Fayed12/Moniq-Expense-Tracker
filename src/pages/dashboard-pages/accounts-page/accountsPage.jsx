// local
import styles from "./accountsPage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import AccountModal from "./AccountModal";
import TransferSection from "./TransferSection";
import { useAccountsPageData } from "../../../hooks/useAccountsPageData";
import { useSweetAlert } from "../../../hooks/useSweetAlert";

// react
import { useState, useEffect, useRef, useCallback } from "react";

// redux
import { useDispatch } from "react-redux";
import {
    loadAllAccounts,
    doArchiveAccount,
    editAccount,
    removeAccount,
} from "../../../redux/accountsSlice";

// gsap
import gsap from "gsap";

// react-icons
import {
    FiPlus,
    FiArrowDownLeft,
    FiArrowUpRight,
    FiArchive,
    FiEdit2,
    FiTrash2,
    FiStar,
    FiRotateCcw,
} from "react-icons/fi";
import {
    FaWallet,
    FaUniversity,
    FaCreditCard,
    FaMoneyBillWave,
    FaChartLine,
    FaPiggyBank,
    FaCoins,
    FaLandmark,
    FaBriefcase,
    FaGem,
    FaShieldAlt,
    FaStar,
    FaEllipsisH,
} from "react-icons/fa";

// ── Icon map for dynamic rendering ──────────────────────────
const ICON_MAP = {
    FaWallet,
    FaUniversity,
    FaCreditCard,
    FaMoneyBillWave,
    FaChartLine,
    FaPiggyBank,
    FaCoins,
    FaLandmark,
    FaBriefcase,
    FaGem,
    FaShieldAlt,
    FaStar,
    FaEllipsisH,
};

// ── Helper: render icon from string key ─────────────────────
function DynamicIcon({ name, size = 20, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

// ── Helper: format currency ─────────────────────────────────
function formatFullAmount(value, currency = "EGP") {
    const num = Number(value) || 0;
    return `${currency} ${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

// ════════════════════════════════════════════════════════════
// ACCOUNTS PAGE COMPONENT
// ════════════════════════════════════════════════════════════
function AccountsPage() {
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const animRan = useRef(false);

    // ── Page data ───────────────────────────────────────────
    const {
        accounts,
        archivedAccounts,
        currency,
        isLoading,
        userId,
        transferCategory,
    } = useAccountsPageData();

    const { confirmDelete, confirmArchive, confirmSetDefault } =
        useSweetAlert();

    // ── Local state ─────────────────────────────────────────
    const [showArchived, setShowArchived] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedAccount, setSelectedAccount] = useState(null);

    // ── Load all accounts (active + archived) on mount ──────
    useEffect(() => {
        if (userId) {
            dispatch(loadAllAccounts(userId));
        }
    }, [userId, dispatch]);

    // ── GSAP Page entrance animation — runs once ────────────
    useEffect(() => {
        if (!containerRef.current || animRan.current || isLoading) return;
        animRan.current = true;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out", duration: 0.6 },
            });

            // Header slides in from top
            tl.from("[data-anim='header']", {
                y: -30,
                opacity: 0,
            });

            // Account cards stagger up with bounce
            tl.from(
                "[data-anim='account-card']",
                {
                    y: 50,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: "back.out(1.4)",
                },
                "-=0.3",
            );

            // Transfer section fades up
            tl.from(
                "[data-anim='transfer']",
                {
                    y: 40,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.out(1.2)",
                },
                "-=0.2",
            );
        }, containerRef);

        return () => ctx.revert();
    }, [isLoading]);

    // ── Modal handlers ──────────────────────────────────────
    const openAddModal = useCallback(() => {
        setModalMode("add");
        setSelectedAccount(null);
        setModalOpen(true);
    }, []);

    const openEditModal = useCallback((account) => {
        setModalMode("edit");
        setSelectedAccount(account);
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setSelectedAccount(null);
    }, []);

    // ── Action handlers ─────────────────────────────────────
    const handleArchive = useCallback(
        async (account) => {
            const confirmed = await confirmArchive(account.name);
            if (!confirmed) return;

            try {
                await dispatch(doArchiveAccount(account.id)).unwrap();
            } catch (err) {
                console.error("Archive failed:", err);
            }
        },
        [dispatch, confirmArchive],
    );

    const handleDelete = useCallback(
        async (account) => {
            const confirmed = await confirmDelete(account.name);
            if (!confirmed) return;

            try {
                await dispatch(removeAccount(account.id)).unwrap();
                await dispatch(loadAllAccounts(userId)).unwrap();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        },
        [dispatch, confirmDelete, userId],
    );

    const handleSetDefault = useCallback(
        async (account) => {
            const confirmed = await confirmSetDefault(account.name);
            if (!confirmed) return;

            try {
                // Unset previous default
                const currentDefault = accounts.find((a) => a.is_default);
                if (currentDefault && currentDefault.id !== account.id) {
                    await dispatch(
                        editAccount({
                            id: currentDefault.id,
                            changes: { is_default: false },
                        }),
                    ).unwrap();
                }
                // Set new default
                await dispatch(
                    editAccount({
                        id: account.id,
                        changes: { is_default: true },
                    }),
                ).unwrap();
            } catch (err) {
                console.error("Set default failed:", err);
            }
        },
        [dispatch, accounts, confirmSetDefault],
    );

    const handleRestore = useCallback(
        async (id) => {
            try {
                await dispatch(
                    editAccount({
                        id,
                        changes: { is_archived: false },
                    }),
                ).unwrap();
            } catch (err) {
                console.error("Restore failed:", err);
            }
        },
        [dispatch],
    );

    // ── Current accounts to display ─────────────────────────
    const displayAccounts = showArchived ? archivedAccounts : accounts;

    return (
        <main
            className={styles.container}
            ref={containerRef}
            aria-label="Accounts page"
        >
            {/* ═══ PAGE HEADER ═══ */}
            <header className={styles.pageHeader} data-anim="header">
                <h1 className={styles.pageTitle} id="accounts-page-title">
                    Accounts
                </h1>

                <div className={styles.headerActions}>
                    {/* Active / Archived Toggle */}
                    <div
                        className={styles.viewToggle}
                        role="tablist"
                        aria-label="Account view toggle"
                    >
                        <button
                            className={styles.toggleBtn}
                            data-active={!showArchived ? "true" : undefined}
                            onClick={() => setShowArchived(false)}
                            role="tab"
                            aria-selected={!showArchived}
                            id="accounts-tab-active"
                        >
                            Active
                        </button>
                        <button
                            className={styles.toggleBtn}
                            data-active={showArchived ? "true" : undefined}
                            onClick={() => setShowArchived(true)}
                            role="tab"
                            aria-selected={showArchived}
                            id="accounts-tab-archived"
                        >
                            Archived
                        </button>
                    </div>

                    {/* Add Account Button */}
                    {!showArchived && (
                        <MainButton
                            action="primary"
                            size="md"
                            title="Add new account"
                            clickEvent={openAddModal}
                            className={styles.addBtn}
                        >
                            <FiPlus size={16} />
                            Add Account
                        </MainButton>
                    )}
                </div>
            </header>

            {/* ═══ ACCOUNTS GRID ═══ */}
            <section
                className={styles.accountsGrid}
                aria-label={
                    showArchived ? "Archived accounts" : "Active accounts"
                }
            >
                {displayAccounts?.length > 0 ? (
                    displayAccounts?.map((account) => (
                        <article
                            key={account?.id}
                            className={`${styles.accountCard} ${showArchived ? styles.archivedCard : ""}`}
                            data-anim="account-card"
                            aria-label={`${account?.name} account: ${formatFullAmount(account?.balance, currency)}`}
                            id={`account-card-${account?.id}`}
                        >
                            {/* ── Card Top: Icon + Info + Badges ── */}
                            <div className={styles.cardTop}>
                                <span
                                    className={styles.accountIcon}
                                    style={{
                                        background: `${account?.color || "var(--color-primary)"}18`,
                                        color:
                                            account?.color ||
                                            "var(--color-primary)",
                                    }}
                                    aria-hidden="true"
                                >
                                    <DynamicIcon
                                        name={account?.icon}
                                        size={20}
                                    />
                                </span>

                                <div className={styles.accountInfo}>
                                    <h3 className={styles.accountName}>
                                        {account?.name}
                                    </h3>
                                    <span className={styles.accountType}>
                                        {account?.type}
                                    </span>
                                </div>

                                <div className={styles.badgesWrap}>
                                    {account?.is_default && (
                                        <span
                                            className={styles.defaultBadge}
                                            aria-label="Default account"
                                        >
                                            <FiStar size={10} />
                                            Default
                                        </span>
                                    )}
                                    {showArchived && (
                                        <span
                                            className={styles.archivedBadge}
                                            aria-label="Archived"
                                        >
                                            <FiArchive size={10} />
                                            Archived
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ── Balance ── */}
                            <div className={styles.balanceSection}>
                                <p className={styles.balanceValue}>
                                    {formatFullAmount(
                                        account?.balance,
                                        account?.currency || currency,
                                    )}
                                </p>
                            </div>

                            {/* ── Footer: Transactions + Arrows ── */}
                            <div className={styles.cardFooter}>
                                <span className={styles.txCount}>
                                    {account?.transaction_count || 0}{" "}
                                    {(account?.transaction_count || 0) === 1
                                        ? "Transaction"
                                        : "Transactions"}{" "}
                                    this month
                                </span>
                                <div className={styles.arrowsWrap}>
                                    {(Number(account?.total_income) > 0 ||
                                        !showArchived) && (
                                        <span
                                            className={styles.arrowIncome}
                                            aria-label="Has income"
                                            title={`Income: ${formatFullAmount(account?.total_income, account?.currency || currency)}`}
                                        >
                                            <FiArrowDownLeft />
                                        </span>
                                    )}
                                    {(Number(account?.total_expenses) > 0 ||
                                        !showArchived) && (
                                        <span
                                            className={styles.arrowExpense}
                                            aria-label="Has expenses"
                                            title={`Expenses: ${formatFullAmount(account?.total_expenses, account?.currency || currency)}`}
                                        >
                                            <FiArrowUpRight />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ── Card Action Buttons ── */}
                            <div className={styles.cardActions}>
                                {showArchived ? (
                                    <>
                                        {/* Archived: Restore + Delete */}
                                        <button
                                            className={styles.restoreBtn}
                                            onClick={() =>
                                                handleRestore(account?.id)
                                            }
                                            aria-label={`Restore ${account?.name}`}
                                            title="Restore account"
                                            type="button"
                                        >
                                            <FiRotateCcw />
                                            <span>Restore</span>
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() =>
                                                handleDelete(account)
                                            }
                                            aria-label={`Delete ${account?.name}`}
                                            title="Delete permanently"
                                            type="button"
                                        >
                                            <FiTrash2 />
                                            <span>Delete</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Active: Edit + Archive + Default + Delete */}
                                        <button
                                            className={styles.editBtn}
                                            onClick={() =>
                                                openEditModal(account)
                                            }
                                            aria-label={`Edit ${account?.name}`}
                                            title="Edit account"
                                            type="button"
                                        >
                                            <FiEdit2 />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className={styles.archiveBtn}
                                            onClick={() =>
                                                handleArchive(account)
                                            }
                                            aria-label={`Archive ${account?.name}`}
                                            title="Archive account"
                                            type="button"
                                        >
                                            <FiArchive />
                                            <span>Archive</span>
                                        </button>
                                        <button
                                            className={styles.defaultBtn}
                                            onClick={() =>
                                                handleSetDefault(account)
                                            }
                                            data-current={
                                                account?.is_default
                                                    ? "true"
                                                    : undefined
                                            }
                                            aria-label={
                                                account?.is_default
                                                    ? "Already default account"
                                                    : `Set ${account?.name} as default`
                                            }
                                            title={
                                                account?.is_default
                                                    ? "Current default"
                                                    : "Set as default"
                                            }
                                            type="button"
                                        >
                                            <FiStar />
                                            <span>
                                                {account?.is_default
                                                    ? "Default"
                                                    : "Set Default"}
                                            </span>
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() =>
                                                handleDelete(account)
                                            }
                                            aria-label={`Delete ${account?.name}`}
                                            title="Delete permanently"
                                            type="button"
                                        >
                                            <FiTrash2 />
                                            <span>Delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </article>
                    ))
                ) : (
                    /* ── Empty State ── */
                    <div
                        className={styles.emptyState}
                        role="status"
                        aria-label={
                            showArchived
                                ? "No archived accounts"
                                : "No accounts yet"
                        }
                    >
                        <FiArchive
                            className={styles.emptyIcon}
                            aria-hidden="true"
                        />
                        <p className={styles.emptyText}>
                            {showArchived
                                ? "No archived accounts"
                                : "No accounts yet. Add your first account!"}
                        </p>
                    </div>
                )}
            </section>

            {/* ═══ TRANSFER SECTION (only in active view) ═══ */}
            {!showArchived && (
                <TransferSection
                    accounts={accounts}
                    userId={userId}
                    currency={currency}
                    transferCategory={transferCategory}
                />
            )}

            {/* ═══ ACCOUNT MODAL (shared add/edit) ═══ */}
            {modalOpen && (
                <AccountModal
                    mode={modalMode}
                    account={selectedAccount}
                    onClose={closeModal}
                />
            )}
        </main>
    );
}

export default AccountsPage;
