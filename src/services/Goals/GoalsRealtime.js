// config
import { supabase } from "../../config/supabase";

export const subscribeToGoals = (userId, callback) => {
    const channel = supabase
        .channel(`goals:${userId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "goals",
                filter: `uid=eq.${userId}`,
            },
            (payload) =>
                callback({
                    eventType: payload.eventType,
                    newRow: payload.new,
                    oldRow: payload.old,
                }),
        )
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "goal_contributions",
                filter: `uid=eq.${userId}`,
            },
            (payload) =>
                callback({
                    eventType: payload.eventType,
                    newRow: payload.new,
                    oldRow: payload.old,
                    table: "goal_contributions",
                }),
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
};
