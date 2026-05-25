import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { subscribeToBudgets } from "../services/Budgets/BudgetsRealtime";
import {
    loadBudgets,
    rtInsertBudget,
    rtUpdateBudget,
    rtDeleteBudget,
} from "../redux/budgetsSlice";

export const useBudgets = (userId) => {
    const dispatch = useDispatch();
    const currentMonth = useSelector((state) => state.budgets.currentMonth);

    useEffect(() => {
        if (!userId || !currentMonth) return;
        dispatch(loadBudgets({ userId, month: currentMonth }));
    }, [userId, currentMonth, dispatch]);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToBudgets(
            userId,
            ({ eventType, newRow, oldRow }) => {
                switch (eventType) {
                    case "INSERT":
                        dispatch(rtInsertBudget(newRow));
                        break;
                    case "UPDATE":
                        dispatch(rtUpdateBudget(newRow));
                        break;
                    case "DELETE":
                        dispatch(rtDeleteBudget(oldRow));
                        break;
                    default:
                        break;
                }
            },
        );

        return unsubscribe;
    }, [userId, dispatch]);
};
