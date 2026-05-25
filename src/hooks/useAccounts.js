import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { subscribeToAccounts } from "../services/Accounts/AccountsRealtime";
import {
    loadAccounts,
    rtInsertAccount,
    rtUpdateAccount,
    rtDeleteAccount,
} from "../redux/accountsSlice";

export const useAccounts = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;
        dispatch(loadAccounts(userId));
    }, [userId, dispatch]);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToAccounts(
            userId,
            ({ eventType, newRow, oldRow }) => {
                switch (eventType) {
                    case "INSERT":
                        dispatch(rtInsertAccount(newRow));
                        break;
                    case "UPDATE":
                        dispatch(rtUpdateAccount(newRow));
                        break;
                    case "DELETE":
                        dispatch(rtDeleteAccount(oldRow));
                        break;
                    default:
                        break;
                }
            },
        );

        return unsubscribe;
    }, [userId, dispatch]);
};
