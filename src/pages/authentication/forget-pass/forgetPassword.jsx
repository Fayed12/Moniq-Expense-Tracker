// local
import styles from "./forgetPassword.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import MainInput from "../../../components/ui/input/MainInput";
import { sendPasswordReset } from "../../../services/users/auth";

// react
import { useEffect, useRef, useState } from "react";

// react hook form
import { useForm } from "react-hook-form";

// react icons
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

// gsap
import gsap from "gsap";

// toastify
import { toast } from "react-toastify";

// react router
import { Link } from "react-router";

function ForgetPassword() {
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
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

            // Stagger reveal of form/success items
            gsap.fromTo(
                ".formItem",
                { autoAlpha: 0, y: 15 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [isSent]); // Re-run staggers when success state toggles

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

    // ── Send Password Reset Handler ───────────────────────────
    const onSubmit = async (data) => {
        setLoading(true);
        const loadingToast = toast.loading("Sending recovery link, please wait...");
        try {
            await sendPasswordReset(data.email);
            setSubmittedEmail(data.email);
            setIsSent(true);

            toast.update(loadingToast, {
                render: "Recovery link successfully sent!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to send reset link. Please check email address.",
                type: "error",
                isLoading: false,
                autoClose: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!submittedEmail) return;
        setLoading(true);
        const loadingToast = toast.loading("Resending recovery link...");
        try {
            await sendPasswordReset(submittedEmail);
            toast.update(loadingToast, {
                render: "Recovery link successfully resent!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: err.message || "Failed to resend. Please try again later.",
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
                {!isSent ? (
                    <>
                        {/* Header Section */}
                        <div className={styles.header}>
                            <div className="formItem">
                                <div className={styles.logoWrapper}>
                                    <img src="/logo.png" alt="Moniq Logo" className={styles.logoImage} />
                                </div>
                            </div>
                            <h1 className={`formItem ${styles.title}`}>Reset your password</h1>
                            <p className={`formItem ${styles.subtitle}`}>
                                Enter your email to receive a secure recovery link.
                            </p>
                        </div>

                        {/* Forgot Password Form */}
                        <form
                            className={styles.form}
                            onSubmit={handleSubmit(onSubmit)}
                            onFocusCapture={handleInputFocus}
                            onBlurCapture={handleInputBlur}
                            noValidate
                        >
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

                            <div className={`formItem ${styles.submitBtn}`}>
                                <MainButton
                                    type="submit"
                                    title="Send Link"
                                    action="primary"
                                    isLoading={loading}
                                >
                                    Send Recovery Link
                                </MainButton>
                            </div>
                        </form>

                        {/* Back to Login Footer */}
                        <p className={`formItem ${styles.loginPrompt}`}>
                            Remembered your password? <Link to="/login">Login</Link>
                        </p>
                    </>
                ) : (
                    /* Dynamic Inline Success Card View */
                    <div className={styles.successContainer}>
                        <div className={`formItem ${styles.successIconWrapper}`}>
                            <FiCheckCircle size={36} />
                        </div>
                        <h2 className={`formItem ${styles.successTitle}`}>Check your inbox</h2>
                        <p className={`formItem ${styles.successDescription}`}>
                            We have sent a secure recovery link to <span className={styles.emailHighlight}>{submittedEmail}</span>. 
                            Please click the link inside the email to safely reset your password.
                        </p>

                        <div className={`formItem ${styles.resendBtn}`}>
                            <MainButton
                                type="button"
                                title="Resend Email"
                                action="primary"
                                clickEvent={handleResend}
                                isLoading={loading}
                            >
                                Resend Email
                            </MainButton>
                        </div>

                        <div className={`formItem ${styles.backBtn}`}>
                            <Link to="/login">
                                <MainButton
                                    type="button"
                                    title="Back to Login"
                                    action="outline"
                                    isDisabled={loading}
                                >
                                    <FiArrowLeft size={16} style={{ marginRight: "8px" }} /> Back to Login
                                </MainButton>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgetPassword;
