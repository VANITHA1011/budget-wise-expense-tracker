
import React, { useState, useEffect } from "react";

function Profile() {
  const [user, setUser] = useState({ name: "", role: "" });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUser({
      name: currentUser.name || currentUser.username || "Guest",
      role: currentUser.role || "USER"
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("currentUser");
    const cacheBuster = Date.now();
    window.location.replace(`/?t=${cacheBuster}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 relative z-10">
      <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md mx-4 text-center border-t-4 border-red-500">
        <div className="text-6xl mb-4 text-green-700">👤</div>
        <h2 className="text-3xl font-extrabold mb-2 text-green-800">Welcome {user.name}!!</h2>
        <p className="text-lg font-semibold text-gray-500 mb-6">Role: <span className="text-green-600">{user.role}</span></p>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition transform hover:scale-[1.01] tracking-wider uppercase"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
