import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import api from "../../api/axios"; // ✅ sirf ye use hoga

// ✅ FETCH ACCOUNTS
export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/money/all");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Accounts load nahi ho paye"
      );
    }
  }
);

// ✅ CREATE ACCOUNT
export const createAccount = createAsyncThunk(
  "money/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/money/create", data);
      toast.success("Naya bucket ban gaya!");
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message);
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ ADD MONEY
export const addMoney = createAsyncThunk(
  "money/addMoney",
  async ({ accountId, amount }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/money/add-money/${accountId}`, { amount });
      toast.success("Paisa add ho gaya!");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ UPDATE ACCOUNT
export const updateAccountName = createAsyncThunk(
  "account/updateAccountName",
  async ({ accountId, holderName, purpose, balance }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/money/update-money/${accountId}`,
        {
          holderName,
          purpose,
          balance
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

// ✅ CREATE SHOPPING
export const createShoppingEntry = createAsyncThunk(
  "shopping/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/shopping/add-item", data);
      toast.success("Shopping entry successful!");
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message);
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ UPDATE SHOPPING
export const updateShoppingEntry = createAsyncThunk(
  "shopping/update",
  async ({ shoppingId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/shopping/update-item/${shoppingId}`,
        formData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ✅ DELETE SHOPPING
export const deleteShoppingEntry = createAsyncThunk(
  "shopping/delete",
  async (shoppingId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/shopping/delete-item/${shoppingId}`
      );
      return { shoppingId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ✅ FETCH HISTORY
export const fetchShoppingHistory = createAsyncThunk(
  "shopping/fetchHistory",
  async (accountId, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/shopping/get-history/${accountId}`
      );
      return { accountId, history: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState: {
    accounts: [],
    history: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearAccountError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })

      .addCase(addMoney.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(
          (acc) => acc._id === action.payload._id
        );
        if (index !== -1) state.accounts[index] = action.payload;
      })

      .addCase(updateAccountName.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(
          (acc) => acc._id === action.payload._id
        );
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })

      .addCase(createShoppingEntry.fulfilled, (state, action) => {
        const { shopping, remainingBalance } = action.payload;
        const account = state.accounts.find(
          (acc) => acc._id === shopping.accountId
        );
        if (account) account.balance = remainingBalance;

        if (state.history[shopping.accountId]) {
          state.history[shopping.accountId].unshift(shopping);
        }
      })

      .addCase(fetchShoppingHistory.fulfilled, (state, action) => {
        state.history[action.payload.accountId] =
          action.payload.history;
      })

      .addCase(updateShoppingEntry.fulfilled, (state, action) => {
        const updatedShopping = action.payload;
        const accountId = updatedShopping.accountId;

        if (state.history[accountId]) {
          const index = state.history[accountId].findIndex(
            (item) => item._id === updatedShopping._id
          );
          if (index !== -1) {
            state.history[accountId][index] = updatedShopping;
          }
        }
        toast.success("Hisaab update ho gaya!");
      })

      .addCase(deleteShoppingEntry.fulfilled, (state, action) => {
        const { shoppingId } = action.payload;
        Object.keys(state.history).forEach((accId) => {
          state.history[accId] = state.history[accId].filter(
            (item) => item._id !== shoppingId
          );
        });
        toast.success("Entry delete ho gayi!");
      });
  },
});

export const { clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;