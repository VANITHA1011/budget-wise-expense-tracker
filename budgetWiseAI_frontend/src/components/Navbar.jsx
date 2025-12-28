
import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const path = location.pathname;
  const token = localStorage.getItem("userToken");

  if (token) return null;
  if (path === "/") return null;

  return (
    <nav className="bg-gray-800 text-white w-full shadow-lg sticky top-0 z-50 h-16 flex items-center">
      <div className="flex justify-between w-full px-8 text-lg font-medium max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-wider text-teal-400">
          <Link to="/">Budget Tracker</Link>
        </div>

        <div className="flex space-x-8">
          <Link to="/" className={`hover:text-yellow-400 transition ${path === "/" ? "text-yellow-400 font-bold" : ""}`}>Home</Link>
          <Link to="/signup" className={`hover:text-yellow-400 transition ${path.includes("/signup") ? "text-yellow-400 font-bold" : ""}`}>Signup</Link>
          <Link to="/login" className={`hover:text-yellow-400 transition ${path.includes("/login") ? "text-yellow-400 font-bold" : ""}`}>Login</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
