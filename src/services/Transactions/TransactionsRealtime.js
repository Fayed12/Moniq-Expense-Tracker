// config for transactions realtime
import { supabase } from "../../config/supabase";

// ─────────────────────────────────────────────
// REALTIME SUBSCRIPTION
// events: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
// callback receives { eventType, newRow, oldRow }
// ─────────────────────────────────────────────
export const subscribeToTransactions = (userId, callback) => {
    const channel = supabase
        .channel(`transactions:${userId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "transactions",
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
