// redux
import { configureStore } from "@reduxjs/toolkit";

// theme
import themeReducer from "./theme/themeSlice";
import authReducer from "./auth/authSlice"

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer
    }
})

export default store