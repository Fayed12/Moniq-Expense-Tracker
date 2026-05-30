import * as XLSX from "xlsx";

/**
 * Export transactions array to a styled Excel file.
 * @param {Array} transactions — array of transaction objects
 * @param {string} currency — currency code, e.g. "EGP"
 */
export function exportTransactionsToExcel(transactions, currency = "EGP") {
    if (!transactions?.length) return;

    // ── Build rows ──────────────────────────────────────────
    const rows = transactions.map((t) => ({
        Date: t.date
            ? new Date(t.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
              })
            : "",
        Title: t.title || "",
        Type: t.type
            ? t.type.charAt(0).toUpperCase() + t.type.slice(1)
            : "",
        Category: t.category_name || "—",
        Account: t.account_name || "—",
        Tags: t.tags?.join(", ") || "",
        Amount: `${t.type === "income" ? "+" : "-"} ${currency} ${Number(t.amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`,
        Note: t.note || "",
    }));

    // ── Create worksheet ────────────────────────────────────
    const ws = XLSX.utils.json_to_sheet(rows);

    // ── Column widths ───────────────────────────────────────
    ws["!cols"] = [
        { wch: 16 }, // Date
        { wch: 28 }, // Title
        { wch: 12 }, // Type
        { wch: 20 }, // Category
        { wch: 22 }, // Account
        { wch: 22 }, // Tags
        { wch: 22 }, // Amount
        { wch: 30 }, // Note
    ];

    // ── Create workbook ─────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    // ── Generate filename with current date ─────────────────
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Moniq_Transactions_${today}.xlsx`;

    // ── Download ────────────────────────────────────────────
    XLSX.writeFile(wb, fileName);
}
