// local
import LoadingPage from "./pages/loading-page/LoadingPage";
import MainLayout from "./layout/main/mainLayout";
const WelcomePage = lazy(() => import("./pages/welcome-page/WelcomePage"));
const OfflinePage = lazy(() => import("./pages/offline-page/OfflinePage"));

// react
import { useEffect, useState, lazy, Suspense } from "react";

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
                    <MainLayout>
                        <Outlet />
                    </MainLayout>
                    :
                    <Suspense fallback={<LoadingPage />}>
                        <OfflinePage />
                    </Suspense>
            }
        </>
    )
}

export default App;
