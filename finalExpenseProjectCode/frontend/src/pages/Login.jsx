
import React, { useState } from "react";
import { loginUser } from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginUser(username, password);
      // result should include token and user info (depends on backend)
      // adapt to your backend response shape:
      // if result = { token, user: { username, role, ... } }
      const token = result.token || result;
      let userObj = result.user || {};
      // If backend returns only token and a separate user fetch is needed,
      // fetch profile after login. For simplicity, we try result.user, else fallback:
      if (!userObj.username && result.username) {
        userObj = { username: result.username, role: result.role || "USER" };
      }

      localStorage.setItem("userToken", token);
      // Save the user object with a role field (normalize uppercase)
      localStorage.setItem("currentUser", JSON.stringify({
        ...userObj,
        role: (userObj.role || "USER").toUpperCase()
      }));

      const role = (userObj.role || "USER").toUpperCase();
      // Redirect based on role
      window.location.href = role === "ADMIN" ? "/admin" : "/dashboard";

    } catch (err) {
      console.error(err);
      alert("Login failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border-t-4 border-yellow-600">
        <h2 className="text-3xl font-extrabold text-teal-800 text-center mb-8">Login to Your Account</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
          <button type="submit" disabled={loading} className="w-full bg-yellow-600 text-white py-3 rounded-xl font-bold">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
