/* eslint-disable react-hooks/incompatible-library */
// local
import styles from "./registerUser.module.css";
import MainInput from "../../../components/ui/input/MainInput";
import MainButton from "../../../components/ui/button/MainButton";
import { registerUser, loginWithGoogle } from "../../../redux/auth/authSlice";

// react
import { useEffect, useRef } from "react";

// react hook form
import { useForm } from "react-hook-form";

// redux
import { useDispatch, useSelector } from "react-redux";

// gsap
import gsap from "gsap";

// toastify
import { toast } from "react-toastify";

// react icons
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

// react router
import { Link, useNavigate } from "react-router";

function RegisterUser() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const { loading, error } = useSelector((state) => state.auth);
    const containerRef = useRef(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch("password", "");

    // GSAP Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background color animation
            gsap.fromTo(
                ".pageContainer",
                { backgroundColor: "var(--brown-50)" },
                { backgroundColor: "var(--color-bg-app)", duration: 1.5, ease: "power2.out" }
            );

            // Container popping animation
            gsap.fromTo(
                ".contentWrapper",
                { autoAlpha: 0, scale: 0.95, y: 20 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.2)" }
            );

            // Stagger form items
            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, x: 20 },
                { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" }
            );
            
            // Left panel text animation
            gsap.fromTo(
                ".brandText",
                { autoAlpha: 0, y: -20 },
                { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.2, delay: 0.4, ease: "power2.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const onSubmit = async (data) => {
        try {
            // Match with database.md user profile structure
            const newUserProfile = {
                displayName: data.fullName,
                currency: "USD",
                locale: "en-US",
                dateFormat: "DD/MM/YYYY",
                theme: "system",
                accentColor: "#a0522d",
                onboardingCompleted: false,
                monthlyBudgetLimit: null,
                defaultAccountId: null,
                notifyBudgetAlert: true,
                notifyGoalReached: true,
                notifyRecurringDue: true,
                notifyWeeklyDigest: false
            };

            const resultAction = await dispatch(
                registerUser({
                    email: data.email,
                    password: data.password,
                    newUser: newUserProfile
                })
            );

            if (registerUser.fulfilled.match(resultAction)) {
                toast.success("Account created successfully!");
                // navigate("/login"); 
            } else {
                toast.error(resultAction.payload || "Registration failed. Please try again.");
            }
        } catch (err) {
            console.log(err.message);
            toast.error("An unexpected error occurred.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const newUserProfile = {
                currency: "USD",
                locale: "en-US",
                dateFormat: "DD/MM/YYYY",
                theme: "system",
                accentColor: "#a0522d",
                onboardingCompleted: false,
                monthlyBudgetLimit: null,
                defaultAccountId: null,
                notifyBudgetAlert: true,
                notifyGoalReached: true,
                notifyRecurringDue: true,
                notifyWeeklyDigest: false
            };
            
            const resultAction = await dispatch(loginWithGoogle(newUserProfile));
            if (loginWithGoogle.rejected.match(resultAction)) {
                toast.error(resultAction.payload || "Google login failed.");
            } else {
                toast.success("Google login successful!");
                // navigate("/dashboard");
            }
        } catch (err) {
            console.log(err.message);
            toast.error("An unexpected error occurred.");
        }
    };

    return (
        <div className={`pageContainer ${styles.pageContainer}`} ref={containerRef}>
            <div className={styles.bgOverlay}></div>
            
            <div className={`contentWrapper ${styles.contentWrapper}`}>
                {/* Left Panel - Brand */}
                <div className={styles.leftPanel}>
                    <div className={styles.leftPanelBg}></div>
                    
                    {/* SVG waves for the bottom of left panel */}
                    <svg className={styles.waves} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="var(--brown-300)" fillOpacity="1" d="M0,160L48,160C96,160,192,160,288,144C384,128,480,96,576,106.7C672,117,768,171,864,181.3C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <path fill="var(--brown-500)" fillOpacity="0.5" d="M0,224L60,213.3C120,203,240,181,360,176C480,171,600,181,720,197.3C840,213,960,235,1080,218.7C1200,203,1320,149,1380,122.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>

                    <h1 className={`brandText ${styles.brandLogo}`}>Moniq</h1>
                    
                    <div className={`brandText ${styles.brandMessage}`}>
                        "Empowering your financial journey with clarity and elegance. Welcome to Moniq."
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className={styles.rightPanel}>
                    <div className={styles.formHeader}>
                        <h2 className={`formItem ${styles.formTitle}`}>Begin Your Journey to Financial Clarity</h2>
                        <p className={`formItem ${styles.formSubtitle}`}>Create your premium account today.</p>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
                            <MainInput
                                type="password"
                                name="password"
                                title="Password"
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
                        </div>
                        
                        <div className="formItem">
                            <MainInput
                                type="password"
                                name="confirmPassword"
                                title="Confirm Password"
                                placeholder="••••••••"
                                icon={<FiLock />}
                                register={register("confirmPassword", { 
                                    required: "Please confirm your password",
                                    validate: value => value === password || "The passwords do not match"
                                })}
                                hasError={!!errors.confirmPassword}
                                errorMsg={errors.confirmPassword?.message}
                            />
                        </div>

                        <div className={`formItem ${styles.submitBtn}`}>
                            <MainButton 
                                type="submit" 
                                title="Create Account" 
                                action="primary" 
                                // isLoading={loading}
                                className="w-100"
                                style={{ width: "100%" }}
                            >
                                Create Account
                            </MainButton>
                        </div>
                    </form>

                    <div className={`formItem ${styles.divider}`}>
                        <span>Or continue with</span>
                    </div>

                    <div className={`formItem ${styles.socialLogin}`}>
                        <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
                            <FcGoogle size={20} /> Google
                        </button>
                    </div>

                    <p className={`formItem ${styles.loginPrompt}`}>
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterUser;