import * as XLSX from "xlsx";

/**
 * Export budgets array to a styled Excel file.
 * @param {Array} budgets — array of enriched budget objects
 * @param {string} currency — currency code, e.g. "EGP"
 * @param {string} month — current month in YYYY-MM format
 */
export function exportBudgetsToExcel(budgets, currency = "EGP", month = "") {
    if (!budgets?.length) return;

    // ── Build rows ──────────────────────────────────────────
    const rows = budgets.map((b) => {
        const limit = Number(b.limit_amount || 0);
        const spent = b.spent || 0;
        const remaining = limit - spent;

        const limitStr = `${currency} ${limit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        const spentStr = `${currency} ${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        const remainingStr = `${currency} ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

        let status = "On Track";
        if (spent > limit) status = "Over Budget";
        else if (limit > 0 && (spent / limit) * 100 >= 85) status = "At Risk";

        return {
            Category: b.category_name || "—",
            Month: b.month || month,
            "Budget Limit": limitStr,
            Spent: spentStr,
            Remaining: remainingStr,
            "Usage %":
                limit > 0 ? `${Math.round((spent / limit) * 100)}%` : "0%",
            Status: status,
            Rollover: b.rollover ? "Yes" : "No",
            Transactions: b.txCount || 0,
        };
    });

    // ── Create worksheet ────────────────────────────────────
    const ws = XLSX.utils.json_to_sheet(rows);

    // ── Column widths ───────────────────────────────────────
    ws["!cols"] = [
        { wch: 22 }, // Category
        { wch: 12 }, // Month
        { wch: 20 }, // Budget Limit
        { wch: 20 }, // Spent
        { wch: 20 }, // Remaining
        { wch: 12 }, // Usage %
        { wch: 14 }, // Status
        { wch: 10 }, // Rollover
        { wch: 14 }, // Transactions
    ];

    // ── Create workbook ─────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budgets");

    // ── Generate filename with current date ─────────────────
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Moniq_Budgets_${month || today}.xlsx`;

    // ── Download ────────────────────────────────────────────
    XLSX.writeFile(wb, fileName);
}
