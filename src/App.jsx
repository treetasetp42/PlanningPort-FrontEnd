import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import PermissionRoute from './routes/PermissionRoute'
import MainLayout from './components/MainLayout'
import Market from './pages/Market'
import Settings from './pages/Settings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoles from './pages/admin/AdminRoles'
import axiosClient from './api/axiosClient'
import UrlPP from './api/UrlPP'
import { logout } from './features/authSlice'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PERMISSIONS } from './constants/permissions'

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;
      try {
        await axiosClient.get(UrlPP.User.Me);
      } catch (err) {
        dispatch(logout());
      }
    };
    validateToken();
  }, [token, dispatch]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><MainLayout><Market /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />

        {/* Admin Routes — requires ADMIN_ACCESS permission */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <PermissionRoute required={PERMISSIONS.ADMIN_ACCESS}>
              <MainLayout><AdminDashboard /></MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/roles" element={
          <ProtectedRoute>
            <PermissionRoute required={PERMISSIONS.ADMIN_ROLES_VIEW}>
              <MainLayout><AdminRoles /></MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App