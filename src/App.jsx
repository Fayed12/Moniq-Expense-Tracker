// local
import LoadingPage from "./pages/loading-page/LoadingPage";
const WelcomePage = lazy(() => import("./pages/welcome-page/WelcomePage"));
const OfflinePage = lazy(() => import("./pages/offline-page/OfflinePage"));
import { themeSelector } from "./redux/theme/themeSlice";
import { useAuth } from "./hooks/authHook";

// react
import { useEffect, useState, lazy, Suspense } from "react";

// redux
import { useSelector } from "react-redux";

// react router
import { Outlet } from "react-router";

function App() {
    const [openWelcome, setOpenWelcome] = useState(() => {
        const sessionWelcomePage = sessionStorage.getItem("firstWelcome");
        if (sessionWelcomePage === "closed") return false
        return true
    });
    const [isOnline, setIsOnline] = useState(() => {
        const online = navigator.onLine;
        return online;
    });

    // redux
    const themeValue = useSelector(themeSelector);

    // set theme to root element on mount and theme change
    useEffect(() => {
        if (themeValue === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [themeValue]);

    useEffect(() => {
        function isOnlineFn() {
            setIsOnline(navigator.onLine);
        }
        window.addEventListener("online", isOnlineFn);
        window.addEventListener("offline", isOnlineFn);

        return () => {
            window.removeEventListener("online", isOnlineFn);
            window.removeEventListener("offline", isOnlineFn);
        }
    }, []);

    useEffect(() => {
        if (openWelcome) {
            const closeWelcome = setTimeout(() => {
                sessionStorage.setItem("firstWelcome", "closed");
                setOpenWelcome(false);
            }, 5000);

            return () => clearTimeout(closeWelcome);
        }
    }, [openWelcome]);

    // useAuth
    useAuth();

    if (openWelcome) {
        return (
            <>
                <Suspense fallback={<LoadingPage />}>
                    {isOnline ? <WelcomePage /> :
                        <OfflinePage />
                    }
                </Suspense>
            </>
        )
    }

    return (
        <>
            {
                isOnline ?
                    <Outlet />
                    :
                    <Suspense fallback={<LoadingPage />}>
                        <OfflinePage />
                    </Suspense>
            }
        </>
    )
}

export default App;
