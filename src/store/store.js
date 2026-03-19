import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import WorkerReducer from "./slices/WorkerReducer"
import AccountReducer from "./slices/accountSlice"
import GroupReducer from "./slices/groupSlices";
import ExpenceReducer from "./slices/expenceSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        worker : WorkerReducer,
        account : AccountReducer,
        group : GroupReducer,
        expense : ExpenceReducer
    },
});