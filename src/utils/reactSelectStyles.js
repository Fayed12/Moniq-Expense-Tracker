function get(v) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();
}

export const getSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        fontFamily: get("--font-sans"),
        fontSize: get("--text-sm"),
        fontWeight: get("--weight-regular"),
        minHeight: get("--input-height") || "44px",
        background: state.isFocused
            ? get("--input-bg-focus")
            : get("--input-bg"),
        borderColor: state.isFocused
            ? get("--input-border-focus")
            : get("--input-border"),
        borderRadius: get("--input-radius") || "12px",
        boxShadow: state.isFocused
            ? `0 0 0 2px ${get("--color-primary-ring")}`
            : "none",
        cursor: "pointer",
        transition: `border-color 150ms ease, background-color 150ms ease, box-shadow 200ms ease`,
        "&:hover": {
            borderColor: get("--input-border-hover"),
            backgroundColor: get("--input-bg-hover"),
        },
    }),

    valueContainer: (base) => ({
        ...base,
        padding: `0 ${get("--input-padding-x") || "14px"}`,
    }),

    singleValue: (base) => ({
        ...base,
        color: get("--color-text-primary"),
        fontWeight: get("--weight-regular"),
    }),

    placeholder: (base) => ({
        ...base,
        color: get("--color-text-muted"),
    }),

    input: (base) => ({
        ...base,
        color: get("--color-text-primary"),
        caretColor: get("--color-primary"),
    }),

    indicatorSeparator: () => ({ display: "none" }),

    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused
            ? get("--color-primary")
            : get("--color-text-muted"),
        transition: "color 150ms ease, transform 200ms ease",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
        padding: "0 10px",
        "&:hover": {
            color: get("--color-primary"),
        },
    }),

    clearIndicator: (base) => ({
        ...base,
        color: get("--color-text-muted"),
        padding: "0 6px",
        "&:hover": {
            color: get("--color-danger"),
        },
    }),

    menu: (base) => ({
        ...base,
        background: get("--color-bg-elevated"),
        border: `1px solid ${get("--glass-border")}`,
        borderRadius: get("--radius-xl") || "16px",
        boxShadow: get("--glass-shadow-lg"),
        overflow: "hidden",
        zIndex: 300000,
        backdropFilter: get("--glass-blur"),
        WebkitBackdropFilter: get("--glass-blur"),
        marginTop: "6px",
        animation: "selectFadeIn 0.15s ease-out",
    }),

    menuList: (base) => ({
        ...base,
        padding: "6px",
        maxHeight: "220px",
    }),

    option: (base, state) => ({
        ...base,
        fontFamily: get("--font-sans"),
        fontSize: get("--text-sm"),
        fontWeight: state.isSelected
            ? get("--weight-semibold")
            : get("--weight-regular"),
        color: state.isSelected
            ? get("--color-text-inverse")
            : get("--color-text-primary"),
        background: state.isSelected
            ? get("--color-primary")
            : state.isFocused
              ? get("--color-primary-light")
              : "transparent",
        borderRadius: get("--radius-lg") || "12px",
        padding: "10px 14px",
        cursor: "pointer",
        transition: "background 120ms ease, color 120ms ease",
        marginBottom: "2px",
        "&:active": {
            background: get("--color-primary"),
            color: get("--color-text-inverse"),
        },
    }),

    noOptionsMessage: (base) => ({
        ...base,
        fontFamily: get("--font-sans"),
        fontSize: get("--text-sm"),
        color: get("--color-text-muted"),
    }),

    multiValue: (base) => ({
        ...base,
        background: get("--color-primary-light"),
        borderRadius: get("--radius-full"),
    }),

    multiValueLabel: (base) => ({
        ...base,
        color: get("--color-primary"),
        fontWeight: get("--weight-medium"),
        fontSize: get("--text-xs"),
    }),

    multiValueRemove: (base) => ({
        ...base,
        color: get("--color-primary"),
        borderRadius: `0 ${get("--radius-full")} ${get("--radius-full")} 0`,
        "&:hover": {
            background: get("--color-danger-bg"),
            color: get("--color-danger"),
        },
    }),

    menuPortal: (base) => ({
        ...base,
        zIndex: 300000,
    }),
});

if (typeof document !== "undefined") {
    const id = "moniq-select-keyframes";
    if (!document.getElementById(id)) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
            @keyframes selectFadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to   { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}
