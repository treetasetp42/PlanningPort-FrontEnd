export const UrlPP = {
    Watchlist: {
        Get: (userId) => `/Watchlist/${userId}`,
        Add: (userId, exchange, symbol) => `/Watchlist/add?userId=${userId}&exchange=${exchange}&symbol=${symbol}`,
        Remove: (id) => `/Watchlist/remove/${id}`,
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
        History: (userId) => `/Transaction/history/${userId}`,
    },
    Cash: {
        Deposit: (userId, amount) => `/Cash/deposit?userId=${userId}&amount=${amount}`,
        Withdraw: (userId, amount) => `/Cash/withdraw?userId=${userId}&amount=${amount}`,
        GetBalance: (userId) => `/Cash/${userId}`,
    }
};

export default UrlPP;
