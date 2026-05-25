import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchTransactions,
    fetchTransactionById,
    insertTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
} from "../services/Transactions/TransactionsService.js";

// ── Thunks ────────────────────────────────────────────────────
export const loadTransactions = createAsyncThunk(
    "transactions/load",
    async ({ userId, filters }, { rejectWithValue }) => {
        try {
            return await fetchTransactions(userId, filters);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const loadTransactionById = createAsyncThunk(
    "transactions/loadOne",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchTransactionById(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const createTransaction = createAsyncThunk(
    "transactions/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await insertTransaction(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const editTransaction = createAsyncThunk(
    "transactions/edit",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateTransaction(id, changes);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const removeTransaction = createAsyncThunk(
    "transactions/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteTransaction(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

export const removeTransactions = createAsyncThunk(
    "transactions/removeMany",
    async (ids, { rejectWithValue }) => {
        try {
            return await deleteTransactions(ids);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

// ── Slice ─────────────────────────────────────────────────────
const transactionsSlice = createSlice({
    name: "transactions",
    initialState: {
        items: [],
        selected: null,
        loading: false,
        error: null,
        filters: {
            type: null,
            categoryId: null,
            accountId: null,
            search: "",
            tags: [],
        },
    },
    reducers: {
        setFilters(state, { payload }) {
            state.filters = { ...state.filters, ...payload };
        },
        clearFilters(state) {
            state.filters = {
                type: null,
                categoryId: null,
                accountId: null,
                search: "",
                tags: [],
            };
        },
        setSelected(state, { payload }) {
            state.selected = payload;
        },
        clearError(state) {
            state.error = null;
        },
        // ── Realtime patches ──────────────────────────────────────
        rtInsert(state, { payload }) {
            if (!state.items.find((t) => t.id === payload.id)) {
                state.items.unshift(payload);
            }
        },
        rtUpdate(state, { payload }) {
            const i = state.items.findIndex((t) => t.id === payload.id);
            if (i !== -1) state.items[i] = payload;
            if (state.selected?.id === payload.id) state.selected = payload;
        },
        rtDelete(state, { payload }) {
            state.items = state.items.filter((t) => t.id !== payload.id);
            if (state.selected?.id === payload.id) state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // load
            .addCase(loadTransactions.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(loadTransactions.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload;
            })
            .addCase(loadTransactions.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            // loadOne
            .addCase(loadTransactionById.fulfilled, (s, { payload }) => {
                s.selected = payload;
            })
            // create
            .addCase(createTransaction.pending, (s) => {
                s.loading = true;
            })
            .addCase(createTransaction.fulfilled, (s, { payload }) => {
                s.loading = false;
                if (!s.items.find((t) => t.id === payload.id))
                    s.items.unshift(payload);
            })
            .addCase(createTransaction.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            // edit
            .addCase(editTransaction.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((t) => t.id === payload.id);
                if (i !== -1) s.items[i] = payload;
                if (s.selected?.id === payload.id) s.selected = payload;
            })
            .addCase(editTransaction.rejected, (s, { payload }) => {
                s.error = payload;
            })
            // remove
            .addCase(removeTransaction.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((t) => t.id !== payload);
                if (s.selected?.id === payload) s.selected = null;
            })
            .addCase(removeTransaction.rejected, (s, { payload }) => {
                s.error = payload;
            })
            // removeMany
            .addCase(removeTransactions.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((t) => !payload.includes(t.id));
            });
    },
});

export const {
    setFilters,
    clearFilters,
    setSelected,
    clearError,
    rtInsert,
    rtUpdate,
    rtDelete,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
