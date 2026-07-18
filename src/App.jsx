import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ShopDirectory from "./pages/customer/ShopDirectory";
import ShopDetail from "./pages/customer/ShopDetail";
import MyWallets from "./pages/customer/MyWallets";
import ShopDashboard from "./pages/ShopDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { roleHome } from "./utils/roles";

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <Landing />;
  return <Navigate to={roleHome(user.role)} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/shops"
              element={
                <ProtectedRoute role="customer">
                  <ShopDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shops/:id"
              element={
                <ProtectedRoute role="customer">
                  <ShopDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute role="customer">
                  <MyWallets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute role="shop">
                  <ShopDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
