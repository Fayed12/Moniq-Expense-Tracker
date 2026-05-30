import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchBudgets,
    upsertBudget,
    updateBudget,
    deleteBudget,
} from "../services/Budgets/BudgetsService";

export const loadBudgets = createAsyncThunk(
    "budgets/load",
    async ({ userId, month }, { rejectWithValue }) => {
        try {
            return await fetchBudgets(userId, month);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const saveBudget = createAsyncThunk(
    "budgets/upsert",
    async (payload, { rejectWithValue }) => {
        try {
            return await upsertBudget(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const editBudget = createAsyncThunk(
    "budgets/edit",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateBudget(id, changes);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const removeBudget = createAsyncThunk(
    "budgets/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteBudget(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

const budgetsSlice = createSlice({
    name: "budgets",
    initialState: {
        items: [],
        currentMonth: new Date().toISOString().slice(0, 7),
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentMonth(state, { payload }) {
            state.currentMonth = payload;
        },
        rtUpdateBudget(state, { payload }) {
            const i = state.items.findIndex((b) => b.id === payload.id);
            if (i !== -1) state.items[i] = payload;
        },
        rtInsertBudget(state, { payload }) {
            if (!state.items.find((b) => b.id === payload.id))
                state.items.unshift(payload);
        },
        rtDeleteBudget(state, { payload }) {
            state.items = state.items.filter((b) => b.id !== payload.id);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadBudgets.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadBudgets.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload;
            })
            .addCase(loadBudgets.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            .addCase(saveBudget.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((b) => b.id === payload.id);
                if (i !== -1) s.items[i] = payload;
                else s.items.unshift(payload);
            })
            .addCase(editBudget.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((b) => b.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            })
            .addCase(removeBudget.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((b) => b.id !== payload);
            });
    },
});
export const {
    setCurrentMonth,
    rtUpdateBudget,
    rtInsertBudget,
    rtDeleteBudget,
} = budgetsSlice.actions;

export default budgetsSlice.reducer;
