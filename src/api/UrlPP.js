export const UrlPP = {
    Watchlist: {
        Get: (userId) => `/Watchlist/${userId}`,
        Add: (userId, exchange, symbol) => `/Watchlist/add?userId=${userId}&exchange=${exchange}&symbol=${symbol}`,
        Remove: (userId, exchange, symbol) => `/Watchlist/remove?userId=${userId}&exchange=${exchange}&symbol=${symbol}`,
    },
    User: {
        Login: '/User/login',
        Me: '/User/me',
    },
    Transaction: {
        Dashboard: (userId) => `/Transaction/dashboard/${userId}`,
        Add: '/Transaction/add',
        Update: (userId, symbol) => `/Transaction/update?userId=${userId}&symbol=${symbol}`,
        Delete: (userId, symbol) => `/Transaction/delete?userId=${userId}&symbol=${symbol}`,
    }
};

export default UrlPP;
