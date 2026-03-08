import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

import UserDashboard from "../pages/user/UserDashboard.jsx";
import RequestAmbulance from "../pages/user/RequestAmbulance.jsx";
import ReportDisaster from "../pages/user/ReportDisaster.jsx";
import MyRequests from "../pages/user/MyRequests.jsx";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ManageUsers from "../pages/admin/ManageUsers.jsx";
import ManageVillages from "../pages/admin/ManageVillages.jsx";
import ManageRequests from "../pages/admin/ManageRequests.jsx";
import MapAllocation from "../pages/admin/MapAllocation.jsx";

function AuthLayout({ children }) {
  return children;
}

function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />

      {/* User */}
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute>
            <UserLayout>
              <UserDashboard />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/request-ambulance"
        element={
          <ProtectedRoute>
            <UserLayout>
              <RequestAmbulance />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-disaster"
        element={
          <ProtectedRoute>
            <UserLayout>
              <ReportDisaster />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute>
            <UserLayout>
              <MyRequests />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <ManageUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/villages"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <ManageVillages />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <ManageRequests />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/map"
        element=
        {
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <MapAllocation />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect based on role */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

