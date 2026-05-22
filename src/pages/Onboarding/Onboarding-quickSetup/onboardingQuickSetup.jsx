// local
import styles from "./OnboardingQuickSetup.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { updateUserProfile } from "../../../services/users/auth";

// react
import { useEffect, useRef, useState } from "react";

// react hook form
import { useForm } from "react-hook-form";

// redux
import { useSelector, useDispatch } from "react-redux";
import { setProfile } from "../../../redux/auth/authSlice";

// gsap
import gsap from "gsap";

// toastify
import { toast } from "react-toastify";

// react router
import { useNavigate } from "react-router";

// react icons
import { FiArrowLeft, FiDollarSign, FiUser, FiCheck } from "react-icons/fi";

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

function OnboardingQuickSetup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const { profile } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onTouched",
        defaultValues: {
            currency: profile?.currency || "EGP",
            monthly_budget_limit: profile?.monthly_budget_limit || "",
            display_name: profile?.display_name || "",
        },
    });

    // ── GSAP Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                `.${styles.card}`,
                { autoAlpha: 0, scale: 0.95, y: 25 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.15)" }
            );

            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, y: 15 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // ── GSAP Paint Focus
    const handleInputFocus = (e) => {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT") return;
        const parent = e.target.closest(".formItem");
        if (parent) parent.classList.add(styles.focusedWrapper);

        gsap.to(e.target, {
            borderColor: "var(--color-primary)",
            backgroundColor: "var(--input-bg-focus)",
            boxShadow: "0 0 0 4px var(--color-primary-ring)",
            duration: 0.4,
            ease: "power2.out",
        });
    };

    const handleInputBlur = (e) => {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT") return;
        const parent = e.target.closest(".formItem");
        if (parent) parent.classList.remove(styles.focusedWrapper);

        gsap.to(e.target, {
            borderColor: "var(--input-border)",
            backgroundColor: "var(--input-bg)",
            boxShadow: "none",
            duration: 0.3,
            ease: "power2.inOut",
        });
    };

    // ── Submit
    const onSubmit = async (data) => {
        if (!profile?.uid) return;
        setLoading(true);
        const loadingToast = toast.loading("Saving your preferences...");
        try {
            const updatedProfile = await updateUserProfile(profile.uid, {
                currency: data.currency,
                monthly_budget_limit: data.monthly_budget_limit ? Number(data.monthly_budget_limit) : null,
                display_name: data.display_name,
                onboarding_completed: true,
            });

            dispatch(setProfile(updatedProfile));

            toast.update(loadingToast, {
                render: "Preferences saved successfully!",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });

            navigate("/onboarding/finish", { replace: true });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to save preferences. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef}>
            <div className={styles.card}>
                <div className="formItem">
                    <div className={styles.logoWrapper}>
                        <img src="/logo.png" alt="Moniq Logo" className={styles.logoImage} />
                    </div>
                </div>

                <h2 className={`formItem ${styles.title}`}>Quick Setup</h2>
                <p className={`formItem ${styles.subtitle}`}>
                    Personalize your experience with a few quick preferences.
                </p>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit(onSubmit)}
                    onFocusCapture={handleInputFocus}
                    onBlurCapture={handleInputBlur}
                    noValidate
                >
                    {/* Currency Select */}
                    <div className="formItem">
                        <div className={styles.selectWrapper}>
                            <label htmlFor="currency" className={styles.selectLabel}>
                                Currency
                            </label>
                            <select
                                id="currency"
                                className={`${styles.selectField} ${errors.currency ? styles.selectError : ""}`}
                                {...register("currency", { required: "Please select a currency" })}
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            {errors.currency && (
                                <p className={styles.errorMsg}>{errors.currency.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Monthly Budget Limit */}
                    <div className="formItem">
                        <MainInput
                            type="number"
                            name="monthly_budget_limit"
                            title="Monthly Budget Limit"
                            placeholder="e.g. 5000"
                            icon={<FiDollarSign />}
                            register={register("monthly_budget_limit", {
                                min: {
                                    value: 0,
                                    message: "Budget must be a positive number",
                                },
                            })}
                            hasError={!!errors.monthly_budget_limit}
                            errorMsg={errors.monthly_budget_limit?.message}
                        />
                    </div>

                    {/* Display Name */}
                    <div className="formItem">
                        <MainInput
                            type="text"
                            name="display_name"
                            title="Your Display Name"
                            placeholder="Jane Doe"
                            icon={<FiUser />}
                            register={register("display_name", {
                                required: "Display name is required",
                                maxLength: {
                                    value: 50,
                                    message: "Name must be less than 50 characters",
                                },
                            })}
                            hasError={!!errors.display_name}
                            errorMsg={errors.display_name?.message}
                        />
                    </div>

                    {/* Navigation */}
                    <div className={`formItem ${styles.navActions}`}>
                        <MainButton
                            type="button"
                            title="Previous"
                            action="outline"
                            clickEvent={() => navigate("/onboarding/goals", { replace: true })}
                            isDisabled={loading}
                        >
                            <FiArrowLeft size={16} style={{ marginRight: "6px" }} /> Previous
                        </MainButton>
                        <MainButton
                            type="submit"
                            title="Finish & Start"
                            action="primary"
                            isLoading={loading}
                        >
                            <FiCheck size={16} style={{ marginRight: "6px" }} /> Finish & Start
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OnboardingQuickSetup;
