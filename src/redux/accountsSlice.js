import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchAccounts,
    fetchAllAccounts,
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

export const loadAllAccounts = createAsyncThunk(
    "accounts/loadAll",
    async (userId, { rejectWithValue }) => {
        try {
            return await fetchAllAccounts(userId);
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
    initialState: { items: [], archivedItems: [], loading: false, error: null },
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
            state.archivedItems = state.archivedItems.filter((a) => a.id !== payload.id);
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
            // loadAll — populates both active and archived
            .addCase(loadAllAccounts.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadAllAccounts.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload.filter((a) => !a.is_archived);
                s.archivedItems = payload.filter((a) => a.is_archived);
            })
            .addCase(loadAllAccounts.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            .addCase(createAccount.fulfilled, (s, { payload }) => {
                s.items.push(payload);
            })
            .addCase(editAccount.fulfilled, (s, { payload }) => {
                // If the account was unarchived, move from archivedItems to items
                const archivedIdx = s.archivedItems.findIndex((a) => a.id === payload.id);
                if (archivedIdx !== -1 && !payload.is_archived) {
                    s.archivedItems.splice(archivedIdx, 1);
                    s.items.push(payload);
                    return;
                }

                const i = s.items.findIndex((a) => a.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            })
            .addCase(removeAccount.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((a) => a.id !== payload);
                s.archivedItems = s.archivedItems.filter((a) => a.id !== payload);
            })
            .addCase(doArchiveAccount.fulfilled, (s, { payload }) => {
                // Move from items to archivedItems
                s.items = s.items.filter((a) => a.id !== payload.id);
                if (!s.archivedItems.find((a) => a.id === payload.id)) {
                    s.archivedItems.push(payload);
                }
            });
    },
});

export const { rtUpdateAccount, rtInsertAccount, rtDeleteAccount } = accountsSlice.actions;

export default accountsSlice.reducer;
