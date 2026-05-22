// local
import styles from "./OnboardingWelcome.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { updateUserProfile } from "../../../services/users/auth";

// react
import { useEffect, useRef, useState } from "react";

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
import { FiArrowRight, FiSkipForward } from "react-icons/fi";

function OnboardingWelcome() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const { profile } = useSelector((state) => state.auth);
    const [skipping, setSkipping] = useState(false);

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
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.2, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // ── Skip Onboarding
    const handleSkip = async () => {
        if (!profile?.uid) return;
        setSkipping(true);
        const loadingToast = toast.loading("Setting up your account...");
        try {
            const updatedProfile = await updateUserProfile(profile.uid, {
                onboarding_completed: true,
            });
            dispatch(setProfile(updatedProfile));
            toast.update(loadingToast, {
                render: "Welcome to Moniq!",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });
            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error(err);
            toast.update(loadingToast, {
                render: "Something went wrong. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setSkipping(false);
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

                <h1 className={`formItem ${styles.title}`}>Welcome to Moniq</h1>

                <p className={`formItem ${styles.description}`}>
                    Your premium companion for effortless expense tracking, smart budgeting, 
                    and achieving your financial goals with clarity and elegance.
                </p>

                <div className={`formItem ${styles.actions}`}>
                    <MainButton
                        type="button"
                        title="Get Started"
                        action="primary"
                        size="lg"
                        clickEvent={() => navigate("/onboarding/expense", { replace: true })}
                    >
                        Get Started <FiArrowRight size={18} style={{ marginLeft: "8px" }} />
                    </MainButton>

                    <MainButton
                        type="button"
                        title="Skip"
                        action="danger"
                        size="md"
                        clickEvent={() => handleSkip()}
                        isDisabled={skipping}
                    >
                        <FiSkipForward size={16} style={{ marginRight: "6px" }} /> Skip
                    </MainButton>
                </div>
            </div>
        </div>
    );
}

export default OnboardingWelcome;
