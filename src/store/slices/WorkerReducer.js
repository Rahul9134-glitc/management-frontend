import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // ✅ use instance

// ✅ FETCH ALL WORKERS
export const fetchAllWorkers = createAsyncThunk(
  "worker/fetchAll",
  async ({ role, search }, { rejectWithValue }) => {
    try {
      let url = "/worker/all";

      const params = new URLSearchParams();
      if (role && role !== "All") params.append("role", role);
      if (search && search.trim() !== "") params.append("search", search);

      const queryString = params.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch workers!"
      );
    }
  }
);

// ✅ DELETE WORKER
export const deleteWorker = createAsyncThunk(
  "worker/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/worker/delete-worker/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete worker!"
      );
    }
  }
);

// ✅ ADD WORKER
export const addNewWorker = createAsyncThunk(
  "worker/add",
  async (workerData, { rejectWithValue }) => {
    try {
      const response = await api.post("/worker/register", workerData);
      return response.data.data.worker;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add worker!"
      );
    }
  }
);

// ✅ UPDATE WORKER
export const updateWorker = createAsyncThunk(
  "worker/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/worker/update-worker/${id}`,
        formData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update worker!"
      );
    }
  }
);

const workerSlice = createSlice({
  name: "worker",
  initialState: {
    workers: [],
    loading: false,
    error: null,
    stats: {
      totalWorkers: 0,
      activeWorkers: 0,
    },
  },
  reducers: {
    clearWorkerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchAllWorkers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllWorkers.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = action.payload;
        state.stats.totalWorkers = action.payload.length;
        state.stats.activeWorkers = action.payload.filter(
          (w) => w.status === "Active"
        ).length;
      })
      .addCase(fetchAllWorkers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addNewWorker.fulfilled, (state, action) => {
        state.workers.push(action.payload);
        state.stats.totalWorkers += 1;
        if (action.payload.status === "Active") {
          state.stats.activeWorkers += 1;
        }
      })

      // DELETE
      .addCase(deleteWorker.fulfilled, (state, action) => {
        state.workers = state.workers.filter(
          (worker) => worker._id !== action.payload
        );
        state.stats.totalWorkers -= 1;
      })
      .addCase(deleteWorker.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateWorker.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = state.workers.map((worker) =>
          worker._id === action.payload._id ? action.payload : worker
        );
      })
      .addCase(updateWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWorkerError } = workerSlice.actions;
export default workerSlice.reducer;