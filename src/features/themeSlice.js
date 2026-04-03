import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    darkMode: localStorage.getItem('darkMode') === 'true',
    primaryColor: localStorage.getItem('primaryColor') || '#1976d2',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.darkMode = !state.darkMode;
            localStorage.setItem('darkMode', state.darkMode);
        },
        setPrimaryColor: (state, action) => {
            state.primaryColor = action.payload;
            localStorage.setItem('primaryColor', action.payload);
        },
    },
});

export const { toggleTheme, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;