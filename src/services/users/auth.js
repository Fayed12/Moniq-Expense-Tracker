import { supabase } from "../../config/supabase";
import { toast } from "react-toastify";

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

export const updateUserProfile = async (userId, changes) => {
    // 1. Retrieve the fresh authenticated user directly from the server to avoid cache mismatch issues
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    const authUpdates = {};
    const metadataUpdates = {};
    const dbChanges = { ...changes };

    // Only update email in auth if it has actually changed from the current confirmed auth email
    if (changes.email) {
        const cleanEmail = changes.email.trim().toLowerCase();
        if (authUser && cleanEmail !== authUser.email?.toLowerCase()) {
            authUpdates.email = cleanEmail;
            // Do NOT update the public database table's email immediately,
            // because it is pending confirmation. It will be synced via the self-healing
            // hook in useAuth once they confirm the email change.
            delete dbChanges.email;
        }
    }

    // Only update metadata display_name if it differs from current session metadata
    if (changes.display_name !== undefined) {
        const cleanName = changes.display_name.trim();
        if (authUser && cleanName !== authUser.user_metadata?.full_name) {
            metadataUpdates.full_name = cleanName;
        }
    }

    // Only update metadata photo_url if it differs from current session metadata
    if (changes.photo_url !== undefined) {
        if (
            authUser &&
            changes.photo_url !== authUser.user_metadata?.avatar_url
        ) {
            metadataUpdates.avatar_url = changes.photo_url;
        }
    }

    if (Object.keys(metadataUpdates).length > 0) {
        authUpdates.data = metadataUpdates;
    }

    if (Object.keys(authUpdates).length > 0) {
        try {
            console.log("Dispatching Supabase Auth update:", authUpdates);
            const { error: authError } = await supabase.auth.updateUser(
                authUpdates,
                {
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard/profile`,
                    },
                },
            );
            if (authError) {
                console.warn("Supabase Auth update failed:", authError.message);
                toast.warning(`Auth notice: ${authError.message}`);
            }
        } catch (err) {
            console.warn("Auth update catch block error:", err);
        }
    }

    // 2. Persist profile changes to public.users table (excluding unconfirmed email if deleted above)
    const { data, error } = await supabase
        .from("users")
        .update({ ...dbChanges, updated_at: new Date() })
        .eq("uid", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// export const updateUserProfile = async (userId, changes) => {
//     // ── 1. Separate auth-level fields from table-level fields ──
//     const { email, display_name, photo_url, ...tableOnlyChanges } = changes;

//     // Build the public.users update payload
//     // updated_at is handled automatically by trg_users_updated_at trigger
//     const tableUpdate = { ...tableOnlyChanges };

//     if (email !== undefined) tableUpdate.email = email.trim().toLowerCase();

//     if (display_name !== undefined) tableUpdate.display_name = display_name.trim();

//     if (photo_url !== undefined) tableUpdate.photo_url = photo_url;

//     if (Object.keys(tableUpdate).length === 0) {
//         throw new Error("No changes provided.");
//     }

//     // ── 2. Update public.users first (this is always the source of truth) ──
//     const { data, error: dbError } = await supabase
//         .from("users")
//         .update(tableUpdate)
//         .eq("uid", userId)
//         .select()
//         .single();

//     if (dbError) throw dbError;

//     // ── 3. Sync auth metadata for display_name and photo_url ──

//     const authMetadata = {};
//     if (display_name !== undefined) authMetadata.full_name = display_name.trim();
//     if (photo_url !== undefined) authMetadata.avatar_url = photo_url;

//     if (Object.keys(authMetadata).length > 0) {
//         const { error: metaError } = await supabase.auth.updateUser({
//             data: authMetadata,
//         });
//         if (metaError) {
//             // Non-fatal: public.users is already updated, log and continue
//             console.warn(
//                 "[updateUserProfile] auth metadata sync failed:",
//                 metaError.message,
//             );
//         }
//     }

//     // ── 4. Handle email: trigger confirmation flow ──
//     let emailConfirmationSent = false;

//     if (email !== undefined) {
//         const cleanEmail = email.trim().toLowerCase();

//         // Get the current confirmed email from auth (not from session cache)
//         const {
//             data: { user: authUser },
//             error: getUserError,
//         } = await supabase.auth.getUser();

//         if (getUserError) {
//             console.warn(
//                 "[updateUserProfile] getUser failed:",
//                 getUserError.message,
//             );
//         } else if (authUser && cleanEmail !== authUser.email?.toLowerCase()) {
//             // Email actually changed → send confirmation
//             const { error: emailError } = await supabase.auth.updateUser({
//                 email: cleanEmail,
//             });

//             if (emailError) {
//                 // Common cause: "Email rate limit exceeded" or "same as current"
//                 // public.users is already updated — just warn
//                 console.warn(
//                     "[updateUserProfile] auth email update failed:",
//                     emailError.message,
//                 );
//             } else {
//                 emailConfirmationSent = true;
//             }
//         }
//         // If cleanEmail === authUser.email, the email is already confirmed — nothing to do
//     }

//     return { data, emailConfirmationSent };
// };
