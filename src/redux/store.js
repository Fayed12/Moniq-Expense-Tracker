// redux
import { configureStore } from "@reduxjs/toolkit";

// theme
import themeReducer from "./theme/themeSlice";

export const store = configureStore({
    reducer: {
        theme: themeReducer
    }
})

export default store