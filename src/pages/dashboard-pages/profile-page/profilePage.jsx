// local
import styles from "./profilePage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { useProfilePageData } from "../../../hooks/profilePageData";
import { sendPasswordReset } from "../../../services/users/auth";
import { uploadAvatarThunk } from "../../../redux/auth/userSlice";
import { editAccount } from "../../../redux/accountsSlice";

// react
import { useEffect, useRef, useState } from "react";

// react hook form
import { useForm, Controller } from "react-hook-form";

// redux
import { useDispatch } from "react-redux";

// toastify
import { toast } from "react-toastify";

// gsap
import gsap from "gsap";

// react select
import Select from "react-select";

// react icons
import {
    FiUser,
    FiMail,
    FiDollarSign,
    FiSettings,
    FiShield,
    FiCamera,
    FiCalendar,
    FiCheck,
    FiEdit3,
    FiX,
    FiLock,
    FiAlertTriangle,
} from "react-icons/fi";
import { FaSun, FaMoon } from "react-icons/fa";

// MUI
import { Avatar, CircularProgress } from "@mui/material";

// Currencies
const CURRENCIES = [
    { value: "EGP", label: "EGP — Egyptian Pound" },
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "SAR", label: "SAR — Saudi Riyal" },
    { value: "AED", label: "AED — UAE Dirham" },
    { value: "KWD", label: "KWD — Kuwaiti Dinar" },
    { value: "QAR", label: "QAR — Qatari Riyal" },
    { value: "BHD", label: "BHD — Bahraini Dinar" },
    { value: "OMR", label: "OMR — Omani Rial" },
    { value: "JOD", label: "JOD — Jordanian Dinar" },
    { value: "GBP", label: "GBP — British Pound" },
];

// Locales
const LOCALES = [
    { value: "en-US", label: "English (United States)" },
    { value: "ar-EG", label: "Arabic (Egypt)" },
    { value: "en-GB", label: "English (United Kingdom)" },
    { value: "fr-FR", label: "French (France)" },
];

// Date Formats
const DATE_FORMATS = [
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g. 2026-05-31)" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 31/05/2026)" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 05/31/2026)" },
];

// Custom Premium styling object for React Select matching our sienna/glass theme
const reactSelectCustomStyles = () => ({
    control: (base, state) => ({
        ...base,
        background: "var(--input-bg)",
        borderColor: state.isFocused
            ? "var(--color-primary)"
            : "var(--color-border-default)",
        borderRadius: "var(--input-radius)",
        boxShadow: state.isFocused
            ? "0 0 0 4px var(--color-primary-ring)"
            : "none",
        minHeight: "var(--input-height)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--color-text-primary)",
        transition: "var(--transition-base)",
        cursor: "pointer",
        outline: "none",
        borderWidth: "1px",
        "&:hover": {
            borderColor: "var(--color-primary)",
        },
    }),
    singleValue: (base) => ({
        ...base,
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
    }),
    placeholder: (base) => ({
        ...base,
        color: "var(--color-text-muted)",
    }),
    input: (base) => ({
        ...base,
        color: "var(--color-text-primary)",
    }),
    menu: (base) => ({
        ...base,
        background: "var(--color-bg-surface)",
        WebkitBackdropFilter: "blur(6px)",
        backdropFilter: "blur(6px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--glass-shadow-lg)",
        zIndex: 300000,
    }),
    option: (base, state) => ({
        ...base,
        background: state.isSelected
            ? "var(--color-primary)"
            : state.isFocused
              ? "var(--color-primary-light)"
              : "transparent",
        color: state.isSelected
            ? "var(--color-text-inverse)"
            : "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        cursor: "pointer",
        "&:active": {
            background: "var(--color-primary)",
        },
    }),
});

// Helper to compress and resize image (browser canvas equivalent of expo-image-manipulator)
const compressAndResizeImage = (
    file,
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.8,
) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Maintain aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                            {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            },
                        );
                        resolve(compressedFile);
                    } else {
                        reject(new Error("Image compression failed"));
                    }
                },
                "image/jpeg",
                quality,
            );
        };
        img.onerror = (err) => reject(err);
    });
};

