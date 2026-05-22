// local
import styles from "./ResetPassword.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { resetPassword } from "../../../services/users/auth";

// react
import { useEffect, useRef, useState } from "react";

// react hook form
import { useForm } from "react-hook-form";

// react icons
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// gsap
import gsap from "gsap";

// toastify
import { toast } from "react-toastify";

// react router
import { Link, useNavigate } from "react-router";

function ResetPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const containerRef = useRef(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onTouched"
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const password = watch("password", "");

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

            // Stagger reveal of form items
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

    // ── Password Update Handler ───────────────────────────────
    const onSubmit = async (data) => {
        setLoading(true);
        const loadingToast = toast.loading("Updating password, please wait...");
        try {
            await resetPassword(data.password);
            
            toast.update(loadingToast, {
                render: "Password updated successfully! Welcome back.",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });

            // Smoothly navigate back to landing home page as requested
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to reset password. Link may be expired.",
                type: "error",
                isLoading: false,
                autoClose: 4000,
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
                    <h1 className={`formItem ${styles.title}`}>Define new password</h1>
                    <p className={`formItem ${styles.subtitle}`}>
                        Choose a strong, secure password for your account.
                    </p>
                </div>

                {/* Reset Password Form */}
                <form
                    className={styles.form}
                    onSubmit={handleSubmit(onSubmit)}
                    onFocusCapture={handleInputFocus}
                    onBlurCapture={handleInputBlur}
                    noValidate
                >
                    {/* Password Input */}
                    <div className="formItem">
                        <div className={styles.passwordInputContainer}>
                            <div className={styles.labelRow}>
                                <label htmlFor="password" className={styles.customLabel}>New Password</label>
                            </div>
                            <div className={styles.passwordFieldWrapper}>
                                <MainInput
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    icon={<FiLock />}
                                    register={register("password", {
                                        required: "Password is required",
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                            message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
                                        },
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

                    {/* Confirm Password Input */}
                    <div className="formItem">
                        <div className={styles.passwordInputContainer}>
                            <div className={styles.labelRow}>
                                <label htmlFor="confirmPassword" className={styles.customLabel}>Confirm Password</label>
                            </div>
                            <div className={styles.passwordFieldWrapper}>
                                <MainInput
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    icon={<FiLock />}
                                    register={register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) => value === password || "The passwords do not match"
                                    })}
                                    hasError={!!errors.confirmPassword}
                                    errorMsg={errors.confirmPassword?.message}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeToggleBtn}
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className={`formItem ${styles.submitBtn}`}>
                        <MainButton
                            type="submit"
                            title="Update Password"
                            action="primary"
                            isLoading={loading}
                        >
                            Update Password
                        </MainButton>
                    </div>
                </form>

                {/* Optional back link to login */}
                <p className={`formItem ${styles.loginPrompt}`}>
                    Return to <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;