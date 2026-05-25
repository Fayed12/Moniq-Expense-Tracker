import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchAccounts,
    insertAccount,
    updateAccount,
    archiveAccount,
    deleteAccount,
    transferBetweenAccounts,
} from "../services/Accounts/AccountsService";

export const loadAccounts = createAsyncThunk(
    "accounts/load",
    async (userId, { rejectWithValue }) => {
        try {
            return await fetchAccounts(userId);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const createAccount = createAsyncThunk(
    "accounts/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await insertAccount(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const editAccount = createAsyncThunk(
    "accounts/edit",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateAccount(id, changes);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const removeAccount = createAsyncThunk(
    "accounts/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteAccount(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const doArchiveAccount = createAsyncThunk(
    "accounts/archive",
    async (id, { rejectWithValue }) => {
        try {
            return await archiveAccount(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const doTransfer = createAsyncThunk(
    "accounts/transfer",
    async (payload, { rejectWithValue }) => {
        try {
            return await transferBetweenAccounts(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

const accountsSlice = createSlice({
    name: "accounts",
    initialState: { items: [], loading: false, error: null },
    reducers: {
        rtUpdateAccount(state, { payload }) {
            const i = state.items.findIndex((a) => a.id === payload.id);
            if (i !== -1) state.items[i] = payload;
        },
        rtInsertAccount(state, { payload }) {
            if (!state.items.find((a) => a.id === payload.id))
                state.items.push(payload);
        },
        rtDeleteAccount(state, { payload }) {
            state.items = state.items.filter((a) => a.id !== payload.id);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadAccounts.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadAccounts.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload;
            })
            .addCase(loadAccounts.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            .addCase(createAccount.fulfilled, (s, { payload }) => {
                s.items.push(payload);
            })
            .addCase(editAccount.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((a) => a.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            })
            .addCase(removeAccount.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((a) => a.id !== payload);
            })
            .addCase(doArchiveAccount.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((a) => a.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            });
    },
});

export const { rtUpdateAccount, rtInsertAccount, rtDeleteAccount } = accountsSlice.actions;

export default accountsSlice.reducer;
