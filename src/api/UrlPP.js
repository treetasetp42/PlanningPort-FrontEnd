export const UrlPP = {
    Watchlist: {
        Get: (userId) => `/Watchlist/${userId}`,
        Add: (userId, exchange, symbol) => `/Watchlist/add?userId=${userId}&exchange=${exchange}&symbol=${symbol}`,
        Remove: (id) => `/Watchlist/remove/${id}`,
    },
    User: {
        Login: '/User/login',
        Register: '/User/register',
        GoogleLogin: '/User/google-login',
        ConfirmGoogleLink: '/User/confirm-google-link',
        LinkGoogle: '/User/link-google',
        UnlinkGoogle: '/User/unlink-google',
        Me: '/User/me',
        RefreshToken: '/User/refresh-token',
        UpdateProfile: '/User/profile',
        ChangePassword: '/User/change-password',
        ForgotPassword: '/User/forgot-password',
        ResetPassword: '/User/reset-password',
        RequestDelete: '/User/request-delete',
        CancelDelete: '/User/cancel-delete',
        Health: '/Health',
    },
    Transaction: {
        Dashboard: (portfolioId) => `/Transaction/dashboard/${portfolioId}`,
        Add: '/Transaction/add',
        Update: (portfolioId, symbol) => `/Transaction/update?portfolioId=${portfolioId}&symbol=${symbol}`,
        Delete: (portfolioId, symbol) => `/Transaction/delete?portfolioId=${portfolioId}&symbol=${symbol}`,
        History: (portfolioId) => `/Transaction/history/${portfolioId}`,
    },
    Cash: {
        Deposit: (portfolioId, amount) => `/Cash/deposit?portfolioId=${portfolioId}&amount=${amount}`,
        Withdraw: (portfolioId, amount) => `/Cash/withdraw?portfolioId=${portfolioId}&amount=${amount}`,
        GetBalance: (portfolioId) => `/Cash/${portfolioId}`,
    },
    Portfolio: {
        Get: (userId) => `/Portfolio/${userId}`,
        Add: (userId) => `/Portfolio/add?userId=${userId}`,
        Update: (portfolioId) => `/Portfolio/update/${portfolioId}`,
        Delete: (portfolioId) => `/Portfolio/delete/${portfolioId}`,
    },
    Admin: {
        Users: (page = 1, pageSize = 20) => `/Admin/users?page=${page}&pageSize=${pageSize}`,
        ChangeRole: (userId) => `/Admin/users/${userId}/role`,
        BanUser: (userId) => `/Admin/users/${userId}/ban`,
        UnbanUser: (userId) => `/Admin/users/${userId}/unban`,
        ResetPassword: (userId) => `/Admin/users/${userId}/reset-password`,
        ChangeStatus: (userId) => `/Admin/users/${userId}/status`,
        UpdateProfile: (userId) => `/Admin/users/${userId}/profile`,
        Roles: '/Admin/roles',
        RolesList: '/Admin/roles/list',
        UpdateRolePermissions: (roleId) => `/Admin/roles/${roleId}/permissions`,
    }
};

export default UrlPP;
