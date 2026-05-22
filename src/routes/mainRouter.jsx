/* eslint-disable react-refresh/only-export-components */
// local
import ErrorPage from "../pages/error-page/ErrorPage";
import LoadingPage from "../pages/loading-page/LoadingPage";
import ProtectRouter from "./protectRouter";

// react router
import { createBrowserRouter } from "react-router";

// react
import { Suspense, lazy } from "react";

// suspense
const SuspenseWrapper = ({ children }) => (
    <Suspense fallback={<LoadingPage />}>{children}</Suspense>
);

// lazy components
const App = lazy(() => import("../App"));
const LandingPage = lazy(() => import("../pages/landing-page/landingPage"));

const RegisterUserPage = lazy(() => import("../pages/authentication/register-user/registerUser"));
const LoginUserPage = lazy(() => import("../pages/authentication/login-user/loginUser"));

const HomePage = lazy(() => import("../pages/dashboard-pages/home-page/homePage"));
const DashboardLayout = lazy(() => import("../layout/dashboard/dashboardLayout"));

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <SuspenseWrapper>
                <App />
            </SuspenseWrapper>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: (
                    <SuspenseWrapper>
                        <LandingPage />
                    </SuspenseWrapper>
                )
            },
            {
                path: "/register",
                element: (
                    <SuspenseWrapper>
                        <RegisterUserPage />
                    </SuspenseWrapper>
                )
            },
            {
                path: "/login",
                element: (
                    <SuspenseWrapper>
                        <LoginUserPage />
                    </SuspenseWrapper>
                )
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectRouter>
                        <SuspenseWrapper>
                            <DashboardLayout />
                        </SuspenseWrapper>
                    </ProtectRouter>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <SuspenseWrapper>
                                <HomePage />
                            </SuspenseWrapper>
                        )
                    },
                    {
                        path:"home",
                        element: (
                            <SuspenseWrapper>
                                <HomePage />
                            </SuspenseWrapper>
                        )
                    }
                ]
            }
        ]
    },
    {
        path: "*",
        element: <ErrorPage />,
    }
]);

export default router;