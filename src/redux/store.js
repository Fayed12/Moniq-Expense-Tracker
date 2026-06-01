// redux
import { configureStore } from "@reduxjs/toolkit";

// theme
import themeReducer from "./theme/themeSlice";
import authReducer from "./auth/authSlice";
import userReducer from "./auth/userSlice";
import transactionsReducer from "./transactionsSlice";
import accountsReducer from "./accountsSlice";
import budgetsReducer from "./budgetsSlice";
import categoriesReducer from "./categoriesSlice";
import goalsReducer from "./goalsSlice";
import notificationsReducer from "./notificationsSlice";

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer,
        user: userReducer,
        transactions: transactionsReducer,
        accounts: accountsReducer,
        budgets: budgetsReducer,
        categories: categoriesReducer,
        goals: goalsReducer,
        notifications: notificationsReducer,
    },
});

export default store;
