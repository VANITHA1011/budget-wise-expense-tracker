

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout & Navbar
import Layout from "./components/Layout.jsx";
import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import TransactionPage from "./pages/TransactionPage";
import BudgetsPage from "./pages/BudgetsPage";
import SavingsGoalsPage from "./pages/SavingsGoalsPage";
import ReportsPage from "./pages/ReportsPage";
import CommunityPage from "./pages/CommunityPage";
import AdminPage from "./pages/AdminPage.jsx";

const AppWrapper = () => {
  const token = localStorage.getItem("userToken");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = (currentUser.role || "USER").toUpperCase();

  if (token) {
    return (
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {/* Protected routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/goals" element={<SavingsGoalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin page — only accessible if role === ADMIN (backend should still protect) */}
            <Route path="/admin" element={role === "ADMIN" ? <AdminPage /> : <Navigate to="/dashboard" replace />} />

            {/* Root redirect according to role */}
            <Route path="/" element={<Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />} />
          </Route>
        </Route>

        {/* Logged-in users shouldn't access auth pages */}
        <Route path="/login" element={<Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />} />
        <Route path="/signup" element={<Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />} />

        <Route path="*" element={<Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />} />
      </Routes>
    );
  }

  // Not logged in: public site + navbar
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

