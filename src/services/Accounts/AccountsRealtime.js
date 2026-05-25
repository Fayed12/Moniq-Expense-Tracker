// config
import { supabase } from "../../config/supabase";

export const subscribeToAccounts = (userId, callback) => {
    const channel = supabase
        .channel(`accounts:${userId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "accounts",
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
