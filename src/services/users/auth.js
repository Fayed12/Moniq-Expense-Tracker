import { supabase } from "../../config/supabase";

// ─────────────────────────────────────────────────────────────
// SIGN UP with email + password
// ─────────────────────────────────────────────────────────────
export const signUp = async ({ email, password, displayName }) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: displayName,
            },
        },
    });

    if (error) throw error;

    return data;
};

// ─────────────────────────────────────────────────────────────
// LOG IN with email + password
// ─────────────────────────────────────────────────────────────
export const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────────────────────
// LOG IN / SIGN UP with Google OAuth
// ─────────────────────────────────────────────────────────────
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────────────────────
// LOG OUT
// ─────────────────────────────────────────────────────────────
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD — send reset email
// ─────────────────────────────────────────────────────────────
export const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
};

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD — after clicking the email link
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────────────────────
// GET CURRENT SESSION
// ─────────────────────────────────────────────────────────────
export const getSession = async () => {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

// ─────────────────────────────────────────────────────────────
// ADD NEW USER TO TABLE USERS
// ─────────────────────────────────────────────────────────────
export const createUserProfile = async (newUser) => {
    const { data, error } = await supabase.from("users").upsert(newUser);

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────────────────────
// FETCH USER PROFILE from public.users
// ─────────────────────────────────────────────────────────────
export const fetchUserProfile = async (authUid) => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("uid", authUid)
        .single();

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────────────────────
// UPDATE USER TABLE ONLY (no auth changes)
// Used by the self-healing hook in useAuth to sync email from
// auth → public.users without re-triggering auth updates.
// ─────────────────────────────────────────────────────────────
export const updateUserTable = async (userId, changes) => {
    if (!userId || !changes || Object.keys(changes).length === 0) {
        throw new Error("No user ID or changes provided.");
    }

    const { data, error } = await supabase
        .from("users")
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq("uid", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ─────────────────────────────────────────────────────────────
// UPDATE USER PROFILE (table + auth metadata sync)
//
// Strategy:
//   1. Update public.users table FIRST (source of truth for all
//      profile fields: currency, locale, budget, display_name, etc.)
//   2. Sync auth metadata (display_name → full_name, photo_url →
//      avatar_url) in a SEPARATE non-fatal call.
//   Email is IMMUTABLE — set at registration and never changed.
// ─────────────────────────────────────────────────────────────
export const updateUserProfile = async (userId, changes) => {
    // ── 1. Separate auth-level fields from table-level fields ──
    const { display_name, photo_url, ...tableOnlyChanges } = changes;

    const hasAuthFields =
        display_name !== undefined || photo_url !== undefined;

    // Build the public.users table payload
    const tableUpdate = { ...tableOnlyChanges };

    // display_name and photo_url go to BOTH the table and auth metadata
    if (display_name !== undefined) tableUpdate.display_name = display_name.trim();
    if (photo_url !== undefined) tableUpdate.photo_url = photo_url;

    if (Object.keys(tableUpdate).length === 0) {
        throw new Error("No changes provided.");
    }

    // ── 2. Update public.users table (source of truth) ──
    const { data, error: dbError } = await supabase
        .from("users")
        .update({ ...tableUpdate, updated_at: new Date().toISOString() })
        .eq("uid", userId)
        .select()
        .single();

    if (dbError) throw dbError;

    // ── 3. Sync auth metadata (display_name, photo_url) — fire-and-forget ──
    // Do NOT await — return table data immediately, sync in background
    if (hasAuthFields) {
        supabase.auth
            .getUser()
            .then(({ data: { user: authUser } }) => {
                if (!authUser) return;

                const authMetadata = {};
                if (display_name !== undefined) {
                    const cleanName = display_name.trim();
                    if (cleanName !== authUser.user_metadata?.full_name) {
                        authMetadata.full_name = cleanName;
                    }
                }
                if (photo_url !== undefined) {
                    if (photo_url !== authUser.user_metadata?.avatar_url) {
                        authMetadata.avatar_url = photo_url;
                    }
                }

                if (Object.keys(authMetadata).length > 0) {
                    return supabase.auth.updateUser({ data: authMetadata });
                }
            })
            .catch((err) =>
                console.warn("[updateUserProfile] auth metadata error:", err),
            );
    }

    return data;
};
