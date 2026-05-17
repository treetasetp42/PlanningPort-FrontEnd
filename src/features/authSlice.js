import { createSlice } from '@reduxjs/toolkit';

const parsePermissions = () => {
    try {
        return JSON.parse(localStorage.getItem('permissions') || '[]');
    } catch {
        return [];
    }
};

const initialState = {
    user: localStorage.getItem('userId') || null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    permissions: parsePermissions(),
    roleName: localStorage.getItem('roleName') || null,
    loading: false,
    isGuest: localStorage.getItem('isGuest') === 'true',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.userId;
            state.isAuthenticated = true;
            state.isGuest = false;
            state.permissions = action.payload.permissions || [];
            state.roleName = action.payload.roleName || null;

            localStorage.setItem('token', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
            localStorage.setItem('userId', action.payload.userId);
            localStorage.setItem('permissions', JSON.stringify(action.payload.permissions || []));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.removeItem('isGuest');
            if (action.payload.roleName) {
                localStorage.setItem('roleName', action.payload.roleName);
            } else {
                localStorage.removeItem('roleName');
            }
        },
        loginGuest: (state) => {
            state.user = 'Guest';
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = true;
            state.isGuest = true;
            state.roleName = 'Guest';
            state.permissions = [
                "PORTFOLIO_VIEW",
                "PORTFOLIO_CREATE",
                "PORTFOLIO_DELETE",
                "MARKET_VIEW",
                "MARKET_TRADE"
            ];

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('isGuest', 'true');
            localStorage.setItem('userId', 'Guest');
            localStorage.setItem('roleName', 'Guest');
            localStorage.setItem('permissions', JSON.stringify(state.permissions));
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            state.permissions = [];
            state.roleName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('permissions');
            localStorage.removeItem('roleName');
            localStorage.removeItem('isGuest');
            localStorage.removeItem('isAuthenticated');
        },
    },
});

export const { loginSuccess, loginGuest, logout } = authSlice.actions;
export default authSlice.reducer;