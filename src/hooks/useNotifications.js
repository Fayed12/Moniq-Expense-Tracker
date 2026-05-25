import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { subscribeToNotifications } from "../services/Notifications/NotificationsRealtime";
import {
    loadNotifications,
    rtInsertNotification,
    rtUpdateNotification,
    rtDeleteNotification,
} from "../redux/notificationsSlice";

export const useNotifications = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;
        dispatch(loadNotifications(userId));
    }, [userId, dispatch]);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToNotifications(
            userId,
            ({ eventType, newRow, oldRow }) => {
                switch (eventType) {
                    case "INSERT":
                        dispatch(rtInsertNotification(newRow));
                        break;
                    case "UPDATE":
                        dispatch(rtUpdateNotification(newRow));
                        break;
                    case "DELETE":
                        dispatch(rtDeleteNotification(oldRow));
                        break;
                    default:
                        break;
                }
            },
        );

        return unsubscribe;
    }, [userId, dispatch]);
};
