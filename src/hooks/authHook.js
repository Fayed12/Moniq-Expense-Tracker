// local
import { supabase } from "../config/supabase";
import {
    clearAuth,
    loadSession,
    setProfile,
    setSession,
} from "../redux/auth/authSlice";
import { fetchUserProfile, updateUserProfile } from "../services/users/auth";

// react
import { useEffect } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, profile, session, loading, error, emailConfirmSent } =
        useSelector((s) => s.auth);

    // ── Boot: load existing session from localStorage ──────
    useEffect(() => {
        dispatch(loadSession());
    }, [dispatch]);

    // ── REALTIME auth state listener ───────────────────────
    // This fires on: sign in, sign out, token refresh, tab focus
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            switch (event) {
                case "SIGNED_IN":
                case "TOKEN_REFRESHED":
                case "USER_UPDATED": {
                    dispatch(setSession({ session }));
                    if (session?.user) {
                        let profileData = await fetchUserProfile(
                            session.user.id,
                        );

                        // Self-healing synchronization: update public table when auth email changes are confirmed
                        if (
                            session.user.email &&
                            profileData &&
                            session.user.email.toLowerCase() !==
                                profileData.email?.toLowerCase()
                        ) {
                            profileData = await updateUserProfile(
                                session.user.id,
                                { email: session.user.email },
                            );
                        }

                        dispatch(setProfile(profileData));
                    }
                    break;
                }

                case "SIGNED_OUT": {
                    dispatch(clearAuth());
                    break;
                }

                case "PASSWORD_RECOVERY": {
                    // User clicked reset-password link — redirect to reset page
                    window.location.href = "/auth/reset-password";
                    break;
                }

                default:
                    break;
            }
        });

        // Cleanup listener on unmount
        return () => subscription.unsubscribe();
    }, [dispatch]);

    // ── REALTIME user listener ─────────────────────
    // Automatically updates Redux when backend user changes
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel("user-profile")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "users",
                    filter: `uid=eq.${user.id}`,
                },
                async () => {
                    const updatedProfile = await fetchUserProfile(user.id);
                    dispatch(setProfile(updatedProfile));
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, dispatch]);

    return { user, profile, session, loading, error, emailConfirmSent };
};
