import { createSlice } from '@reduxjs/toolkit';

const parsePermissions = () => {
    try {
        return JSON.parse(localStorage.getItem('permissions') || '[]');
    } catch {
        return [];
    }
};

const initialState = {
    user: null, // Set to null instead of mockup or localStorage
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: false, // Start as false until validated
    permissions: [],
    roleName: null,
    loading: false, // Added to track auth actions
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
            state.permissions = action.payload.permissions || [];
            state.roleName = action.payload.roleName || null;

            localStorage.setItem('token', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
            localStorage.setItem('userId', action.payload.userId);
            localStorage.setItem('permissions', JSON.stringify(action.payload.permissions || []));
            if (action.payload.roleName) localStorage.setItem('roleName', action.payload.roleName);
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.permissions = [];
            state.roleName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('permissions');
            localStorage.removeItem('roleName');
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;