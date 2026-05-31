import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";

// Material UI
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";

// React icons
import {
    FiEdit2,
    FiTrash2,
    FiCalendar,
    FiDollarSign,
    FiFileText,
    FiAlertTriangle,
} from "react-icons/fi";

// local / redux
import styles from "./ContributionsTable.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { editGoal } from "../../../redux/goalsSlice";
import {
    editTransaction,
    removeTransaction,
} from "../../../redux/transactionsSlice";
import { editAccount, loadAccounts } from "../../../redux/accountsSlice";
import { editBudget } from "../../../redux/budgetsSlice";
import { supabase } from "../../../config/supabase";
import { useSweetAlert } from "../../../hooks/useSweetAlert";

export default function ContributionsTable({
    goal,
    contributions = [],
    userId,
    accounts = [],
    defaultAccount,
    budgetByCategory = {},
    currency = "EGP",
    onRefresh,
}) {
    const dispatch = useDispatch();
    const { confirm } = useSweetAlert();

    // ── Dialog States ───────────────────────────────────────
    const [editItem, setEditItem] = useState(null);
    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editNote, setEditNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Sort contributions by date descending
    const sortedContributions = useMemo(() => {
        return [...contributions].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
        );
    }, [contributions]);

    // Active Account object
    const activeAccount = useMemo(() => {
        const accId = goal.linked_account_id || defaultAccount?.id;
        return accounts.find((a) => a.id === accId) || defaultAccount || null;
    }, [accounts, goal.linked_account_id, defaultAccount]);

    // Open Edit Dialog
    const handleOpenEdit = (c) => {
        setEditItem(c);
        setEditAmount(String(c.amount));
        setEditDate(new Date(c.date).toISOString().slice(0, 10));
        setEditNote(c.note || "");
        setErrorMsg("");
    };

    // Close Edit Dialog
    const handleCloseEdit = () => {
        setEditItem(null);
        setErrorMsg("");
    };

    // ── Handle Edit Contribution ────────────────────────────
    const handleSaveEdit = async () => {
        const newAmtVal = parseFloat(editAmount);
        const oldAmtVal = Number(editItem.amount);
        const diff = newAmtVal - oldAmtVal;

        if (!newAmtVal || newAmtVal <= 0) {
            setErrorMsg("Please enter a valid amount greater than 0.");
            return;
        }

        setIsSaving(true);
        setErrorMsg("");

        try {
            // CASE 1: ONLY NOTE OR DATE CHANGED
            if (diff === 0) {
                // Update Contribution note and date in DB
                const { error: cErr } = await supabase
                    .from("goal_contributions")
                    .update({
                        note: editNote.trim() || null,
                        date: new Date(editDate).toISOString(),
                        created_at: new Date().toISOString(), // update trigger
                    })
                    .eq("id", editItem.id);

                if (cErr) throw cErr;

                // Update related transaction note and date
                if (editItem.transaction_id) {
                    await dispatch(
                        editTransaction({
                            id: editItem.transaction_id,
                            changes: {
                                note: editNote.trim()
                                    ? `Savings contribution to goal '${goal.name}'. Note: ${editNote.trim()}`
                                    : `Savings contribution to goal '${goal.name}'.`,
                                date: new Date(editDate).toISOString(),
                            },
                        }),
                    ).unwrap();
                }
            } else {
                // CASE 2: AMOUNT CHANGED (REQUIRES RECALCULATING BALANCES, GOALS, BUDGETS)
                // Check if account has sufficient balance for positive difference
                if (
                    activeAccount &&
                    diff > 0 &&
                    Number(activeAccount.balance) < diff
                ) {
                    setErrorMsg(
                        `Insufficient balance in account! Remaining: ${currency} ${Number(activeAccount.balance).toLocaleString()}`,
                    );
                    setIsSaving(false);
                    return;
                }

                // Update Contribution
                const { error: cErr } = await supabase
                    .from("goal_contributions")
                    .update({
                        amount: newAmtVal,
                        note: editNote.trim() || null,
                        date: new Date(editDate).toISOString(),
                    })
                    .eq("id", editItem.id);

                if (cErr) throw cErr;

                // Update related Transaction amount
                if (editItem.transaction_id) {
                    await dispatch(
                        editTransaction({
                            id: editItem.transaction_id,
                            changes: {
                                amount: newAmtVal,
                                note: editNote.trim()
                                    ? `Savings contribution to goal '${goal.name}'. Note: ${editNote.trim()}`
                                    : `Savings contribution to goal '${goal.name}'.`,
                                date: new Date(editDate).toISOString(),
                            },
                        }),
                    ).unwrap();
                }

                // Update Account balance and expense stats
                if (activeAccount) {
                    const newBalance = Number(activeAccount.balance) - diff;
                    const newExpense = Math.max(
                        Number(activeAccount.total_expense || 0) + diff,
                        0,
                    );
                    await dispatch(
                        editAccount({
                            id: activeAccount.id,
                            changes: {
                                balance: newBalance,
                                total_expense: newExpense,
                            },
                        }),
                    ).unwrap();
                }

                // Update Category Budget spent if budget is linked
                const catId = editItem.category_id || goal.category_id;
                if (catId && budgetByCategory[catId]) {
                    const budget = budgetByCategory[catId];
                    const newSpent = Math.max(
                        Number(budget.spent || 0) + diff,
                        0,
                    );
                    const newRollover =
                        Number(budget.rollover_amount || 0) - diff;
                    await dispatch(
                        editBudget({
                            id: budget.id,
                            changes: {
                                spent: newSpent,
                                rollover_amount: newRollover,
                            },
                        }),
                    ).unwrap();
                }

                // Update Goal stats
                const newGoalCurrent = Number(goal.current_amount || 0) + diff;
                const newGoalTotal =
                    Number(goal.total_contributions || 0) + diff;
                const isCompleted =
                    newGoalCurrent >= Number(goal.target_amount || 0);

                await dispatch(
                    editGoal({
                        id: goal.id,
                        changes: {
                            current_amount: newGoalCurrent,
                            total_contributions: newGoalTotal,
                            is_completed: isCompleted,
                            completed_at: isCompleted
                                ? goal.completed_at || new Date().toISOString()
                                : null,
                        },
                    }),
                ).unwrap();
            }

            // Sync accounts
            await dispatch(loadAccounts(userId));

            setIsSaving(false);
            handleCloseEdit();
            onRefresh?.();
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Failed to edit contribution.");
            setIsSaving(false);
        }
    };

    // ── Handle Delete Contribution ──────────────────────────
    const handleDeleteContrib = async (c) => {
        const isConfirmed = await confirm({
            title: "Delete Contribution?",
            text: `This contribution of ${currency} ${Number(c.amount).toLocaleString()} will be deleted permanently. The money will be refunded to your account.`,
            icon: "warning",
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmColor: "var(--color-danger)",
        });

        if (!isConfirmed) return;

        try {
            // Delete Contribution from DB
            const { error: cErr } = await supabase
                .from("goal_contributions")
                .delete()
                .eq("id", c.id);

            if (cErr) throw cErr;

            // Delete related transaction
            if (c.transaction_id) {
                await dispatch(removeTransaction(c.transaction_id)).unwrap();
            }

            // Refund Account: balance + c.amount, total_expense - c.amount, count - 1
            if (activeAccount) {
                const newBalance =
                    Number(activeAccount.balance) + Number(c.amount);
                const newExpense = Math.max(
                    Number(activeAccount.total_expense || 0) - Number(c.amount),
                    0,
                );
                const newCount = Math.max(
                    Number(activeAccount.transaction_count || 0) - 1,
                    0,
                );
                await dispatch(
                    editAccount({
                        id: activeAccount.id,
                        changes: {
                            balance: newBalance,
                            total_expense: newExpense,
                            transaction_count: newCount,
                        },
                    }),
                ).unwrap();
            }

            // Adjust Category Budget
            const catId = c.category_id || goal.category_id;
            if (catId && budgetByCategory[catId]) {
                const budget = budgetByCategory[catId];
                const newSpent = Math.max(
                    Number(budget.spent || 0) - Number(c.amount),
                    0,
                );
                const newRollover =
                    Number(budget.rollover_amount || 0) + Number(c.amount);
                await dispatch(
                    editBudget({
                        id: budget.id,
                        changes: {
                            spent: newSpent,
                            rollover_amount: newRollover,
                        },
                    }),
                ).unwrap();
            }

            // Adjust Goal stats
            const newGoalCurrent = Math.max(
                Number(goal.current_amount || 0) - Number(c.amount),
                0,
            );
            const newGoalTotal = Math.max(
                Number(goal.total_contributions || 0) - Number(c.amount),
                0,
            );
            const newGoalCount = Math.max(
                Number(goal.contribution_count || 0) - 1,
                0,
            );
            const isCompleted =
                newGoalCurrent >= Number(goal.target_amount || 0);

            await dispatch(
                editGoal({
                    id: goal.id,
                    changes: {
                        current_amount: newGoalCurrent,
                        total_contributions: newGoalTotal,
                        contribution_count: newGoalCount,
                        is_completed: isCompleted,
                        completed_at: isCompleted ? goal.completed_at : null,
                    },
                }),
            ).unwrap();

            // Sync accounts
            await dispatch(loadAccounts(userId));

            onRefresh?.();
        } catch (err) {
            console.error("Delete contribution failed:", err);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" className={styles.tableTitle}>
                Contribution History
            </Typography>

            {sortedContributions.length === 0 ? (
                <div className={styles.noContribs}>
                    No contributions logged yet. Click "Add Contribution" to
                    start saving!
                </div>
            ) : (
                <TableContainer
                    component={Paper}
                    className={styles.tableContainer}
                >
                    <Table size="small" aria-label="goal contributions table">
                        <TableHead className={styles.tableHead}>
                            <TableRow>
                                <TableCell className={styles.headCell}>
                                    Date
                                </TableCell>
                                <TableCell
                                    className={styles.headCell}
                                    align="right"
                                >
                                    Amount
                                </TableCell>
                                <TableCell className={styles.headCell}>
                                    Note
                                </TableCell>
                                <TableCell
                                    className={styles.headCell}
                                    align="center"
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedContributions.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={styles.tableRow}
                                >
                                    <TableCell className={styles.tableCell}>
                                        {new Date(row.date).toLocaleDateString(
                                            undefined,
                                            {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            },
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className={styles.tableCell}
                                        align="right"
                                        style={{
                                            fontWeight: "var(--weight-bold)",
                                            color: "var(--color-success)",
                                        }}
                                    >
                                        +{currency}{" "}
                                        {Number(row.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell
                                        className={styles.tableCell}
                                        style={{
                                            maxWidth: 180,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {row.note || (
                                            <span
                                                style={{
                                                    color: "var(--color-text-muted)",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                No note
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        className={styles.tableCell}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenEdit(row)}
                                            style={{
                                                color: "var(--color-primary)",
                                                marginRight: 4,
                                            }}
                                            aria-label="edit contribution"
                                        >
                                            <FiEdit2 size={14} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleDeleteContrib(row)
                                            }
                                            style={{
                                                color: "var(--color-danger)",
                                            }}
                                            aria-label="delete contribution"
                                        >
                                            <FiTrash2 size={14} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ── Edit Dialog Modal ─────────────────────────────── */}
            <Dialog
                open={!!editItem}
                onClose={handleCloseEdit}
                sx={{ zIndex: 10000 }}
                PaperProps={{
                    className: styles.dialogPaper,
                    style: {
                        background: "var(--color-bg-elevated)",
                        color: "var(--color-text-primary)",
                        borderRadius: "var(--radius-xl)",
                    },
                }}
            >
                <DialogTitle className={styles.dialogTitle}>
                    Edit Contribution
                </DialogTitle>
                <DialogContent>
                    {errorMsg && (
                        <div className={styles.dialogError} role="alert">
                            <FiAlertTriangle style={{ marginRight: 6 }} />
                            {errorMsg}
                        </div>
                    )}
                    <Box
                        component="form"
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        <TextField
                            label="Amount"
                            type="number"
                            fullWidth
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <FiDollarSign
                                            style={{
                                                marginRight: 6,
                                                color: "var(--color-primary)",
                                            }}
                                        />
                                    ),
                                },
                            }}
                            variant="outlined"
                        />
                        <TextField
                            label="Date"
                            type="date"
                            fullWidth
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <FiCalendar
                                            style={{
                                                marginRight: 6,
                                                color: "var(--color-primary)",
                                            }}
                                        />
                                    ),
                                },
                            }}
                            variant="outlined"
                        />
                        <TextField
                            label="Note"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <FiFileText
                                            style={{
                                                marginRight: 6,
                                                color: "var(--color-primary)",
                                                marginTop: 4,
                                            }}
                                        />
                                    ),
                                },
                            }}
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ padding: "16px 24px", gap: 1 }}>
                    <MainButton
                        action="ghost"
                        size="sm"
                        title="Cancel"
                        clickEvent={handleCloseEdit}
                        isDisabled={isSaving}
                    >
                        Cancel
                    </MainButton>
                    <MainButton
                        action="primary"
                        size="sm"
                        title="Save Changes"
                        clickEvent={handleSaveEdit}
                        isLoading={isSaving}
                    >
                        Save
                    </MainButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
