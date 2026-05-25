// config
import { supabase } from "../../config/supabase";

export const subscribeToNotifications = (userId, callback) => {
    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "notifications",
                filter: `uid=eq.${userId}`,
            },
            (payload) => callback({ eventType: "INSERT", newRow: payload.new }),
        )
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "notifications",
                filter: `uid=eq.${userId}`,
            },
            (payload) =>
                callback({
                    eventType: "UPDATE",
                    newRow: payload.new,
                    oldRow: payload.old,
                }),
        )
        .on(
            "postgres_changes",
            {
                event: "DELETE",
                schema: "public",
                table: "notifications",
                filter: `uid=eq.${userId}`,
            },
            (payload) => callback({ eventType: "DELETE", oldRow: payload.old }),
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
};
