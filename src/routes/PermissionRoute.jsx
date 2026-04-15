import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Route guard that redirects to /dashboard if the user lacks the required permission.
 * 
 * Usage in App.jsx:
 *   <PermissionRoute required={PERMISSIONS.ADMIN_ACCESS}>
 *     <AdminDashboard />
 *   </PermissionRoute>
 */
const PermissionRoute = ({ required, children }) => {
    const permissions = useSelector((state) => state.auth.permissions);

    if (!required) return children;

    const hasPermission = Array.isArray(permissions) && permissions.includes(required);

    if (!hasPermission) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PermissionRoute;
