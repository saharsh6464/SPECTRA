// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user"); // check login info

  if (!user) {
    // not logged in → redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children; // allow access if logged in
};

export default ProtectedRoute;
