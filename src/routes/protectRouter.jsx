// local
import LoadingPage from "../pages/loading-page/LoadingPage";

// redux
import { useSelector } from "react-redux";

// react router
import { Navigate } from "react-router";

function ProtectRouter({ children }) {

    // i used user instead of profile and session, because i need to check if the user is logged in or not, the session only contain the current session but not contain user and profile may contain null data when no user exist in database
    const { user, loading } = useSelector((state) => state.auth);

    if (loading) return <LoadingPage />;

    if (!user) return <Navigate to="/login" replace />;

    return children;
}

export default ProtectRouter;