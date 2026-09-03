// import React, { useState } from "react";
// import { RegisterUser, LoginUser } from "../api/authenication";

// const ROLE_OPTIONS = ["user", "company", "admin"]; // fixed duplicate

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({ username: "", password: "", role: "user" });
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.username || !formData.password || (!isLogin && !formData.role)) {
//       setError("Username, password, and role (for registration) are required!");
//       return;
//     }

//     setError("");
//     setMessage("");
//     setLoading(true);

//     try {
//       if (isLogin) {
//         // Login now returns full user object or null
//         const result = await LoginUser({
//           username: formData.username,
//           password: formData.password,
//         });

//         console.log("🔑 Login Response:", result); // Debugging

//         if (result && result.username) {
//           // Save user data (but don't store password)
//           localStorage.setItem(
//             "user",
//             JSON.stringify({ success: true, username: result.username, role: result.role })
//           );

//           setMessage("Logged in successfully.");

//           // 🔥 Redirect based on role (normalize to lowercase)
//           const role = result.role?.toLowerCase();
//           if (role === "student" || role === "user") {
//             window.location.href = "/student";
//           } else if (role === "company") {
//             window.location.href = "/company";
//           } else if (role === "admin") {
//             window.location.href = "/admin";
//           } else {
//             // fallback if role is unknown
//             window.location.href = "/";
//           }
//         } else {
//           setError("Invalid credentials");
//         }
//       } else {
//         const regResult = await RegisterUser({
//           username: formData.username,
//           password: formData.password,
//           role: formData.role,
//         });

//         console.log("🆕 Registration Response:", regResult);

//         if (regResult && regResult.username) {
//           setMessage(`User registered: ${regResult.username}`);
//           setIsLogin(true);
//         } else {
//           setError("Registration failed");
//         }
//       }
//     } catch (err) {
//       setError(err?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-slate-900">
//       <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
//         <div className="flex mb-6">
//           <button
//             type="button"
//             onClick={() => setIsLogin(true)}
//             className={`w-1/2 py-2 rounded-l-md font-semibold ${
//               isLogin ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
//             }`}
//             disabled={loading}
//           >
//             Login
//           </button>
//           <button
//             type="button"
//             onClick={() => setIsLogin(false)}
//             className={`w-1/2 py-2 rounded-r-md font-semibold ${
//               !isLogin ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
//             }`}
//             disabled={loading}
//           >
//             Register
//           </button>
//         </div>

//         {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
//         {message && <p className="text-green-400 text-sm mb-4">{message}</p>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-slate-300 text-sm mb-1">Username</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               autoComplete="username"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label className="block text-slate-300 text-sm mb-1">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               autoComplete={isLogin ? "current-password" : "new-password"}
//               disabled={loading}
//             />
//           </div>

//           {!isLogin && (
//             <div>
//               <label className="block text-slate-300 text-sm mb-1">Role</label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 disabled={loading}
//               >
//                 {ROLE_OPTIONS.map((r) => (
//                   <option key={r} value={r}>
//                     {r}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold disabled:opacity-60"
//             disabled={loading}
//           >
//             {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AuthPage;
import React, { useState } from "react";
import { RegisterUser, LoginUser } from "../api/authenication";

const ROLE_OPTIONS = ["user", "company", "admin"];

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

    // Login only needs username + password.
    // Registration needs username + password + role.
    if (
      !formData.username.trim() ||
      !formData.password ||
      (!isLogin && !formData.role)
    ) {
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
        // Your backend expects:
        // POST /users/login
        // {
        //   "username": "...",
        //   "password": "..."
        // }
        const result = await LoginUser({
          username: formData.username.trim(),
          password: formData.password,
        });

        console.log("🔑 Login Response:", result);

        // Backend returns the complete Users object
        // when login is successful.
        if (result && result.username) {
          const role = result.role?.toLowerCase();

          // Don't store the password.
          localStorage.setItem(
            "user",
            JSON.stringify({
              success: true,
              username: result.username,
              role: result.role,
            })
          );

          setMessage("Logged in successfully.");

          // Redirect according to role
          if (role === "student" || role === "user") {
            window.location.href = "/student";
          } else if (role === "company") {
            window.location.href = "/company";
          } else if (role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        } else {
          setError("Invalid credentials");
        }
      } else {
        // Your backend expects:
        // POST /users
        // {
        //   "username": "...",
        //   "password": "...",
        //   "role": "..."
        // }
        const regResult = await RegisterUser({
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role,
        });

        console.log("🆕 Registration Response:", regResult);

        if (regResult && regResult.username) {
          setMessage(`User registered: ${regResult.username}`);

          // Switch back to login after successful registration
          setIsLogin(true);

          // Clear password after registration
          setFormData((prev) => ({
            ...prev,
            password: "",
          }));
        } else {
          setError("Registration failed");
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);

      // LoginUser already converts 401 into this Error.
      setError(
        err?.message ||
          err?.error ||
          err?.message ||
          "Something went wrong. Please try again."
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

    // Reset form when switching
    setFormData({
      username: "",
      password: "",
      role: "user",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
        {/* Login / Register switch */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`w-1/2 py-2 rounded-l-md font-semibold ${
              isLogin
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
            disabled={loading}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`w-1/2 py-2 rounded-r-md font-semibold ${
              !isLogin
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mb-4">
            {error}
          </p>
        )}

        {/* Success message */}
        {message && (
          <p className="text-green-400 text-sm mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete={
                isLogin ? "current-password" : "new-password"
              }
              disabled={loading}
              required
            />
          </div>

          {/* Role - only during registration */}
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-sm mb-1">
                Role
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
                required
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;