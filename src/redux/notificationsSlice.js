import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    fetchNotifications,
    insertNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
} from "../services/Notifications/NotificationsService";

export const loadNotifications = createAsyncThunk(
    "notifications/load",
    async (userId, { rejectWithValue }) => {
        try {
            return await fetchNotifications(userId);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);
export const addNotification = createAsyncThunk(
    "notifications/add",
    async (payload, { rejectWithValue }) => {
        try {
            return await insertNotification(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);
export const readNotification = createAsyncThunk(
    "notifications/read",
    async (id, { rejectWithValue }) => {
        try {
            return await markNotificationRead(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);
export const readAllNotifications = createAsyncThunk(
    "notifications/readAll",
    async (userId, { rejectWithValue }) => {
        try {
            await markAllNotificationsRead(userId);
            return true;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);
export const removeNotification = createAsyncThunk(
    "notifications/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteNotification(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);
export const clearNotifications = createAsyncThunk(
    "notifications/clearAll",
    async (userId, { rejectWithValue }) => {
        try {
            await deleteAllNotifications(userId);
            return true;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: { items: [], loading: false, error: null },
    reducers: {
        rtInsertNotification(state, { payload }) {
            state.items.unshift(payload);
        },
        rtUpdateNotification(state, { payload }) {
            const i = state.items.findIndex((n) => n.id === payload.id);
            if (i !== -1) state.items[i] = payload;
        },
        rtDeleteNotification(state, { payload }) {
            state.items = state.items.filter((n) => n.id !== payload.id);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadNotifications.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadNotifications.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload;
            })
            .addCase(loadNotifications.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            .addCase(addNotification.fulfilled, (s, { payload }) => {
                s.items.unshift(payload);
            })
            .addCase(readNotification.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((n) => n.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            })
            .addCase(readAllNotifications.fulfilled, (s) => {
                s.items = s.items.map((n) => ({ ...n, is_read: true }));
            })
            .addCase(removeNotification.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((n) => n.id !== payload);
            })
            .addCase(clearNotifications.fulfilled, (s) => {
                s.items = [];
            });
    },
});
export const {
    rtInsertNotification,
    rtUpdateNotification,
    rtDeleteNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
