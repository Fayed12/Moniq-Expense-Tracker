import * as XLSX from "xlsx";

/**
 * Export categories array to a styled Excel file.
 * @param {Array} categories — array of category objects
 * @param {Object} categoryStats — calculated stats for each category
 * @param {string} currency — currency code, e.g. "EGP"
 */
export function exportCategoriesToExcel(categories, categoryStats = {}, currency = "EGP") {
    if (!categories?.length) return;

    // ── Build rows ──────────────────────────────────────────
    const rows = categories.map((c) => {
        const stats = categoryStats[c.id] || { transactionCount: 0, spentThisMonth: 0, budgetLimit: 0 };
        
        const limitStr = stats.budgetLimit > 0
            ? `${currency} ${stats.budgetLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : "No Budget Set";

        const spentStr = `${currency} ${stats.spentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

        const statusParts = [];
        if (c.is_default) statusParts.push("Default");
        else statusParts.push("Custom");

        if (c.is_archived) statusParts.push("Archived");
        else statusParts.push("Active");

        return {
            Name: c.name || "",
            Type: c.type ? c.type.charAt(0).toUpperCase() + c.type.slice(1) : "Both",
            "Budget Limit": limitStr,
            "Spent This Month": spentStr,
            "Transactions Linked": stats.transactionCount,
            Status: statusParts.join(" & "),
            "Date Created": c.created_at
                ? new Date(c.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })
                : "",
        };
    });

    // ── Create worksheet ────────────────────────────────────
    const ws = XLSX.utils.json_to_sheet(rows);

    // ── Column widths ───────────────────────────────────────
    ws["!cols"] = [
        { wch: 22 }, // Name
        { wch: 12 }, // Type
        { wch: 20 }, // Budget Limit
        { wch: 20 }, // Spent This Month
        { wch: 22 }, // Transactions Linked
        { wch: 20 }, // Status
        { wch: 16 }, // Date Created
    ];

    // ── Create workbook ─────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");

    // ── Generate filename with current date ─────────────────
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Moniq_Categories_${today}.xlsx`;

    // ── Download ────────────────────────────────────────────
    XLSX.writeFile(wb, fileName);
}
