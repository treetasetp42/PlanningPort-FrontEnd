import axios from 'axios';

const baseURL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL + '/api');

// Helper to parse query parameters
const getQueryParam = (url, name) => {
    if (!url) return null;
    const regex = new RegExp('[?&]' + name + '=([^&#]*)');
    const results = regex.exec(url);
    return results ? decodeURIComponent(results[1]) : null;
};

// Mock prices dictionary
const mockPrices = {
    AAPL: 180,
    MSFT: 420,
    TSLA: 175,
    NVDA: 900,
    BTC: 65000,
    ETH: 3200
};

// Local resolvers
const resolvePortfolios = () => {
    let ports = JSON.parse(localStorage.getItem('guest_portfolios') || '[]');
    if (ports.length === 0) {
        ports = [{ id: 'guest_default', name: 'Guest Portfolio', description: 'Your local guest portfolio', colorCode: '#6C5DD3' }];
        localStorage.setItem('guest_portfolios', JSON.stringify(ports));
    }
    return ports;
};

const guestAdapter = async (config) => {
    const { url, method, data: requestData } = config;
    let responseData = null;

    // 1. User profile
    if (url.includes('/User/me')) {
        responseData = {
            userId: 'Guest',
            username: 'Guest',
            displayName: 'Guest User',
            email: 'guest@example.com',
            roleName: 'Guest',
            permissions: [
                "PORTFOLIO_VIEW",
                "PORTFOLIO_CREATE",
                "PORTFOLIO_DELETE",
                "MARKET_VIEW",
                "MARKET_TRADE"
            ],
            isGoogleLinked: false,
            hasPassword: false
        };
    }

    // 2. Portfolios
    else if (url.includes('/Portfolio')) {
        const portfolios = resolvePortfolios();

        // GET /Portfolio/:userId
        if (method === 'get' || method === 'GET') {
            responseData = portfolios;
        }
        // POST /Portfolio/add
        else if (method === 'post' || method === 'POST') {
            const body = JSON.parse(requestData || '{}');
            const newPort = {
                id: 'guest_' + Math.random().toString(36).substr(2, 9),
                name: body.name || 'New Portfolio',
                description: body.description || '',
                colorCode: body.colorCode || '#6C5DD3'
            };
            portfolios.push(newPort);
            localStorage.setItem('guest_portfolios', JSON.stringify(portfolios));
            responseData = newPort;
        }
        // PUT /Portfolio/update/:id
        else if (method === 'put' || method === 'PUT') {
            const match = /\/Portfolio\/update\/([^\/\?]+)/.exec(url);
            const portId = match ? match[1] : null;
            const body = JSON.parse(requestData || '{}');
            const portIndex = portfolios.findIndex(p => p.id === portId);
            if (portIndex !== -1) {
                portfolios[portIndex] = {
                    ...portfolios[portIndex],
                    name: body.name || portfolios[portIndex].name,
                    description: body.description || portfolios[portIndex].description,
                    colorCode: body.colorCode || portfolios[portIndex].colorCode
                };
                localStorage.setItem('guest_portfolios', JSON.stringify(portfolios));
                responseData = portfolios[portIndex];
            } else {
                responseData = portfolios[0];
            }
        }
        // DELETE /Portfolio/delete/:id
        else if (method === 'delete' || method === 'DELETE') {
            const match = /\/Portfolio\/delete\/([^\/\?]+)/.exec(url);
            const portId = match ? match[1] : null;
            const updated = portfolios.filter(p => p.id !== portId);
            localStorage.setItem('guest_portfolios', JSON.stringify(updated));

            // Clean up related data
            localStorage.removeItem(`guest_cash_${portId}`);
            localStorage.removeItem(`guest_transactions_${portId}`);
            responseData = { success: true };
        }
    }

    // 3. Cash Operations
    else if (url.includes('/Cash')) {
        // GET /Cash/:portfolioId
        if (method === 'get' || method === 'GET') {
            const match = /\/Cash\/([^\/\?]+)$/.exec(url);
            const portId = match ? match[1] : 'guest_default';
            const cash = parseFloat(localStorage.getItem(`guest_cash_${portId}`) || '10000.00');
            responseData = { balance: cash, cashBalance: cash };
        }
        // POST /Cash/deposit
        else if (url.includes('/deposit')) {
            const portId = getQueryParam(url, 'portfolioId') || 'guest_default';
            const amount = parseFloat(getQueryParam(url, 'amount') || '0');
            const currentCash = parseFloat(localStorage.getItem(`guest_cash_${portId}`) || '10000.00');
            const newCash = currentCash + amount;
            localStorage.setItem(`guest_cash_${portId}`, newCash.toFixed(2));
            responseData = { balance: newCash, cashBalance: newCash };
        }
        // POST /Cash/withdraw
        else if (url.includes('/withdraw')) {
            const portId = getQueryParam(url, 'portfolioId') || 'guest_default';
            const amount = parseFloat(getQueryParam(url, 'amount') || '0');
            const currentCash = parseFloat(localStorage.getItem(`guest_cash_${portId}`) || '10000.00');
            const newCash = Math.max(0, currentCash - amount);
            localStorage.setItem(`guest_cash_${portId}`, newCash.toFixed(2));
            responseData = { balance: newCash, cashBalance: newCash };
        }
    }

    // 4. Transactions & Dashboard
    else if (url.includes('/Transaction')) {
        // POST /Transaction/add?portfolioId=:id
        if (url.includes('/add')) {
            const portId = getQueryParam(url, 'portfolioId') || 'guest_default';
            const body = JSON.parse(requestData || '{}');
            const txs = JSON.parse(localStorage.getItem(`guest_transactions_${portId}`) || '[]');
            const newTx = {
                id: 't_' + Date.now(),
                portfolioId: portId,
                symbol: body.symbol,
                type: body.type || 'Buy',
                quantity: parseFloat(body.quantity || '0'),
                pricePerUnit: parseFloat(body.pricePerUnit || '0'),
                assetType: body.assetType || 'Stock',
                subtype: body.subtype || '',
                exchange: body.exchange || 'NASDAQ',
                date: new Date().toISOString()
            };
            txs.push(newTx);
            localStorage.setItem(`guest_transactions_${portId}`, JSON.stringify(txs));

            // Adjust Cash Balance
            const currentCash = parseFloat(localStorage.getItem(`guest_cash_${portId}`) || '10000.00');
            const cost = newTx.quantity * newTx.pricePerUnit;
            const newCash = newTx.type === 'Buy' ? (currentCash - cost) : (currentCash + cost);
            localStorage.setItem(`guest_cash_${portId}`, newCash.toFixed(2));

            responseData = { success: true, transaction: newTx };
        }
        // DELETE /Transaction/delete?portfolioId=:id&symbol=:symbol
        else if (url.includes('/delete')) {
            const portId = getQueryParam(url, 'portfolioId') || 'guest_default';
            const symbol = getQueryParam(url, 'symbol') || '';
            const txs = JSON.parse(localStorage.getItem(`guest_transactions_${portId}`) || '[]');
            const updated = txs.filter(t => t.symbol !== symbol);
            localStorage.setItem(`guest_transactions_${portId}`, JSON.stringify(updated));
            responseData = { success: true };
        }
        // GET /Transaction/history/:portfolioId
        else if (url.includes('/history')) {
            const match = /\/Transaction\/history\/([^\/\?]+)/.exec(url);
            const portId = match ? match[1] : 'guest_default';
            const txs = JSON.parse(localStorage.getItem(`guest_transactions_${portId}`) || '[]');
            responseData = txs;
        }
        // GET /Transaction/dashboard/:portfolioId
        else if (url.includes('/dashboard')) {
            const match = /\/Transaction\/dashboard\/([^\/\?]+)/.exec(url);
            const portId = match ? match[1] : 'guest_default';
            const txs = JSON.parse(localStorage.getItem(`guest_transactions_${portId}`) || '[]');
            const cashBalance = parseFloat(localStorage.getItem(`guest_cash_${portId}`) || '10000.00');

            // Compute holdings
            const assetsMap = {};
            let realizedProfit = 0;

            txs.forEach(tx => {
                const sym = tx.symbol;
                if (!assetsMap[sym]) {
                    assetsMap[sym] = {
                        symbol: sym,
                        holdings: 0,
                        totalCost: 0,
                        averageCost: 0,
                        assetType: tx.assetType || 'Stock',
                        subtype: tx.subtype || '',
                        exchange: tx.exchange || 'NASDAQ'
                    };
                }

                const asset = assetsMap[sym];
                if (tx.type === 'Buy') {
                    const prevHoldings = asset.holdings;
                    const prevCost = prevHoldings * asset.averageCost;
                    const txCost = tx.quantity * tx.pricePerUnit;
                    asset.holdings += tx.quantity;
                    asset.averageCost = asset.holdings > 0 ? ((prevCost + txCost) / asset.holdings) : 0;
                } else if (tx.type === 'Sell') {
                    if (asset.holdings > 0) {
                        const sellQty = Math.min(asset.holdings, tx.quantity);
                        realizedProfit += (tx.pricePerUnit - asset.averageCost) * sellQty;
                        asset.holdings -= sellQty;
                        if (asset.holdings === 0) {
                            asset.averageCost = 0;
                        }
                    }
                }
            });

            // Convert to array and filter out empty holdings
            const assets = Object.values(assetsMap).filter(a => a.holdings > 0).map(a => {
                const currentPrice = mockPrices[a.symbol] || a.averageCost;
                const profitLoss = (currentPrice - a.averageCost) * a.holdings;
                return {
                    ...a,
                    currentPrice,
                    profitLoss
                };
            });

            // Compute totals
            const totalInvestment = assets.reduce((sum, a) => sum + (a.holdings * a.averageCost), 0);
            const totalUnrealizedProfit = assets.reduce((sum, a) => sum + a.profitLoss, 0);
            const totalValue = cashBalance + assets.reduce((sum, a) => sum + (a.holdings * a.currentPrice), 0);

            responseData = {
                totalValue,
                totalInvestment,
                totalUnrealizedProfit,
                cashBalance,
                realizedProfit,
                assets
            };
        }
    }

    // 5. Watchlist Operations
    else if (url.includes('/Watchlist')) {
        let watchlist = JSON.parse(localStorage.getItem('guest_watchlist') || '[]');
        if (watchlist.length === 0) {
            watchlist = [
                { id: 'w_1', symbol: 'AAPL', exchange: 'NASDAQ', currentPrice: 180.00, dailyChange: 2.50, dailyPercentChange: 1.41 },
                { id: 'w_2', symbol: 'MSFT', exchange: 'NASDAQ', currentPrice: 420.00, dailyChange: -4.20, dailyPercentChange: -0.99 },
                { id: 'w_3', symbol: 'TSLA', exchange: 'NASDAQ', currentPrice: 175.00, dailyChange: 0.85, dailyPercentChange: 0.49 },
                { id: 'w_4', symbol: 'NVDA', exchange: 'NASDAQ', currentPrice: 900.00, dailyChange: 15.30, dailyPercentChange: 1.73 },
                { id: 'w_5', symbol: 'BTC', exchange: 'BINANCE', currentPrice: 65000.00, dailyChange: 1200.00, dailyPercentChange: 1.88 }
            ];
            localStorage.setItem('guest_watchlist', JSON.stringify(watchlist));
        }

        // GET /Watchlist/:userId
        if (method === 'get' || method === 'GET') {
            // Update prices dynamically from mockPrices if they exist
            const updatedList = watchlist.map(item => {
                const currentPrice = mockPrices[item.symbol] || item.currentPrice;
                return { ...item, currentPrice };
            });
            responseData = updatedList;
        }
        // POST /Watchlist/add
        else if (url.includes('/add')) {
            const exchange = getQueryParam(url, 'exchange') || 'NASDAQ';
            const symbol = getQueryParam(url, 'symbol') || '';
            if (symbol) {
                const alreadyExists = watchlist.some(
                    item => item.symbol.toUpperCase() === symbol.toUpperCase() && item.exchange?.toUpperCase() === exchange.toUpperCase()
                );
                if (!alreadyExists) {
                    const price = mockPrices[symbol.toUpperCase()] || 150.00;
                    const newItem = {
                        id: 'w_' + Date.now(),
                        symbol: symbol.toUpperCase(),
                        exchange: exchange.toUpperCase(),
                        currentPrice: price,
                        dailyChange: 0,
                        dailyPercentChange: 0
                    };
                    watchlist.push(newItem);
                    localStorage.setItem('guest_watchlist', JSON.stringify(watchlist));
                }
            }
            responseData = { success: true };
        }
        // DELETE /Watchlist/remove/:id
        else if (url.includes('/remove')) {
            const match = /\/Watchlist\/remove\/([^\/\?]+)/.exec(url);
            const itemId = match ? match[1] : null;
            const updated = watchlist.filter(item => item.id !== itemId);
            localStorage.setItem('guest_watchlist', JSON.stringify(updated));
            responseData = { success: true };
        }
    }

    return {
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
    };
};

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const isAuthOrPassThrough = config.url && (
            config.url.includes('/User/register') ||
            config.url.includes('/User/login') ||
            config.url.includes('/User/google-login') ||
            config.url.includes('/User/link-google') ||
            config.url.includes('/User/confirm-google-link') ||
            config.url.includes('/Health')
        );

        if (localStorage.getItem('isGuest') === 'true' && !isAuthOrPassThrough) {
            config.adapter = guestAdapter;
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Sanitize error response data to prevent any database leak!
        if (error.response && error.response.data) {
            let rawMsg = '';
            if (typeof error.response.data === 'string') {
                rawMsg = error.response.data;
            } else if (typeof error.response.data.message === 'string') {
                rawMsg = error.response.data.message;
            }
            
            const lower = rawMsg.toLowerCase();
            const isDbBreach = 
                lower.includes('dbo.') ||
                lower.includes('ix_') ||
                lower.includes('database') ||
                lower.includes('sql') ||
                lower.includes('table') ||
                lower.includes('column') ||
                lower.includes('duplicate key') ||
                lower.includes('unique index') ||
                lower.includes('constraint') ||
                lower.includes('terminated') ||
                lower.includes('foreign key') ||
                lower.includes('entity');
                
            if (isDbBreach) {
                if (typeof error.response.data === 'string') {
                    error.response.data = 'Failed to perform operation. Please try again.';
                } else if (typeof error.response.data.message === 'string') {
                    error.response.data.message = 'Failed to perform operation. Please try again.';
                }
            }
        }

        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                isRefreshing = false;
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return Promise.reject(error);
            }

            try {
                // Use standard axios to avoid triggering this interceptor again
                const response = await axios.post(`${baseURL}/User/refresh-token`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken, userId } = response.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                localStorage.setItem('userId', userId);

                axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return axiosClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;