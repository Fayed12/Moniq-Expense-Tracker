/* eslint-disable react-refresh/only-export-components */
// local
import ErrorPage from "../pages/error-page/ErrorPage";
import LoadingPage from "../pages/loading-page/LoadingPage";

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
const HomePage = lazy(() => import("../pages/dashboard-pages/home-page/homePage"));

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
                        <HomePage />
                    </SuspenseWrapper>
                )
            }
        ]
    },
    {
        path: "*",
        element: <ErrorPage />,
    }
]);

export default router;