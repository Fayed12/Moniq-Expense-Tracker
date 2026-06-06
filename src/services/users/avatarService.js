import { supabase } from "../../config/supabase";

const BUCKET = "avatars";

// make input accepts only images

// ===========================================================================
// upload an image for user profile picture
// ===========================================================================
export async function uploadAvatar(uid, file) {
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${uid}/avatar.${ext}`;

    // upsert: true replaces existing file without error
    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: "3600",
        });

    if (uploadError) throw uploadError;

    const publicUrl = getAvatarUrl(uid, ext);

    // Persist URL to users table
    const { error: dbError } = await supabase
        .from("users")
        .update({ photo_url: publicUrl })
        .eq("uid", uid);

    if (dbError) throw dbError;

    // Sync avatar_url to auth metadata (fire-and-forget)
    supabase.auth
        .updateUser({ data: { avatar_url: publicUrl } })
        .catch((err) =>
            console.warn("[uploadAvatar] auth metadata sync failed:", err),
        );

    return { publicUrl };
}

// ===========================================================================
// delete an image for user profile picture
// ===========================================================================
export async function deleteAvatar(uid) {
    // List all files under uid/ to find the avatar regardless of extension
    const { data: files, error: listError } = await supabase.storage
        .from(BUCKET)
        .list(uid);

    if (listError) throw listError;

    if (files && files.length > 0) {
        const paths = files.map((f) => `${uid}/${f.name}`);
        const { error: removeError } = await supabase.storage
            .from(BUCKET)
            .remove(paths);
        if (removeError) throw removeError;
    }

    const { error: dbError } = await supabase
        .from("users")
        .update({ photo_url: null })
        .eq("uid", uid);

    if (dbError) throw dbError;

    // Clear avatar_url from auth metadata (fire-and-forget)
    supabase.auth
        .updateUser({ data: { avatar_url: null } })
        .catch((err) =>
            console.warn("[deleteAvatar] auth metadata sync failed:", err),
        );
}

// ===========================================================================
// get an image for user profile picture
// ===========================================================================
export function getAvatarUrl(uid, ext = "jpg", bustCache = false) {
    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${uid}/avatar.${ext}`);

    if (bustCache) {
        return `${data.publicUrl}?t=${Date.now()}`;
    }
    return data.publicUrl;
}

// ===========================================================================
// resolve an image for user profile picture
// ===========================================================================
export function resolveAvatarUrl(photoUrl, fallback = "") {
    if (!photoUrl) return fallback;
    // Append cache-bust so React re-renders after upload
    return `${photoUrl}?t=${Math.floor(Date.now() / 60000)}`; // refreshes every minute
}