function ProfilePage() {
    const dispatch = useDispatch();

    const {
        profile,
        accounts,
        theme,
        userId,
        avatarStatus,
        updateProfile,
        toggleTheme,
    } = useProfilePageData();

    // ── Local States
    const [activeTab, setActiveTab] = useState("personal"); // "personal" | "security" | "preferences"
    const [isEditing, setIsEditing] = useState(false);
    const [tempPhotoUrl, setTempPhotoUrl] = useState(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isResetPending, setIsResetPending] = useState(false);

    // ── GSAP Element References
    const containerRef = useRef(null);
    const headerCardRef = useRef(null);
    const tabsRef = useRef(null);
    const contentRef = useRef(null);

    // Form inputs: Personal info
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm({
        mode: "onTouched",
        defaultValues: {
            display_name: profile?.display_name || "",
            currency: profile?.currency || "EGP",
            monthly_budget_limit: profile?.monthly_budget_limit || "",
            default_account_id: profile?.default_account_id || "",
            locale: profile?.locale || "en-US",
            date_format: profile?.date_format || "YYYY-MM-DD",
        },
    });

    // ── Synchronize Default Values on profile load
    useEffect(() => {
        if (profile) {
            reset({
                display_name: profile.display_name || "",
                currency: profile.currency || "EGP",
                monthly_budget_limit: profile.monthly_budget_limit || "",
                default_account_id: profile.default_account_id || "",
                locale: profile.locale || "en-US",
                date_format: profile.date_format || "YYYY-MM-DD",
            });
        }
    }, [profile, reset]);

    // ── GSAP Entry Animation (Flat flat entrances, no elastic physical card hover springs)
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                headerCardRef.current,
                { autoAlpha: 0, y: 25 },
                { autoAlpha: 1, y: 0, duration: 0.7 },
            )
                .fromTo(
                    tabsRef.current,
                    { autoAlpha: 0, y: 12 },
                    { autoAlpha: 1, y: 0, duration: 0.4 },
                    "-=0.45",
                )
                .fromTo(
                    contentRef.current,
                    { autoAlpha: 0, y: 15 },
                    { autoAlpha: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // ── GSAP Tab Switch Animation
    const handleTabChange = (tabId) => {
        if (tabId === activeTab) return;

        gsap.to(contentRef.current, {
            autoAlpha: 0,
            y: 10,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                setActiveTab(tabId);
                // Turn off editing state on tab change for safety
                setIsEditing(false);
                gsap.fromTo(
                    contentRef.current,
                    { autoAlpha: 0, y: 10 },
                    { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
                );
            },
        });
    };

    // ── Avatar Name Split
    const nameArray = profile?.display_name?.split(" ");
    const avatarName =
        nameArray && nameArray.length > 0
            ? nameArray.at(0)?.toUpperCase().slice(0, 1) +
              (nameArray.length > 1
                  ? nameArray
                        .at(nameArray.length - 1)
                        ?.toUpperCase()
                        .slice(0, 1)
                  : "")
            : "U";

    // ── File upload / avatar photo logic via thunks
    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 2MB before compression)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size is too large. Max allowed is 2MB.");
            return;
        }

        const uploadingToast = toast.loading(
            "Processing and uploading image...",
        );

        try {
            // Compress and resize the image before uploading (expo-image-manipulator equivalent)
            const compressedFile = await compressAndResizeImage(
                file,
                400,
                400,
                0.8,
            );

            const localUrl = URL.createObjectURL(compressedFile);
            setTempPhotoUrl(localUrl);

            // Dispatch upload avatar thunk from userSlice.js using the compressed file
            const actionResult = await dispatch(
                uploadAvatarThunk({ uid: userId, file: compressedFile }),
            );

            if (uploadAvatarThunk.rejected.match(actionResult)) {
                throw new Error(
                    actionResult.payload || "Failed to upload avatar",
                );
            }

            toast.update(uploadingToast, {
                render: "Profile picture uploaded successfully!",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });
        } catch (err) {
            console.error(err);
            toast.update(uploadingToast, {
                render: err.message || "Failed to upload image.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
            // Revert temporary photo url preview on failure
            setTempPhotoUrl(null);
        }
    };

    // ── Toggle Single Notification instantly
    const handleNotificationToggle = async (columnName, currentValue) => {
        const loadingToast = toast.loading(`Updating preferences...`);
        try {
            await updateProfile({
                [columnName]: !currentValue,
            });

            toast.update(loadingToast, {
                render: "Notification settings updated!",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to update notification setting.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    // ── Save Personal Settings
    const onSavePersonal = async (data) => {
        setIsUpdatingProfile(true);
        const loadingToast = toast.loading("Saving personal details...");

        try {
            // Build changes object — only include fields that actually changed
            const changes = {};

            if (data.display_name !== profile?.display_name)
                changes.display_name = data.display_name;

            if (data.currency !== profile?.currency)
                changes.currency = data.currency;

            const newBudget = data.monthly_budget_limit
                ? Number(data.monthly_budget_limit)
                : null;
            if (newBudget !== profile?.monthly_budget_limit)
                changes.monthly_budget_limit = newBudget;

            const newDefaultAccount = data.default_account_id || null;
            if (newDefaultAccount !== profile?.default_account_id)
                changes.default_account_id = newDefaultAccount;

            if (data.locale !== profile?.locale)
                changes.locale = data.locale;

            if (data.date_format !== profile?.date_format)
                changes.date_format = data.date_format;

            // If nothing changed, just close edit mode
            if (Object.keys(changes).length === 0) {
                toast.update(loadingToast, {
                    render: "No changes detected.",
                    type: "info",
                    isLoading: false,
                    autoClose: 1500,
                });
                setIsEditing(false);
                return;
            }

            await updateProfile(changes);

            toast.update(loadingToast, {
                render: "Profile updated successfully!",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to update profile.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // ── Update Default Account via accountsSlice thunk
    const handleDefaultAccountSelect = async (selectedAccountId) => {
        if (!selectedAccountId) return;
        const loadingToast = toast.loading(
            "Updating default transaction account...",
        );

        try {
            // Find current default account (where is_default === true)
            const currentDefault = accounts.find((a) => a.is_default);

            // 1. If old default exists, disable it in supabase
            if (currentDefault && currentDefault.id !== selectedAccountId) {
                const actionResult1 = await dispatch(
                    editAccount({
                        id: currentDefault.id,
                        changes: { is_default: false },
                    }),
                );
                if (editAccount.rejected.match(actionResult1)) {
                    throw new Error(
                        "Failed to clear previous default account.",
                    );
                }
            }

            // 2. Enable new default in supabase
            const actionResult2 = await dispatch(
                editAccount({
                    id: selectedAccountId,
                    changes: { is_default: true },
                }),
            );
            if (editAccount.rejected.match(actionResult2)) {
                throw new Error("Failed to set new default account.");
            }

            // 3. Update default_account_id on user profile as well
            await updateProfile({
                default_account_id: selectedAccountId,
            });

            toast.update(loadingToast, {
                render: "Default account updated successfully!",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to update default account.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    // ── Forgot Password Email Trigger
    const handleForgotPassword = async () => {
        if (!profile?.email) return;
        setIsResetPending(true);
        const loadingToast = toast.loading(
            "Sending secure password reset email...",
        );

        try {
            await sendPasswordReset(profile.email);
            toast.update(loadingToast, {
                render: "Password reset link sent to your email!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to send reset email.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsResetPending(false);
        }
    };

    // Get Active Default account name
    const activeDefaultAccount =
        accounts.find((a) => a.id === profile?.default_account_id) ||
        accounts.find((a) => a.is_default);

    return (
        <main className={styles.main} ref={containerRef}>
            {/* Header bar */}
            <div className={styles.headerBar}>
                <h1 className={styles.pageTitle}>Profile & Settings</h1>
                <p className={styles.pageSubtitle}>
                    Manage your personal credentials, secure passwords, and
                    preferences.
                </p>
            </div>

            {/* Profile Summary Card (Modern Flat Glassmorphic Card) */}
            <div
                id="tour-profile-summary"
                className={`${styles.profileSummaryCard} glass-card`}
                ref={headerCardRef}
            >
                <div className={styles.avatarContainer}>
                    <div className={styles.avatarWrapper}>
                        <Avatar
                            src={tempPhotoUrl || profile?.photo_url || ""}
                            alt={profile?.display_name || "User Avatar"}
                            sx={{
                                width: { xs: 72, sm: 96 },
                                height: { xs: 72, sm: 96 },
                                bgcolor: "var(--color-primary)",
                                fontSize: { xs: "28px", sm: "36px" },
                                fontFamily: "var(--font-sans)",
                                fontWeight: 700,
                                color: "var(--color-text-inverse)",
                                border: "4px solid var(--glass-border)",
                            }}
                        >
                            {avatarStatus === "uploading" ? (
                                <CircularProgress size={30} color="inherit" />
                            ) : (
                                avatarName
                            )}
                        </Avatar>

                        {/* Circular overlap button for uploading avatar */}
                        <label
                            className={styles.cameraTriggerBtn}
                            htmlFor="photo-upload"
                        >
                            <FiCamera className={styles.cameraIcon} />
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className={styles.hiddenInput}
                            onChange={handlePhotoChange}
                        />
                    </div>
                </div>

                <div className={styles.userInfo}>
                    <h2 className={styles.displayName}>
                        {profile?.display_name || "User name"}
                    </h2>
                    <p className={styles.emailText}>
                        {profile?.email || "No email bound"}
                    </p>

                    <div className={styles.badgeContainer}>
                        <span className={styles.currencyBadge}>
                            <FiDollarSign /> {profile?.currency || "EGP"}{" "}
                            Currency
                        </span>
                        <span className={styles.themeBadge}>
                            {theme === "dark" ? (
                                <FaMoon style={{ marginRight: "4px" }} />
                            ) : (
                                <FaSun style={{ marginRight: "4px" }} />
                            )}
                            {theme === "dark" ? "Dark Theme" : "Light Theme"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab selection menu */}
            <div id="tour-profile-tabs" className={styles.tabsContainer} ref={tabsRef}>
                <button
                    className={`${styles.tabButton} glass-subtle ${activeTab === "personal" ? styles.activeTab : ""}`}
                    onClick={() => handleTabChange("personal")}
                    type="button"
                >
                    <FiUser size={16} /> Personal Info
                </button>
                <button
                    className={`${styles.tabButton} glass-subtle ${activeTab === "security" ? styles.activeTab : ""}`}
                    onClick={() => handleTabChange("security")}
                    type="button"
                >
                    <FiShield size={16} /> Security Recovery
                </button>
                <button
                    className={`${styles.tabButton} glass-subtle ${activeTab === "preferences" ? styles.activeTab : ""}`}
                    onClick={() => handleTabChange("preferences")}
                    type="button"
                >
                    <FiSettings size={16} /> System Preferences
                </button>
            </div>

            {/* Dynamic settings panel area */}
            <div id="tour-profile-content" className={styles.contentArea} ref={contentRef}>
                {/* ── TAB 1: Personal Settings */}
                {activeTab === "personal" && (
                    <div className={`${styles.sectionCard} glass-card`}>
                        <div className={styles.sectionHeader}>
                            <FiUser className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>
                                {isEditing
                                    ? "Edit Personal Settings"
                                    : "Personal Settings"}
                            </h3>
                        </div>

                        {/* A. VIEW MODE: Elegant read-only blocks (No border outlines, no inputs) */}
                        {!isEditing && (
                            <div className={styles.dataGrid}>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Full Display Name
                                    </span>
                                    <span className={styles.dataValue}>
                                        {profile?.display_name || "Not set"}
                                    </span>
                                </div>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Registered Email Address
                                    </span>
                                    <span className={styles.dataValue}>
                                        {profile?.email || "Not set"}
                                    </span>
                                </div>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Preferred Currency
                                    </span>
                                    <span className={styles.dataValue}>
                                        {CURRENCIES.find(
                                            (c) =>
                                                c.value === profile?.currency,
                                        )?.label ||
                                            profile?.currency ||
                                            "EGP"}
                                    </span>
                                </div>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Monthly warnings Limit
                                    </span>
                                    <span className={styles.dataValue}>
                                        {profile?.monthly_budget_limit
                                            ? `${profile.monthly_budget_limit} ${profile.currency || "EGP"}`
                                            : "No budget warning limit set"}
                                    </span>
                                </div>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Default Transaction Account
                                    </span>
                                    <span className={styles.dataValue}>
                                        {activeDefaultAccount
                                            ? `${activeDefaultAccount.name} (${activeDefaultAccount.balance} ${activeDefaultAccount.currency})`
                                            : "No default account selected"}
                                    </span>
                                </div>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Language Locale
                                    </span>
                                    <span className={styles.dataValue}>
                                        {LOCALES.find(
                                            (l) => l.value === profile?.locale,
                                        )?.label ||
                                            profile?.locale ||
                                            "English (United States)"}
                                    </span>
                                </div>
                                <div className={styles.dataItemBlock}>
                                    <span className={styles.dataLabel}>
                                        Date Display Format
                                    </span>
                                    <span className={styles.dataValue}>
                                        {DATE_FORMATS.find(
                                            (d) =>
                                                d.value ===
                                                profile?.date_format,
                                        )?.label ||
                                            profile?.date_format ||
                                            "YYYY-MM-DD"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* B. EDIT MODE: Clean Sienna Form inputs & custom React Select fields */}
                        {isEditing && (
                            <form
                                className={styles.form}
                                onSubmit={handleSubmit(onSavePersonal)}
                                noValidate
                            >
                                <div className={styles.formGrid}>
                                    {/* Display Name */}
                                    <div className={styles.formItem}>
                                        <MainInput
                                            type="text"
                                            name="display_name"
                                            title="Display Name"
                                            placeholder="Jane Doe"
                                            icon={<FiUser />}
                                            register={register("display_name", {
                                                required:
                                                    "Display name is required",
                                                maxLength: {
                                                    value: 50,
                                                    message:
                                                        "Display name must be less than 50 characters",
                                                },
                                            })}
                                            hasError={!!errors.display_name}
                                            errorMsg={
                                                errors.display_name?.message
                                            }
                                        />
                                    </div>

                                    {/* Email (Fixed — cannot be changed) */}
                                    <div className={styles.formItem}>
                                        <div className={styles.fixedFieldBlock}>
                                            <span className={styles.fixedFieldLabel}>
                                                <FiMail size={14} />
                                                Email Address
                                            </span>
                                            <span className={styles.fixedFieldValue}>
                                                {profile?.email || "Not set"}
                                            </span>
                                            <span className={styles.emailWarning}>
                                                <FiAlertTriangle size={13} />
                                                Email cannot be changed after registration
                                            </span>
                                        </div>
                                    </div>

                                    {/* React Select: Currency */}
                                    <div className={styles.formItem}>
                                        <div className={styles.selectWrapper}>
                                            <label
                                                className={styles.selectLabel}
                                            >
                                                Standard Currency
                                            </label>
                                            <Controller
                                                name="currency"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select
                                                        options={CURRENCIES}
                                                        value={CURRENCIES.find(
                                                            (c) =>
                                                                c.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val.value,
                                                            )
                                                        }
                                                        styles={reactSelectCustomStyles()}
                                                        isSearchable={false}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Monthly Budget Warning Limit */}
                                    <div className={styles.formItem}>
                                        <MainInput
                                            type="number"
                                            name="monthly_budget_limit"
                                            title="Monthly Budget Limit"
                                            placeholder="e.g. 5000"
                                            icon={<FiDollarSign />}
                                            register={register(
                                                "monthly_budget_limit",
                                                {
                                                    min: {
                                                        value: 0,
                                                        message:
                                                            "Limit must be a positive number",
                                                    },
                                                },
                                            )}
                                            hasError={
                                                !!errors.monthly_budget_limit
                                            }
                                            errorMsg={
                                                errors.monthly_budget_limit
                                                    ?.message
                                            }
                                        />
                                    </div>

                                    {/* React Select: Default Account */}
                                    <div className={styles.formItem}>
                                        <div className={styles.selectWrapper}>
                                            <label
                                                className={styles.selectLabel}
                                            >
                                                Default Transaction Account
                                            </label>
                                            <Controller
                                                name="default_account_id"
                                                control={control}
                                                render={({ field }) => {
                                                    const options =
                                                        accounts.map((acc) => ({
                                                            value: acc.id,
                                                            label: `${acc.name} (${acc.balance} ${acc.currency})`,
                                                        }));
                                                    return (
                                                        <Select
                                                            options={options}
                                                            value={options.find(
                                                                (o) =>
                                                                    o.value ===
                                                                    field.value,
                                                            )}
                                                            onChange={(val) => {
                                                                field.onChange(
                                                                    val?.value ||
                                                                        "",
                                                                );
                                                                // Sync directly to accountsSlice thunk!
                                                                if (val?.value)
                                                                    handleDefaultAccountSelect(
                                                                        val.value,
                                                                    );
                                                            }}
                                                            placeholder="No default account chosen"
                                                            isClearable
                                                            styles={reactSelectCustomStyles()}
                                                            isSearchable={false}
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* React Select: Locale */}
                                    <div className={styles.formItem}>
                                        <div className={styles.selectWrapper}>
                                            <label
                                                className={styles.selectLabel}
                                            >
                                                Language Locale
                                            </label>
                                            <Controller
                                                name="locale"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        options={LOCALES}
                                                        value={LOCALES.find(
                                                            (l) =>
                                                                l.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val.value,
                                                            )
                                                        }
                                                        styles={reactSelectCustomStyles()}
                                                        isSearchable={false}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* React Select: Date Format */}
                                    <div className={styles.formItem}>
                                        <div className={styles.selectWrapper}>
                                            <label
                                                className={styles.selectLabel}
                                            >
                                                Preferred Date Format
                                            </label>
                                            <Controller
                                                name="date_format"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        options={DATE_FORMATS}
                                                        value={DATE_FORMATS.find(
                                                            (d) =>
                                                                d.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val.value,
                                                            )
                                                        }
                                                        styles={reactSelectCustomStyles()}
                                                        isSearchable={false}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <MainButton
                                        type="submit"
                                        title="Save Settings"
                                        action="primary"
                                        isLoading={isUpdatingProfile}
                                        isDisabled={
                                            !isDirty || isUpdatingProfile
                                        }
                                    >
                                        <FiCheck
                                            size={16}
                                            style={{ marginRight: "6px" }}
                                        />{" "}
                                        Save Changes
                                    </MainButton>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* ── TAB 2: Security Password Recovery (No inputs, confirmation redirect only) */}
                {activeTab === "security" && (
                    <div className={`${styles.sectionCard} glass-card`}>
                        <div className={styles.sectionHeader}>
                            <FiShield className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>
                                Security Recovery
                            </h3>
                        </div>

                        <div className={styles.securityResetCard}>
                            <div className={styles.securityMeta}>
                                <h4 className={styles.securityTitle}>
                                    Reset System Password
                                </h4>
                                <p className={styles.securityDesc}>
                                    To protect your security, Moniq doesn't
                                    store plain text password inputs. By
                                    clicking below, a encrypted password
                                    recovery verification link will be delivered
                                    to your email:{" "}
                                    <strong>{profile?.email}</strong>.
                                </p>
                                <p className={styles.securityDesc}>
                                    Clicking the link inside the confirmation
                                    email will securely redirect you to a
                                    separate password reset page to choose your
                                    new credentials safely.
                                </p>
                                <div className={styles.securityWarning}>
                                    <FiLock /> Link expires automatically after
                                    60 minutes.
                                </div>
                            </div>

                            <MainButton
                                action="outline"
                                clickEvent={handleForgotPassword}
                                isDisabled={isResetPending}
                                isLoading={isResetPending}
                                title="Send Recovery Email"
                            >
                                <FiMail
                                    size={16}
                                    style={{ marginRight: "6px" }}
                                />{" "}
                                Confirm Email & Send Link
                            </MainButton>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: Preferences & System Settings (Fixed themes, double-click fix) */}
                {activeTab === "preferences" && (
                    <div className={`${styles.sectionCard} glass-card`}>
                        <div className={styles.sectionHeader}>
                            <FiSettings className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>
                                System Preferences
                            </h3>
                        </div>

                        {/* Theme Toggle row (Click strictly isolated on button, preventing bubbles) */}
                        <div className={`${styles.toggleItem} glass-subtle`}>
                            <div className={styles.toggleMeta}>
                                <h4 className={styles.toggleTitle}>
                                    Display Theme
                                </h4>
                                <p className={styles.toggleDesc}>
                                    Toggle between warm cream light theme and
                                    premium sienna dark theme.
                                </p>
                            </div>
                            <MainButton
                                action="glass"
                                size="sm"
                                clickEvent={(e) => {
                                    e.stopPropagation(); // Stop event bubbling!
                                    toggleTheme();
                                }}
                                title={
                                    theme === "dark"
                                        ? "Toggle Light mode"
                                        : "Toggle Dark mode"
                                }
                            >
                                {theme === "dark" ? (
                                    <FaSun
                                        size={15}
                                        style={{ marginRight: "6px" }}
                                    />
                                ) : (
                                    <FaMoon
                                        size={15}
                                        style={{ marginRight: "6px" }}
                                    />
                                )}
                                {theme === "dark"
                                    ? "Switch Light"
                                    : "Switch Dark"}
                            </MainButton>
                        </div>

                        {/* Realtime Notification Toggles */}
                        <div className={`${styles.toggleItem} glass-subtle`}>
                            <div className={styles.toggleMeta}>
                                <h4 className={styles.toggleTitle}>
                                    Monthly Budget Limit Warnings
                                </h4>
                                <p className={styles.toggleDesc}>
                                    Warn me immediately when my monthly
                                    expenditures exceed 85% of my set warnings
                                    limit.
                                </p>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={!!profile?.notify_budget_alert}
                                    onChange={() =>
                                        handleNotificationToggle(
                                            "notify_budget_alert",
                                            !!profile?.notify_budget_alert,
                                        )
                                    }
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={`${styles.toggleItem} glass-subtle`}>
                            <div className={styles.toggleMeta}>
                                <h4 className={styles.toggleTitle}>
                                    Savings Target Milestones
                                </h4>
                                <p className={styles.toggleDesc}>
                                    Notify me when a savings goal is
                                    successfully achieved, paused, or nearing
                                    target amounts.
                                </p>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={!!profile?.notify_goal_reached}
                                    onChange={() =>
                                        handleNotificationToggle(
                                            "notify_goal_reached",
                                            !!profile?.notify_goal_reached,
                                        )
                                    }
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={`${styles.toggleItem} glass-subtle`}>
                            <div className={styles.toggleMeta}>
                                <h4 className={styles.toggleTitle}>
                                    Recurring Transaction Due Dates
                                </h4>
                                <p className={styles.toggleDesc}>
                                    Send notifications and prompts 2 days prior
                                    to standard recurring transaction deadlines.
                                </p>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={!!profile?.notify_recurring_due}
                                    onChange={() =>
                                        handleNotificationToggle(
                                            "notify_recurring_due",
                                            !!profile?.notify_recurring_due,
                                        )
                                    }
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={`${styles.toggleItem} glass-subtle`}>
                            <div className={styles.toggleMeta}>
                                <h4 className={styles.toggleTitle}>
                                    Weekly Budget Summary digest
                                </h4>
                                <p className={styles.toggleDesc}>
                                    Send me detailed weekly email performance
                                    reports comparing standard cashflow
                                    summaries.
                                </p>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={!!profile?.notify_weekly_digest}
                                    onChange={() =>
                                        handleNotificationToggle(
                                            "notify_weekly_digest",
                                            !!profile?.notify_weekly_digest,
                                        )
                                    }
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Floating Action Button (FAB) toggles Edit Mode on Personal tab */}
            {activeTab === "personal" && (
                <div className={styles.floatingActionBtn}>
                    <MainButton
                        action={isEditing ? "glass" : "primary"}
                        size="lg"
                        clickEvent={() => setIsEditing(!isEditing)}
                        title={isEditing ? "Cancel Edit" : "Edit Profile Info"}
                    >
                        {isEditing ? (
                            <>
                                <FiX size={18} style={{ marginRight: "6px" }} />{" "}
                                Cancel
                            </>
                        ) : (
                            <>
                                <FiEdit3
                                    size={18}
                                    style={{ marginRight: "6px" }}
                                />{" "}
                                Edit Profile
                            </>
                        )}
                    </MainButton>
                </div>
            )}

            {/* Read-Only System Metadata Footer */}
            {profile?.created_at && (
                <div className={styles.metaFooter}>
                    <div className={styles.metaItem}>
                        <FiCalendar /> Member Since:{" "}
                        {new Date(profile.created_at).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "long", day: "numeric" },
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default ProfilePage;
