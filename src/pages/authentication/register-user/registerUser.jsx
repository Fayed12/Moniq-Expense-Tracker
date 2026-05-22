/* eslint-disable react-hooks/incompatible-library */
// Mohamed@as1
// local
import styles from "./registerUser.module.css";
import MainInput from "../../../components/ui/input/MainInput";
import MainButton from "../../../components/ui/button/MainButton";
import { registerUser, loginWithGoogle } from "../../../redux/auth/authSlice";

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
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

// react router
import { Link, useNavigate } from "react-router";

function RegisterUser() {
    const dispatch = useDispatch();
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

    const password = watch("password", "");

    // GSAP Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background color animation
            gsap.fromTo(
                `.${styles.pageContainer}`,
                { backgroundColor: "var(--brown-50)" },
                { backgroundColor: "var(--color-bg-app)", duration: 1.5, ease: "power2.out" }
            );

            // Container popping animation
            gsap.fromTo(
                `.${styles.contentWrapper}`,
                { autoAlpha: 0, scale: 0.95, y: 20 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.2)" }
            );

            // Stagger form items
            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, x: 20 },
                { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" }
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

    const onSubmit = async (data) => {
        setLoading(true);
        const loadingToast = toast.loading("Please wait. Creating an account...");
        try {
            // Match with database.md user profile structure
            const newUserProfile = {
                display_name: data.fullName,
                email: data.email,
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
                updated_at: new Date().toISOString()
            };

            const resultAction = await dispatch(
                registerUser({
                    displayName: data.fullName,
                    email: data.email,
                    password: data.password,
                    newUser: newUserProfile
                })
            );

            if (registerUser.fulfilled.match(resultAction)) {
                toast.update(loadingToast, {
                    render: "Account created successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
                navigate("/login");
            } else {
                toast.update(loadingToast, {
                    render: resultAction.payload || "Registration failed. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
                console.log(resultAction.payload);
            }
        } catch (err) {
            console.log(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const loadingToast = toast.loading("Please wait, Creating an account via Google.....");
        try {
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
                updated_at: new Date().toISOString()
            };
            
            const resultAction = await dispatch(loginWithGoogle(newUserProfile));
            if (loginWithGoogle.rejected.match(resultAction)) {
                toast.update(loadingToast, {
                    render: resultAction.payload || "Google login failed.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            } else {
                toast.update(loadingToast, {
                    render: "Google login successful!",
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
            }
        } catch (err) {
            toast.update(loadingToast, {
                render: "An unexpected error occurred.",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`pageContainer ${styles.pageContainer}`} ref={containerRef}>
            <div className={styles.bgOverlay}></div>
            
            <div className={`contentWrapper ${styles.contentWrapper}`}>
                <div className={styles.formHeader}>
                    <div className="formItem">
                        <div className={styles.logoWrapper}>
                            <img src="/logo.png" alt="Moniq Logo" className={styles.logoImage} />
                        </div>
                    </div>
                    <h2 className={`formItem ${styles.formTitle}`}>Begin Your Journey</h2>
                    <p className={`formItem ${styles.formSubtitle}`}>Create your premium account today.</p>
                </div>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit(onSubmit)}
                    onFocusCapture={handleInputFocus}
                    onBlurCapture={handleInputBlur}
                    noValidate
                >
                    <div className="formItem">
                        <MainInput
                            type="text"
                            name="fullName"
                            title="Full Name"
                            placeholder="Jane Doe"
                            icon={<FiUser />}
                            register={register("fullName", { 
                                required: "Full name is required",
                                maxLength: {
                                    value: 50,
                                    message: "Name must be less than 50 characters"
                                },
                                validate: value => {
                                    const words = value.trim().split(/\s+/);
                                    return words.length === 3 || "Please enter exactly three words";
                                }
                            })}
                            hasError={!!errors.fullName}
                            errorMsg={errors.fullName?.message}
                        />
                    </div>

                    <div className="formItem">
                        <MainInput
                            type="email"
                            name="email"
                            title="Email Address"
                            placeholder="jane@example.com"
                            icon={<FiMail />}
                            register={register("email", { 
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            hasError={!!errors.email}
                            errorMsg={errors.email?.message}
                        />
                    </div>

                    <div className="formItem">
                        <div className={styles.passwordInputContainer}>
                            <div className={styles.labelRow}>
                                <label htmlFor="password" className={styles.customLabel}>Password</label>
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
                                            message: "Must contain at least one uppercase letter, one lowercase letter, one number and one special character"
                                        },
                                        minLength: {
                                            value: 8,
                                            message: "Must be at least 8 characters."
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
                                        validate: value => value === password || "The passwords do not match"
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

                    <div className={`formItem ${styles.submitBtn}`}>
                        <MainButton 
                            type="submit" 
                            title="Create Account" 
                            action="primary" 
                            isLoading={loading}
                        >
                            Create Account
                        </MainButton>
                    </div>
                </form>

                <div className={`formItem ${styles.divider}`}>
                    <span>Or continue with</span>
                </div>

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

                <p className={`formItem ${styles.loginPrompt}`}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterUser;