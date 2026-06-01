import { useSelector, useDispatch } from "react-redux";
import { setProfile } from "../redux/auth/authSlice";
import { toggleTheme, themeSelector } from "../redux/theme/themeSlice";
import { updateUserProfile } from "../services/users/auth";
import { selectAvatarStatus, selectAvatarError } from "../redux/auth/userSlice";

export const useProfilePageData = () => {
    const dispatch = useDispatch();

    // ── Raw Redux data ──────────────────────────────────────
    const user = useSelector((s) => s.auth.user);
    const profile = useSelector((s) => s.auth.profile);
    const accounts = useSelector((s) => s.accounts.items) || [];
    const theme = useSelector(themeSelector);

    // Avatar upload status from userSlice
    const avatarStatus = useSelector(selectAvatarStatus);
    const avatarError = useSelector(selectAvatarError);

    // ── Derived values ──────────────────────────────────────
    const userId = profile?.uid || user?.id || null;

    // ── Profile update handler ──────────────────────────────
    const updateProfile = async (changes) => {
        if (!userId) throw new Error("No active user session found.");

        const updated = await updateUserProfile(userId, changes);
        dispatch(setProfile(updated));
        return updated;
    };

    return {
        profile,
        accounts,
        theme,
        userId,
        avatarStatus,
        avatarError,
        updateProfile,
        toggleTheme: () => dispatch(toggleTheme()),
    };
};
