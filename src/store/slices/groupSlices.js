import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

export const createGroupAction = createAsyncThunk(
    "group/create",
    async (groupData, { rejectWithValue }) => {
        try {
            const response = await api.post("/group/create", groupData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || "Group banane mein error!");
        }
    }
);

export const joinGroupAction = createAsyncThunk(
    "group/join",
    async (joinData, { rejectWithValue }) => {
        try {
            const response = await api.post("/group/join", joinData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || "Join karne mein error!");
        }
    }
);

export const getGroupDetailsAction = createAsyncThunk(
    "group/getDetails",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/group/details");
            return response.data.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Group details nahi mil payi!");
        }
    }
);

export const toggleStatusAction = createAsyncThunk(
    "group/toggleStatus",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.patch("/group/toggle-status");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const requestInactiveAction = createAsyncThunk(
    "group/requestInactive",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.patch("/group/request-inactive");
            return response.data.data; 
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const approveInactiveAction = createAsyncThunk(
    "group/approveInactive",
    async (targetUserId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/group/approve-inactive/${targetUserId}`);
            return response.data.data; 
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const groupSlice = createSlice({
    name: "group",
    initialState: {
        currentGroup: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearGroupError: (state) => {
            state.error = null;
        },
        setGroup: (state, action) => {
            state.currentGroup = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createGroupAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(createGroupAction.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGroup = action.payload;
                toast.success("Group Successfully Ban Gaya!");
            })
            .addCase(createGroupAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            .addCase(joinGroupAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(joinGroupAction.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGroup = action.payload;
                toast.success("Group Join Ho Gaya!");
            })
            .addCase(joinGroupAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            .addCase(getGroupDetailsAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGroupDetailsAction.fulfilled, (state, action) => {
                state.loading = false;
                console.log("Slice Received Data:", action.payload);
                state.currentGroup = action.payload;
            })
            .addCase(getGroupDetailsAction.rejected, (state, action) => {
                state.loading = false;
                state.currentGroup = null; 
                state.error = action.payload;
            })
            .addCase(toggleStatusAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleStatusAction.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGroup = action.payload; 
            })
            .addCase(toggleStatusAction.rejected, (state) => {
                state.loading = false;
            })
            .addCase(requestInactiveAction.pending, (state) => { state.loading = true; })
            .addCase(requestInactiveAction.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGroup = action.payload;
            })
            .addCase(approveInactiveAction.fulfilled, (state, action) => {
                state.currentGroup = action.payload;
            });
    },
});

export const { clearGroupError, setGroup } = groupSlice.actions;
export default groupSlice.reducer;