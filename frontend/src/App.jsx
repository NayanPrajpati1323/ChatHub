import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  // Check if the user is directly accessing the login/signup pages
  const isDirectAccess = location.key === "default";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  // Check if it's the root route
  const isRootPath = location.pathname === "/";

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        {/* Root path always shows login page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Route for home page access after login */}
        <Route path="/home" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        
        {/* If it's direct access to login or signup, show those pages even if logged in */}
        <Route 
          path="/signup" 
          element={(!authUser || (isDirectAccess && isAuthPage)) ? <SignUpPage /> : <Navigate to="/home" />} 
        />
        <Route 
          path="/login" 
          element={(!authUser || (isDirectAccess && isAuthPage)) ? <LoginPage /> : <Navigate to="/home" />} 
        />
        
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;