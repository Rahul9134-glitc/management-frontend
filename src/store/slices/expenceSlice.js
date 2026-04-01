import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import api from "../../api/axios"; // ✅ use instance

// ✅ 1. Fetch Expenses
export const fetchExpensesAction = createAsyncThunk(
  "expense/fetchAll",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/expense/group/${groupId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expenses!"
      );
    }
  }
);

// ✅ 2. Add Expense
export const createExpenseAction = createAsyncThunk(
  "expense/create",
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/expense/add", expenseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add expense!"
      );
    }
  }
);

// ✅ 3. Approve Expense
export const approveExpenseAction = createAsyncThunk(
  "expense/approve",
  async (expenseId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/expense/approve/${expenseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve expense!"
      );
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
      // ✅ Fetch Expenses
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

      // ✅ Create Expense
      .addCase(createExpenseAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createExpenseAction.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
        toast.success("Expense added! Approval is pending.");
      })
      .addCase(createExpenseAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ✅ Approve Expense
      .addCase(approveExpenseAction.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(
          (exp) => exp._id === action.payload._id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        toast.success("Expense approved successfully!");
      })
      .addCase(approveExpenseAction.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearExpenseError } = expenseSlice.actions;
export default expenseSlice.reducer;