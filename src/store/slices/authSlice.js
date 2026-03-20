import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../api/axios.js";
import axios from "axios";

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post("https://management-backend-a3je.onrender.com/api/v1/auth/login", credentials);
            return response.data.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login Failed!");
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post("https://management-backend-a3je.onrender.com/api/v1/auth/register", userData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Registration failed!");
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post("https://management-backend-a3je.onrender.com/api/v1/auth/logout");
            return null;
        } catch (error) {
            return rejectWithValue("Something went Wrong when Logout user!");
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
        // Manual logout ke liye
        setLogout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
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
            
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isLoggedIn = false;
                state.loading = false;
            })

            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.user = action.payload.user;
            });
    },
});

export const { setLogin, setLoading, setLogout } = authSlice.actions;
export default authSlice.reducer;