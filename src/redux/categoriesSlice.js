import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    fetchCategories,
    insertCategory,
    updateCategory,
    archiveCategory,
    deleteCategory,
} from "../services/Categories/CategoriesService.js";

export const loadCategories = createAsyncThunk(
    "categories/load",
    async (userId, { rejectWithValue }) => {
        try {
            return await fetchCategories(userId);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const createCategory = createAsyncThunk(
    "categories/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await insertCategory(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const editCategory = createAsyncThunk(
    "categories/edit",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateCategory(id, changes);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const doArchiveCategory = createAsyncThunk(
    "categories/archive",
    async (id, { rejectWithValue }) => {
        try {
            return await archiveCategory(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const removeCategory = createAsyncThunk(
    "categories/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteCategory(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

const categoriesSlice = createSlice({
    name: "categories",
    initialState: { items: [], loading: false, error: null },
    reducers: {
        rtInsertCategory(state, { payload }) {
            if (!state.items.find((c) => c.id === payload.id))
                state.items.push(payload);
        },
        rtUpdateCategory(state, { payload }) {
            const i = state.items.findIndex((c) => c.id === payload.id);
            if (i !== -1) state.items[i] = payload;
        },
        rtDeleteCategory(state, { payload }) {
            state.items = state.items.filter((c) => c.id !== payload.id);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadCategories.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadCategories.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload;
            })
            .addCase(loadCategories.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            .addCase(createCategory.fulfilled, (s, { payload }) => {
                s.items.push(payload);
            })
            .addCase(editCategory.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((c) => c.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            })
            .addCase(removeCategory.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((c) => c.id !== payload);
            })
            .addCase(doArchiveCategory.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((c) => c.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            });
    },
});

export const { rtInsertCategory, rtUpdateCategory, rtDeleteCategory } = categoriesSlice.actions;

export default categoriesSlice.reducer;
