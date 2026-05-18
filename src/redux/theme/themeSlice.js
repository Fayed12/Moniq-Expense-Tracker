// redux
import { createSlice } from "@reduxjs/toolkit";

const initialData = {
    themeValue: sessionStorage.getItem("themeValue") || "light"
}

const themeSlice = createSlice({
    name: "theme",
    initialState: initialData,
    reducers: {
        toggleTheme: (state) => {
            state.themeValue = state.themeValue === "light" ? "dark" : "light";
            sessionStorage.setItem("themeValue", state.themeValue);
        }
    }
})

export default themeSlice.reducer

export const { toggleTheme } = themeSlice.actions

export const themeSelector = (state) => state.theme.themeValue