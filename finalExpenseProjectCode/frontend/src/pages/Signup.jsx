
import React, { useState } from "react";
import { signupUser } from "../api";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupUser(username, email, password, role);
      const existing = JSON.parse(localStorage.getItem("signupUsers") || "[]");
      existing.push({ username, role });
      localStorage.setItem("signupUsers", JSON.stringify(existing));
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Signup error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 relative z-10">
      <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border-t-4 border-green-600">
        <h2 className="text-3xl font-extrabold text-green-800 text-center mb-8">
          Create Your Account
        </h2>
        <form className="space-y-6" onSubmit={handleSignup}>
          <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
