import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { subscribeToCategories } from "../services/Categories/CategoriesRealtime";
import {
    loadCategories,
    rtInsertCategory,
    rtUpdateCategory,
    rtDeleteCategory,
} from "../redux/categoriesSlice";

export const useCategories = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;
        dispatch(loadCategories(userId));
    }, [userId, dispatch]);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToCategories(
            userId,
            ({ eventType, newRow, oldRow }) => {
                switch (eventType) {
                    case "INSERT":
                        dispatch(rtInsertCategory(newRow));
                        break;
                    case "UPDATE":
                        dispatch(rtUpdateCategory(newRow));
                        break;
                    case "DELETE":
                        dispatch(rtDeleteCategory(oldRow));
                        break;
                    default:
                        break;
                }
            },
        );

        return unsubscribe;
    }, [userId, dispatch]);
};
