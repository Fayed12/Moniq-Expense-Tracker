// src/store/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { uploadAvatar, deleteAvatar } from "../../services/users/avatarService";


export const uploadAvatarThunk = createAsyncThunk(
    "user/uploadAvatar",
    async ({ uid, file }, { rejectWithValue }) => {
        try {
            const result = await uploadAvatar(uid, file);
            return result;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to upload avatar");
        }
    },
);


export const deleteAvatarThunk = createAsyncThunk(
    "user/deleteAvatar",
    async ({ uid }, { rejectWithValue }) => {
        try {
            await deleteAvatar(uid);
            return null;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to delete avatar");
        }
    },
);

const initialState = {
    uid: null,
    display_name: "",
    email: "",
    photo_url: null,
    currency: "USD",
    locale: "en-US",
    avatarStatus: "idle",
    avatarError: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            return { ...state, ...action.payload };
        },
        clearUser() {
            return initialState;
        },
        // Optimistic update (set immediately before server confirms)
        setPhotoUrl(state, action) {
            state.photo_url = action.payload;
        },
        resetAvatarStatus(state) {
            state.avatarStatus = "idle";
            state.avatarError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadAvatarThunk.pending, (state) => {
                state.avatarStatus = "uploading";
                state.avatarError = null;
            })
            .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
                state.avatarStatus = "success";
                state.photo_url = action.payload.publicUrl;
            })
            .addCase(uploadAvatarThunk.rejected, (state, action) => {
                state.avatarStatus = "error";
                state.avatarError = action.payload;
            });

        builder
            .addCase(deleteAvatarThunk.pending, (state) => {
                state.avatarStatus = "deleting";
                state.avatarError = null;
            })
            .addCase(deleteAvatarThunk.fulfilled, (state) => {
                state.avatarStatus = "idle";
                state.photo_url = null;
            })
            .addCase(deleteAvatarThunk.rejected, (state, action) => {
                state.avatarStatus = "error";
                state.avatarError = action.payload;
            });
    },
});

export const { setUser, clearUser, setPhotoUrl, resetAvatarStatus } =
    userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectPhotoUrl = (state) => state.user.photo_url;
export const selectAvatarStatus = (state) => state.user.avatarStatus;
export const selectAvatarError = (state) => state.user.avatarError;
