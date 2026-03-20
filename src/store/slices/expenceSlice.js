import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import { toast } from "react-hot-toast";

export const fetchExpensesAction = createAsyncThunk(
  "expense/fetchAll",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/expense/group/${groupId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Kharche fetch nahi ho paye!");
    }
  }
);

// 2. Add new expense
export const createExpenseAction = createAsyncThunk(
  "expense/create",
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/expense/add", expenseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Expense add karne mein error!");
    }
  }
);

// 3. Approve an expense
export const approveExpenseAction = createAsyncThunk(
  "expense/approve",
  async (expenseId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/expense/approve/${expenseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Approve nahi ho paya!");
    }
  }
);

const expenseSlice = createSlice({
  name: "expense",
  initialState: {
    expenses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpensesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpensesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpensesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Expense
      .addCase(createExpenseAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createExpenseAction.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload); // Naya kharcha list mein sabse upar dikhega
        toast.success("Kharcha add ho gaya! Approval pending hai.");
      })

      // Approve Expense
      .addCase(approveExpenseAction.fulfilled, (state, action) => {
        // List mein us expense ko update kar do jo approve hua hai
        const index = state.expenses.findIndex(exp => exp._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        toast.success("Aapka approval record ho gaya!");
      });
  },
});

export const { clearExpenseError } = expenseSlice.actions;
export default expenseSlice.reducer;