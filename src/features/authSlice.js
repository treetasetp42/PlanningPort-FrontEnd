import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: localStorage.getItem('userId') || null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.userId; // ค่าจาก Backend [cite: 2026-04-02]
            state.isAuthenticated = true;

            localStorage.setItem('token', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
            localStorage.setItem('userId', action.payload.userId);
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId'); // ลบออกด้วยตอน logout [cite: 2026-04-02]
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;