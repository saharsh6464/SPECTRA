import React, { useState } from "react";
import { RegisterUser, LoginUser } from "../api/authenication";

const ROLE_OPTIONS = [
  { label: "Student / User", value: "user" },
  { label: "Company", value: "company" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.username.trim() || !formData.password || (!isLogin && !formData.role)) {
      setError(
        isLogin
          ? "Username and password are required!"
          : "Username, password, and role are required!"
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await LoginUser({
          username: formData.username.trim(),
          password: formData.password,
        });

        if (result && result.username) {
          const role = (result.role || "user").toLowerCase();

          localStorage.setItem(
            "user",
            JSON.stringify({
              success: true,
              id: result.id,
              username: result.username,
              role: result.role,
            })
          );

          setMessage("Logged in successfully.");

          if (role === "company") {
            window.location.href = "/company";
          } else {
            window.location.href = "/student";
          }
        } else {
          setError("Invalid username or password");
        }
      } else {
        const regResult = await RegisterUser({
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role,
        });

        if (regResult && regResult.username) {
          setMessage(`User registered successfully as ${regResult.username}! Please log in.`);
          setIsLogin(true);
          setFormData((prev) => ({
            ...prev,
            password: "",
          }));
        } else {
          setError("Registration failed. Username may already exist.");
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    if (loading) return;
    setIsLogin(loginMode);
    setError("");
    setMessage("");
    setFormData({
      username: "",
      password: "",
      role: "user",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-400">EduPortal</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? "Sign in to access your dashboard" : "Create a new account"}
          </p>
        </div>

        {/* Switch buttons */}
        <div className="flex mb-6 rounded-lg bg-slate-900 p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer ${
              isLogin ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer ${
              !isLogin ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;