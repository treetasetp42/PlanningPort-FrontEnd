import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        // เตะไปหน้า Login และจำไว้ด้วยว่ากำลังจะเข้าหน้าไหน (state) [cite: 2026-04-01, 2026-04-02]
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children; // ถ้าผ่านด่าน ให้เข้าเรียนได้ปกติ
};

export default ProtectedRoute;