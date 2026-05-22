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
// UPDATE USER PROFILE (settings page)
// ─────────────────────────────────────────────────────────────
export const updateUserProfile = async (userId, changes) => {
    const { data, error } = await supabase
        .from("users")
        .update({ ...changes, updated_at: new Date() })
        .eq("uid", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
