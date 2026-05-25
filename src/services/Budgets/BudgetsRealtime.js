// config
import { supabase } from "../../config/supabase";

export const subscribeToBudgets = (userId, callback) => {
    const channel = supabase
        .channel(`budgets:${userId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "budgets",
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
