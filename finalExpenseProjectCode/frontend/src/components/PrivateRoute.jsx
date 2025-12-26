// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // Check for token on every render
    const isAuthenticated = !!localStorage.getItem("userToken");

    // If authenticated, render the child route (Outlet)
    // If NOT authenticated, redirect to the login page
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

