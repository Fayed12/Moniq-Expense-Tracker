import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { subscribeToGoals } from "../services/Goals/GoalsRealtime";
import {
    loadGoals,
    rtInsertGoal,
    rtUpdateGoal,
    rtDeleteGoal,
    rtInsertContribution,
} from "../redux/goalsSlice";

export const useGoals = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;
        dispatch(loadGoals(userId));
    }, [userId, dispatch]);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToGoals(
            userId,
            ({ eventType, newRow, oldRow, table }) => {
                if (table === "goal_contributions") {
                    if (eventType === "INSERT") {
                        dispatch(rtInsertContribution(newRow));
                    }
                    // Handle other event types for contributions if needed
                } else {
                    switch (eventType) {
                        case "INSERT":
                            dispatch(rtInsertGoal(newRow));
                            break;
                        case "UPDATE":
                            dispatch(rtUpdateGoal(newRow));
                            break;
                        case "DELETE":
                            dispatch(rtDeleteGoal(oldRow));
                            break;
                        default:
                            break;
                    }
                }
            },
        );

        return unsubscribe;
    }, [userId, dispatch]);
};
