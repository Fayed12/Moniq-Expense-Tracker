// local
import styles from "./logout.module.css";
import MainButton from "../../ui/button/MainButton";
import { logoutUser } from "../../../redux/auth/authSlice";

// redux
import { useDispatch } from "react-redux";

// react icons
import { FiLogOut } from "react-icons/fi";

// gsap
import { gsap } from "gsap";

// react
import { useRef, useEffect } from "react";

// toastify
import { toast } from "react-toastify";

const LogoutButton = ({ collapse }) => {
    const dispatch = useDispatch();
    const btnRef = useRef(null);

    // GSAP animations: subtle pulse on mount, scale on hover.
    useEffect(() => {
        const el = btnRef.current;
        if (!el) return;
        const pulse = gsap.to(el, {
            opacity: 0.9,
            yoyo: true,
            repeat: -1,
            duration: 2,
            ease: "power1.inOut",
            paused: true,
        });
        const hover = gsap.to(el, {
            scale: 1.07,
            duration: 0.2,
            ease: "power1.out",
            paused: true,
        });
        pulse.play();
        el.addEventListener("mouseenter", () => hover.play());
        el.addEventListener("mouseleave", () => hover.reverse());
        return () => {
            pulse.kill();
            hover.kill();
        };
    }, []);

    const handleLogout = async () => {
        const loadingToast = toast.loading("loading.....");
        try {
            await dispatch(logoutUser());
            toast.update(loadingToast, {
                render: "logout successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Logout failed:", error);
            toast.update(loadingToast, {
                render: error.message || "Logout failed. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    return (
        <div ref={btnRef} className={styles.wrapper}>
            <MainButton
                className={styles.logoutBtn}
                title="Logout"
                clickEvent={handleLogout}
                action="danger"
                size="md"
            >
                <FiLogOut className={styles.icon} aria-hidden="true" />
                {!collapse && <span className={styles.label}>Logout</span>}
            </MainButton>
        </div>
    );
};

export default LogoutButton;
