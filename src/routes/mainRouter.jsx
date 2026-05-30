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

const RegisterUserPage = lazy(
    () => import("../pages/authentication/register-user/registerUser"),
);
const LoginUserPage = lazy(
    () => import("../pages/authentication/login-user/loginUser"),
);
const ForgetPasswordPage = lazy(
    () => import("../pages/authentication/forget-pass/forgetPassword"),
);
const ResetPasswordPage = lazy(
    () => import("../pages/authentication/reset-pass/ResetPassword"),
);

const HomePage = lazy(
    () => import("../pages/dashboard-pages/home-page/homePage"),
);
const DashboardLayout = lazy(
    () => import("../layout/dashboard/dashboardLayout"),
);
const AccountsPage = lazy(
    () => import("../pages/dashboard-pages/accounts-page/accountsPage"),
);
const TransactionsPage = lazy(
    () => import("../pages/dashboard-pages/transactions-page/transactionsPage"),
);
const CategoriesPage = lazy(
    () => import("../pages/dashboard-pages/categories-page/categoriesPage"),
);
const BudgetsPage = lazy(
    () => import("../pages/dashboard-pages/budgets-page/budgetsPage"),
);

// Onboarding pages
const OnboardingLayout = lazy(
    () => import("../pages/Onboarding/OnboardingLayout"),
);
const OnboardingWelcome = lazy(
    () => import("../pages/Onboarding/Onboarding-welcome/onboardingWelcome"),
);
const OnboardingExpense = lazy(
    () => import("../pages/Onboarding/Onboarding-expense/onboardingExpense"),
);
const OnboardingAnalytics = lazy(
    () => import("../pages/Onboarding/Onboarding-analytics/onboardingAnalytics"),
);
const OnboardingGoals = lazy(
    () => import("../pages/Onboarding/Onboarding-goals/onboardingGoals"),
);
const OnboardingQuickSetup = lazy(
    () => import("../pages/Onboarding/Onboarding-quickSetup/onboardingQuickSetup"),
);
const OnboardingFinish = lazy(
    () => import("../pages/Onboarding/Onboarding-finish/onboardingFinish"),
);

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
                ),
            },
            {
                path: "/register",
                element: (
                    <SuspenseWrapper>
                        <RegisterUserPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: "/login",
                element: (
                    <SuspenseWrapper>
                        <LoginUserPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: "/forgot-password",
                element: (
                    <SuspenseWrapper>
                        <ForgetPasswordPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: "/reset-password",
                element: (
                    <SuspenseWrapper>
                        <ResetPasswordPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: "/onboarding",
                element: (
                    <ProtectRouter>
                        <SuspenseWrapper>
                            <OnboardingLayout />
                        </SuspenseWrapper>
                    </ProtectRouter>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <SuspenseWrapper>
                                <OnboardingWelcome />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "welcome",
                        element: (
                            <SuspenseWrapper>
                                <OnboardingWelcome />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "expense",
                        element: (
                            <SuspenseWrapper>
                                <OnboardingExpense />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "analytics",
                        element: (
                            <SuspenseWrapper>
                                <OnboardingAnalytics />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "goals",
                        element: (
                            <SuspenseWrapper>
                                <OnboardingGoals />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "quick-setup",
                        element: (
                            <SuspenseWrapper>
                                <OnboardingQuickSetup />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "finish",
                        element: (
                            <SuspenseWrapper>
                                <OnboardingFinish />
                            </SuspenseWrapper>
                        ),
                    },
                ],
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
                        ),
                    },
                    {
                        path: "home",
                        element: (
                            <SuspenseWrapper>
                                <HomePage />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "accounts",
                        element: (
                            <SuspenseWrapper>
                                <AccountsPage />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "transactions",
                        element: (
                            <SuspenseWrapper>
                                <TransactionsPage />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "categories",
                        element: (
                            <SuspenseWrapper>
                                <CategoriesPage />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "budgets",
                        element: (
                            <SuspenseWrapper>
                                <BudgetsPage />
                            </SuspenseWrapper>
                        ),
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <ErrorPage />,
    },
]);

export default router;
