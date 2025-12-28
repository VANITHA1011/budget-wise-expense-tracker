
// // Layout.jsx
import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // read current user (safe parse)
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || {};
    } catch {
      return {};
    }
  }, []);

  const role = (user.role || "USER").toUpperCase();
  const username = user.name || user.username || "Guest";

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("currentUser");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // nav items for regular users
  const primaryNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Transactions", path: "/transactions", icon: "💸" },
    { name: "Budgets", path: "/budgets", icon: "🎯" },
    { name: "Savings Goals", path: "/goals", icon: "💰" },
    { name: "Reports", path: "/reports", icon: "📈" },
    { name: "Community Forum", path: "/community", icon: "🗣️" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  // admin-only nav (minimal)
  const adminNav = [
    { name: "Admin Control Panel", path: "/admin", icon: "🔒" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  const navToShow = role === "ADMIN" ? adminNav : primaryNavItems;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-teal-800 text-white flex flex-col p-4 shadow-2xl sticky top-0">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Budget Tracker</h1>
        </div>

        {/* Welcome box */}
        <div className="flex items-center p-3 mb-4 rounded-lg bg-teal-700">
          <div className="w-10 h-10 bg-teal-800/25 rounded-full flex items-center justify-center text-lg">
            👤
          </div>
          {/* <div className="ml-3">
            <div className="text-xs text-teal-100">Welcome,</div>
            <div className="text-sm font-semibold">{username}</div>
          </div> */}
          <div className="ml-3">
  <div className="text-xs text-yellow-300 font-semibold">Welcome</div>
  <div className="text-sm font-semibold">{username}</div>
</div>

        </div>

        {/* MAIN SCROLLABLE AREA */}
        <div className="flex flex-col flex-grow">
          {/* Navigation links (do NOT flex-grow this element or it may push buttons) */}
          <nav className="mb-4">
            {navToShow.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg mb-2 transition ${
                    active ? "bg-teal-600 font-bold" : "hover:bg-teal-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Buttons section - placed immediately after nav */}
          <div className="mt-2 pt-4 border-t border-teal-700 space-y-3">
            {/* Add Transaction: only for non-admins */}
            {role !== "ADMIN" && (
              <Link
                to="/transactions?action=add"
                className="flex items-center justify-center bg-yellow-500 text-white font-bold p-3 rounded-xl hover:bg-yellow-600 transition"
              >
                + Add Transaction
              </Link>
            )}

            {/* Logout (immediately below Add Transaction) */}
            <button
              onClick={handleLogout}
              className="w-full text-left p-3 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center justify-center font-semibold"
            >
              <span className="mr-2">⬅️</span> Logout
            </button>
          </div>

          {/* filler so sidebar content uses remaining space (optional) */}
          <div className="flex-grow" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
