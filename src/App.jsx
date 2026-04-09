import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './components/MainLayout'
import Market from './pages/Market'
import Settings from './pages/Settings'
import axiosClient from './api/axiosClient'
import UrlPP from './api/UrlPP'
import { logout } from './features/authSlice'

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
 
  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;
      try {
        await axiosClient.get(UrlPP.User.Me);
      } catch (err) {
        // Interceptor handles 401, but we ensure state is cleared here 
        dispatch(logout());
      }
    };
    validateToken();
  }, [token, dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes  */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/market" element={
        <ProtectedRoute>
          <MainLayout>
            <Market />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App