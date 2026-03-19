import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import api from "./api/axios";
import { setLogin, setLogout, setLoading } from "./store/slices/authSlice";
import { setGroup } from "./store/slices/groupSlices"; 

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Workers from "./pages/Workpage";
import WorkerView from "./pages/WorkerVeiws";
import MarketingDashboard from "./components/marketing/MarketDashboard";
import ShoppingHistory from "./components/marketing/ShoppingHistory";

import GroupManager from "./components/friendship/GroupManager";;
import FriendDashboard from "./components/friendship/FriendShipZoneDashboard"; 

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, loading, user } = useSelector((state) => state.auth);
  const { currentGroup } = useSelector((state) => state.group); // Group state

  useEffect(() => {
  const persistUser = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get("/auth/current-user");

      if (response.data.success) {
        const userData = response.data.data;
        dispatch(setLogin(userData));

        if (userData.currentGroup) {
          try {
            const groupRes = await api.get("/group/details");
            if (groupRes.data.success) {
              dispatch(setGroup(groupRes.data.data)); 
            }
          } catch (err) {
            console.error("Group details fetch error:", err);
            dispatch(setGroup(null)); // Safety ke liye
          }
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      dispatch(setLogout());
    } finally {
      dispatch(setLoading(false));
    }
  };

  persistUser();
}, [dispatch]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!isLoggedIn ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* --- FriendshipZone Routes --- */}
        
        {/* Step 1: User login hai par group mein nahi hai */}
        <Route
          path="/friendship-zone"
          element={
            isLoggedIn ? (
              !currentGroup ? <GroupManager /> : <Navigate to="/friendship-dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Step 2: User login hai aur group mein bhi hai */}
        <Route
          path="/friendship-dashboard"
          element={
            isLoggedIn && currentGroup ? <FriendDashboard /> : <Navigate to="/friendship-zone" />
          }
        />

        {/* Baaki Existing Protected Routes */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/workers"
          element={isLoggedIn ? <Workers /> : <Navigate to="/login" />}
        />
        <Route
          path="/worker/view/:id"
          element={isLoggedIn ? <WorkerView /> : <Navigate to="/login" />}
        />
        <Route
          path="/marketing"
          element={isLoggedIn ? <MarketingDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/marketing/history/:accountId"
          element={isLoggedIn ? <ShoppingHistory /> : <Navigate to="/login" />}
        />

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;