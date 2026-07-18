import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "./SplashScreen";
import { roleHome } from "../utils/roles";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return children;
}
