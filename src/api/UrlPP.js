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
    },
    Transaction: {
        Dashboard: (userId) => `/Transaction/dashboard/${userId}`,
        Add: '/Transaction/add',
        Update: (userId, symbol) => `/Transaction/update?userId=${userId}&symbol=${symbol}`,
        Delete: (userId, symbol) => `/Transaction/delete?userId=${userId}&symbol=${symbol}`,
        History: (userId) => `/Transaction/history/${userId}`,
    },
    Cash: {
        Deposit: (userId, amount) => `/Cash/deposit?userId=${userId}&amount=${amount}`,
        Withdraw: (userId, amount) => `/Cash/withdraw?userId=${userId}&amount=${amount}`,
        GetBalance: (userId) => `/Cash/${userId}`,
    }
};

export default UrlPP;
