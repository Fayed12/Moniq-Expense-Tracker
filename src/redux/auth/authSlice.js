// redux
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// services
import * as authSvc from "../../services/users/auth";

// ── Thunks ─────────────────────────────────────────────────
export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ newUser, ...credentials }, { rejectWithValue }) => {
        try {

            // send email and password as credentials object then destruct this object before using inside function
            const data = await authSvc.signUp(credentials);
            return await authSvc.createUserProfile({ ...newUser, uid: data.user.id });
        } catch (err) {
            return rejectWithValue(err.message);
        }
    },
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await authSvc.signIn(credentials);
            const profile = await authSvc.fetchUserProfile(data.user.id);
            return { session: data.session, profile };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    },
);

export const loginWithGoogle = createAsyncThunk(
    "auth/loginGoogle",
    async (newUser, { rejectWithValue }) => {
        try {
            const data = await authSvc.signInWithGoogle();

            const mergedUser = {
                uid: data.user.id,
                display_name: data.user.user_metadata.full_name,
                email: data.user.email,
                ...newUser
            }

            const profile = await authSvc.createUserProfile(mergedUser);
            return { session: data.session, profile };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    },
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await authSvc.signOut();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    },
);

export const loadSession = createAsyncThunk(
    "auth/loadSession",
    async (_, { rejectWithValue }) => {
        try {
            const session = await authSvc.getSession();
            if (!session) return null;
            const profile = await authSvc.fetchUserProfile(session.user.id);
            return { session, profile };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    },
);

// ── Slice ──────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null, 
        profile: null, 
        session: null,
        loading: true,
        error: null,
        emailConfirmSent: false,
    },
    reducers: {
        // Called by onAuthStateChange listener
        setSession: (state, action) => {
            state.session = action.payload.session;
            state.user = action.payload.session?.user ?? null;
            state.loading = false;
        },
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        clearAuth: (state) => {
            state.user = null;
            state.profile = null;
            state.session = null;
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Load session on app boot
            .addCase(loadSession.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadSession.fulfilled, (s, a) => {
                s.loading = false;
                if (a.payload) {
                    s.session = a.payload.session;
                    s.user = a.payload.session.user;
                    s.profile = a.payload.profile;
                }
            })
            .addCase(loadSession.rejected, (s) => {
                s.loading = false;
            })

            // Sign up
            .addCase(registerUser.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(registerUser.fulfilled, (s) => {
                s.loading = false;
                s.emailConfirmSent = true; // show "check your email" screen
            })
            .addCase(registerUser.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload;
            })

            // Log in
            .addCase(loginUser.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(loginUser.fulfilled, (s, a) => {
                s.loading = false;
                s.session = a.payload.session;
                s.user = a.payload.session.user;
                s.profile = a.payload.profile;
            })
            .addCase(loginUser.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload;
            })

            // Google login (redirect — loading handled by AuthCallback)
            .addCase(loginWithGoogle.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(loginWithGoogle.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload;
            })

            // Log out
            .addCase(logoutUser.fulfilled, (s) => {
                s.user = null;
                s.profile = null;
                s.session = null;
                s.loading = false;
            });
    },
});

export const { setSession, setProfile, clearAuth, clearError } =
    authSlice.actions;
export default authSlice.reducer;
