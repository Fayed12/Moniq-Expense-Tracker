// local
import LoadingPage from "../pages/loading-page/LoadingPage";

// redux
import { useSelector } from "react-redux";

// react router
import { Navigate } from "react-router";

function ProtectRouter({ children }) {
    const { user, loading } = useSelector((state) => state.auth);

    // Detect if the URL contains active Supabase authentication redirect parameters
    // (such as a PKCE exchange code or implicit flow hash tokens)
    const hasAuthParams = 
        window.location.search.includes("code=") || 
        window.location.hash.includes("access_token=") ||
        window.location.search.includes("type=") ||
        window.location.hash.includes("type=");

    // If session is loading or if we have pending auth redirect parameters and no user yet,
    // display a loading page and preserve the URL so the Supabase client can process the tokens.
    if (loading || (hasAuthParams && !user)) {
        return <LoadingPage />;
    }

    if (!user) return <Navigate to="/login" replace />;

    return children;
}

export default ProtectRouter;