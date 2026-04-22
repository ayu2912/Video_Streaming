import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Check if the user has a login token saved
  const token = sessionStorage.getItem("token");

  // If no token exists, redirect them back to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, allow them to view the protected page
  return children;
}

export default ProtectedRoute;
