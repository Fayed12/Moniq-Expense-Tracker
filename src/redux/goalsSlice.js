import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchGoals,
    insertGoal,
    updateGoal,
    deleteGoal,
    insertContribution,
    deleteContribution,
    fetchContributions,
} from "../services/Goals/GoalsService";

export const loadGoals = createAsyncThunk(
    "goals/load",
    async (userId, { rejectWithValue }) => {
        try {
            return await fetchGoals(userId);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const createGoal = createAsyncThunk(
    "goals/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await insertGoal(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const editGoal = createAsyncThunk(
    "goals/edit",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateGoal(id, changes);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const removeGoal = createAsyncThunk(
    "goals/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteGoal(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const addContribution = createAsyncThunk(
    "goals/addContribution",
    async (payload, { rejectWithValue }) => {
        try {
            return await insertContribution(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const loadContributions = createAsyncThunk(
    "goals/loadContributions",
    async (goalId, { rejectWithValue }) => {
        try {
            return { goalId, data: await fetchContributions(goalId) };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);


export const doRemoveContribution = createAsyncThunk(
    "goals/removeContribution",
    async (id, { rejectWithValue }) => {
        try {
            return await deleteContribution(id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    },
);

const goalsSlice = createSlice({
    name: "goals",
    initialState: { items: [], contributions: {}, loading: false, error: null },
    reducers: {
        rtUpdateGoal(state, { payload }) {
            const i = state.items.findIndex((g) => g.id === payload.id);
            if (i !== -1) state.items[i] = payload;
        },
        rtInsertGoal(state, { payload }) {
            if (!state.items.find((g) => g.id === payload.id))
                state.items.push(payload);
        },
        rtDeleteGoal(state, { payload }) {
            state.items = state.items.filter((g) => g.id !== payload.id);
        },
        rtInsertContribution(state, { payload }) {
            if (!state.contributions[payload.goal_id])
                state.contributions[payload.goal_id] = [];
            state.contributions[payload.goal_id].unshift(payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadGoals.pending, (s) => {
                s.loading = true;
            })
            .addCase(loadGoals.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload;
            })
            .addCase(loadGoals.rejected, (s, { payload }) => {
                s.loading = false;
                s.error = payload;
            })
            .addCase(createGoal.fulfilled, (s, { payload }) => {
                s.items.push(payload);
            })
            .addCase(editGoal.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((g) => g.id === payload.id);
                if (i !== -1) s.items[i] = payload;
            })
            .addCase(removeGoal.fulfilled, (s, { payload }) => {
                s.items = s.items.filter((g) => g.id !== payload);
            })
            .addCase(addContribution.fulfilled, (s, { payload }) => {
                const i = s.items.findIndex((g) => g.id === payload.goal.id);
                if (i !== -1) s.items[i] = payload.goal;
                if (!s.contributions[payload.contribution.goal_id])
                    s.contributions[payload.contribution.goal_id] = [];
                s.contributions[payload.contribution.goal_id].unshift(
                    payload.contribution,
                );
            })
            .addCase(loadContributions.fulfilled, (s, { payload }) => {
                s.contributions[payload.goalId] = payload.data;
            })
            .addCase(doRemoveContribution.fulfilled, (s, { payload }) => {
                s.contributions[payload.goal_id] = s.contributions[payload.goal_id].filter((c) => c.id !== payload.id);
            })
    },
});
export const {
    rtUpdateGoal,
    rtInsertGoal,
    rtDeleteGoal,
    rtInsertContribution,
} = goalsSlice.actions;

export default goalsSlice.reducer;
