import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // ✅ sirf ye use hoga

// ✅ LOGIN
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/login", credentials);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login Failed!"
            );
        }
    }
);

// ✅ REGISTER
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/register", userData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Registration failed!"
            );
        }
    }
);

// ✅ LOGOUT
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/auth/logout");
            return null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Logout failed!"
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: false,
        loading: false,
        error: null,
    },
    reducers: {
        setLogin: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = !!action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setLogout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // LOGOUT
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isLoggedIn = false;
                state.loading = false;
            })

            // REGISTER
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setLogin, setLoading, setLogout } = authSlice.actions;
export default authSlice.reducer;