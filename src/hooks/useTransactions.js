import { useEffect } from "react";
import { useDispatch } from "react-redux";

// services
import { subscribeToTransactions } from "../services/Transactions/transactionsRealtime";

// slice actions
import {
    loadTransactions,
    rtInsert,
    rtUpdate,
    rtDelete,
} from "../redux/transactionsSlice";

export const useTransactions = (userId) => {
    const dispatch = useDispatch();

    // Initial fetch
    useEffect(() => {
        if (!userId) return;

        dispatch(
            loadTransactions({
                userId,
            }),
        );
    }, [userId, dispatch]);

    // Realtime listener
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToTransactions(
            userId,
            ({ eventType, newRow, oldRow }) => {
                switch (eventType) {
                    case "INSERT":
                        dispatch(rtInsert(newRow));
                        break;

                    case "UPDATE":
                        dispatch(rtUpdate(newRow));
                        break;

                    case "DELETE":
                        dispatch(rtDelete(oldRow));
                        break;

                    default:
                        break;
                }
            },
        );

        return unsubscribe;
    }, [userId, dispatch]);
};
