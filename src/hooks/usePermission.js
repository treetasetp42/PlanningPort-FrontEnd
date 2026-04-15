import { useSelector } from 'react-redux';

/**
 * Returns true if the currently logged-in user has the given permission key.
 * Permissions are loaded from Redux state at login time (session-baked).
 *
 * Usage:
 *   const canEdit = usePermission('ADMIN_USERS_EDIT');
 *   const canEdit = usePermission(PERMISSIONS.ADMIN_USERS_EDIT);
 */
const usePermission = (permissionKey) => {
    const permissions = useSelector((state) => state.auth.permissions);
    if (!permissionKey) return true; // null = no restriction
    return Array.isArray(permissions) && permissions.includes(permissionKey);
};

export default usePermission;
