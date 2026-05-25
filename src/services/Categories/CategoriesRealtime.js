// config
import { supabase } from "../../config/supabase";

export const subscribeToCategories = (userId, callback) => {
    const channel = supabase
        .channel(`categories:${userId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "categories",
                filter: `uid=eq.${userId}`,
            },
            (payload) =>
                callback({
                    eventType: payload.eventType,
                    newRow: payload.new,
                    oldRow: payload.old,
                }),
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
};