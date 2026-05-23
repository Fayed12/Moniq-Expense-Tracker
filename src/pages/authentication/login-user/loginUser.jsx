// local
import styles from "./loginUser.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { loginUser, loginWithGoogle } from "../../../redux/auth/authSlice";

// react
import { useEffect, useRef, useState } from "react";

// react hook form
import { useForm } from "react-hook-form";

// redux
import { useDispatch } from "react-redux";

// gsap
import gsap from "gsap";

// toastify
import { toast } from "react-toastify";

// react icons
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GiBackForth } from "react-icons/gi";

// react router
import { Link, useNavigate } from "react-router";

export default function LoginUser() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const containerRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onTouched"
    });

    // ── GSAP Entrance Animation ────────────────────────────────
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Smooth background color animate
            gsap.fromTo(
                `.${styles.pageContainer}`,
                { backgroundColor: "var(--brown-50)" },
                { backgroundColor: "var(--color-bg-app)", duration: 1.5, ease: "power2.out" }
            );

            // Centered card popping scale and fade in
            gsap.fromTo(
                `.${styles.contentWrapper}`,
                { autoAlpha: 0, scale: 0.95, y: 25 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.15)" }
            );

            // Stagger reveal of form items (Logo -> Heading -> Inputs -> Buttons)
            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, y: 15 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // ── GSAP Focus/Paint Input Animations (Event Delegation) ──
    const handleInputFocus = (e) => {
        if (e.target.tagName !== "INPUT") return;
        
        const parent = e.target.closest(".formItem");
        if (parent) {
            parent.classList.add(styles.focusedWrapper);
        }

        // GSAP "Paint Border and Glow" sweep animation on focus
        gsap.to(e.target, {
            borderColor: "var(--color-primary)",
            backgroundColor: "var(--input-bg-focus)",
            boxShadow: "0 0 0 4px var(--color-primary-ring)",
            duration: 0.4,
            ease: "power2.out"
        });
    };

    const handleInputBlur = (e) => {
        if (e.target.tagName !== "INPUT") return;

        // Auto-trim spaces on blur for email and text fields to prevent typing errors
        if (e.target.type === "email" || e.target.name === "email" || e.target.type === "text") {
            const originalVal = e.target.value;
            const trimmedVal = originalVal.trim();
            if (originalVal !== trimmedVal) {
                e.target.value = trimmedVal;
                // Dispatch input event to notify react-hook-form of the change
                e.target.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }

        const parent = e.target.closest(".formItem");
        if (parent) {
            parent.classList.remove(styles.focusedWrapper);
        }

        // Return input back to standard theme border and background
        gsap.to(e.target, {
            borderColor: "var(--input-border)",
            backgroundColor: "var(--input-bg)",
            boxShadow: "none",
            duration: 0.3,
            ease: "power2.inOut"
        });
    };

    // ── Email and Password Credentials Login ──────────────────
    const onSubmit = async (data) => {
        setLoading(true);
        const loadingToast = toast.loading("Verifying your credentials, please wait...");
        try {
            const trimmedEmail = data.email ? data.email.trim() : "";
            const resultAction = await dispatch(
                loginUser({
                    email: trimmedEmail,
                    password: data.password,
                })
            );

            if (loginUser.fulfilled.match(resultAction)) {
                toast.update(loadingToast, {
                    render: "Welcome back! Login successful.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });

                // Check onboarding status and redirect accordingly
                const profile = resultAction.payload?.profile;
                if (profile?.onboarding_completed) {
                    navigate("/dashboard");
                } else {
                    navigate("/onboarding/welcome");
                }
            } else {
                toast.update(loadingToast, {
                    render: resultAction.payload || "Login failed. Please check your credentials.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: "An unexpected error occurred during login.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // ── Google OAuth Authentication ───────────────────────────
    const handleGoogleLogin = async () => {
        setLoading(true);
        const loadingToast = toast.loading("Connecting to Google authentication...");
        try {
            // Consistent new user schema fallback in case of new profile creation
            const newUserProfile = {
                photo_url: null,
                currency: "EGP",
                locale: "ar-EG",
                date_format: "DD/MM/YYYY",
                onboarding_completed: false,
                monthly_budget_limit: null,
                default_account_id: null,
                notify_budget_alert: true,
                notify_goal_reached: true,
                notify_recurring_due: true,
                notify_weekly_digest: false,
                created_at: new Date().toISOString(),
                updated_at: null
            };

            const resultAction = await dispatch(loginWithGoogle(newUserProfile));
            if (loginWithGoogle.rejected.match(resultAction)) {
                toast.update(loadingToast, {
                    render: resultAction.payload || "Google authentication failed.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            } else {
                toast.update(loadingToast, {
                    render: "Google login successful! Redirecting...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });

                // Check onboarding status for Google sign-in
                const profile = resultAction.payload?.profile;
                if (profile?.onboarding_completed) {
                    navigate("/dashboard");
                } else {
                    navigate("/onboarding/welcome");
                }
            }
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: "An unexpected error occurred during Google sign-in.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer} ref={containerRef}>
            <div className={styles.bgOverlay}></div>

            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className="formItem">
                        <div className={styles.logoWrapper}>
                            <img src="/logo.png" alt="Moniq Logo" className={styles.logoImage} />
                        </div>
                    </div>
                    <h1 className={`formItem ${styles.title}`}>Welcome back</h1>
                    <p className={`formItem ${styles.subtitle}`}>Sign in to continue to Moniq.</p>
                </div>

                {/* Email and Password Form */}
                <form
                    className={styles.form}
                    onSubmit={handleSubmit(onSubmit)}
                    onFocusCapture={handleInputFocus}
                    onBlurCapture={handleInputBlur}
                    noValidate
                >
                    {/* Email Input */}
                    <div className="formItem">
                        <MainInput
                            type="email"
                            name="email"
                            title="Email Address"
                            placeholder="name@example.com"
                            icon={<FiMail />}
                            register={register("email", {
                                required: "Email address is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Please enter a valid email address"
                                }
                            })}
                            hasError={!!errors.email}
                            errorMsg={errors.email?.message}
                        />
                    </div>

                    {/* Password Input with custom forgot link */}
                    <div className="formItem">
                        <div className={styles.passwordInputContainer}>
                            <div className={styles.labelRow}>
                                <label htmlFor="password" className={styles.customLabel}>Password</label>
                                <Link to="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
                            </div>
                            <div className={styles.passwordFieldWrapper}>
                                <MainInput
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    icon={<FiLock />}
                                    register={register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters long"
                                        }
                                    })}
                                    hasError={!!errors.password}
                                    errorMsg={errors.password?.message}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeToggleBtn}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Start Journey Submit Button */}
                    <div className={`formItem ${styles.submitBtn}`}>
                        <MainButton
                            type="submit"
                            title="Start Journey"
                            action="primary"
                            isLoading={loading}
                        >
                            Start Journey
                        </MainButton>
                    </div>
                </form>

                {/* Or Divider */}
                <div className={`formItem ${styles.divider}`}>
                    <span>Or continue with</span>
                </div>

                {/* Google Authentication (At Bottom) */}
                <div className={`formItem ${styles.socialLogin}`}>
                    <MainButton
                        type="button"
                        title="Continue with Google"
                        action="outline"
                        clickEvent={handleGoogleLogin}
                        isDisabled={loading}
                        className={styles.googleBtn}
                    >
                        <FcGoogle size={20} /> Continue with Google
                    </MainButton>
                </div>

                <div className={styles.footerContainer}>
                    <Link to="/" title="back to home">
                        <GiBackForth size={20} className="text-muted" />
                    </Link>
                </div>

                {/* Signup Redirect Footer */}
                <p className={`formItem ${styles.registerPrompt}`}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}