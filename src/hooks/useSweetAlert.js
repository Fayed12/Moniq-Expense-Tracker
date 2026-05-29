import Swal from "sweetalert2";
import { useCallback } from "react";

// ── Shared base styles (reads CSS variables at call-time) ───
const getBaseStyles = () => {
    const root = getComputedStyle(document.documentElement);
    const get = (v) => root.getPropertyValue(v).trim();

    return {
        background: get("--color-bg-elevated") || "#ffffff",
        color: get("--color-text-primary") || "#2d1409",
        confirmButtonColor: get("--color-primary") || "#a0522d",
        cancelButtonColor: get("--color-text-muted") || "#a0522d",
        iconColor: get("--color-primary") || "#a0522d",
        customClass: {
            popup: "swal-moniq-popup",
            title: "swal-moniq-title",
            htmlContainer: "swal-moniq-html",
            confirmButton: "swal-moniq-confirm",
            cancelButton: "swal-moniq-cancel",
            actions: "swal-moniq-actions",
            icon: "swal-moniq-icon",
        },
    };
};

// ════════════════════════════════════════════════════════════
// useSweetAlert — reusable themed confirmation hook
// ════════════════════════════════════════════════════════════
export function useSweetAlert() {
    // ── Generic confirm ─────────────────────────────────────
    const confirm = useCallback(
        async ({
            title = "Are you sure?",
            text = "",
            icon = "warning",
            confirmText = "Confirm",
            cancelText = "Cancel",
            confirmColor,
            iconColor,
        } = {}) => {
            const base = getBaseStyles();
            const result = await Swal.fire({
                ...base,
                title,
                text,
                icon,
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                confirmButtonColor: confirmColor || base.confirmButtonColor,
                iconColor: iconColor || base.iconColor,
                reverseButtons: true,
                focusCancel: true,
                buttonsStyling: true,
            });
            return result.isConfirmed;
        },
        [],
    );

    // ── Delete confirm (pre-configured) ─────────────────────
    const confirmDelete = useCallback(
        async (itemName = "this item") => {
            const root = getComputedStyle(document.documentElement);
            const dangerColor =
                root.getPropertyValue("--color-danger").trim() || "#c0392b";

            return confirm({
                title: "Delete Permanently?",
                text: `"${itemName}" will be permanently deleted. This action cannot be undone.`,
                icon: "warning",
                confirmText: "Delete",
                cancelText: "Keep it",
                confirmColor: dangerColor,
                iconColor: dangerColor,
            });
        },
        [confirm],
    );

    // ── Archive confirm (pre-configured) ────────────────────
    const confirmArchive = useCallback(
        async (itemName = "this item") => {
            const root = getComputedStyle(document.documentElement);
            const warningColor =
                root.getPropertyValue("--color-warning").trim() || "#b07d1a";

            return confirm({
                title: "Archive Account?",
                text: `"${itemName}" will be archived and hidden from active accounts. You can restore it anytime.`,
                icon: "question",
                confirmText: "Archive",
                cancelText: "Cancel",
                confirmColor: warningColor,
                iconColor: warningColor,
            });
        },
        [confirm],
    );

    // ── Set Default confirm (pre-configured) ────────────────
    const confirmSetDefault = useCallback(
        async (itemName = "this account") => {
            const root = getComputedStyle(document.documentElement);
            const successColor =
                root.getPropertyValue("--color-success").trim() || "#3d8c5a";

            return confirm({
                title: "Set as Default?",
                text: `"${itemName}" will become your default account for new transactions.`,
                icon: "question",
                confirmText: "Set Default",
                cancelText: "Cancel",
                confirmColor: successColor,
                iconColor: successColor,
            });
        },
        [confirm],
    );

    // ── Success toast ───────────────────────────────────────
    const showSuccess = useCallback(async (title = "Done!", text = "") => {
        const base = getBaseStyles();
        const root = getComputedStyle(document.documentElement);
        const successColor =
            root.getPropertyValue("--color-success").trim() || "#3d8c5a";

        await Swal.fire({
            ...base,
            title,
            text,
            icon: "success",
            iconColor: successColor,
            confirmButtonColor: successColor,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    }, []);

    // ── Transfer confirm with Note input ────────────────────
    const confirmTransfer = useCallback(
        async (fromName, toName, amountStr) => {
            const base = getBaseStyles();
            const root = getComputedStyle(document.documentElement);
            const primaryColor =
                root.getPropertyValue("--color-primary").trim() || "#a0522d";

            const result = await Swal.fire({
                ...base,
                title: "Confirm Transfer",
                html: `Transfer <strong>${amountStr}</strong> from <strong>${fromName}</strong> to <strong>${toName}</strong>?`,
                icon: "info",
                input: "textarea",
                inputPlaceholder: "Add a note (optional)...",
                inputAttributes: {
                    "aria-label": "Transfer note",
                    style: "background: var(--input-bg); color: var(--color-text-primary); border: 1px solid var(--input-border); border-radius: var(--input-radius);",
                },
                showCancelButton: true,
                confirmButtonText: "Transfer Now",
                cancelButtonText: "Cancel",
                confirmButtonColor: primaryColor,
                iconColor: primaryColor,
                reverseButtons: true,
                focusConfirm: false,
                buttonsStyling: true,
            });

            return {
                isConfirmed: result.isConfirmed,
                note: result.value || null, // result.value holds the textarea content
            };
        },
        [],
    );

    return {
        confirm,
        confirmDelete,
        confirmArchive,
        confirmSetDefault,
        showSuccess,
        confirmTransfer,
    };
}
