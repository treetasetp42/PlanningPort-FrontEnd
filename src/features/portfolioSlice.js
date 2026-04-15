import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';

export const fetchPortfolios = createAsyncThunk(
    'portfolios/fetchPortfolios',
    async (userId, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosClient.get(UrlPP.Portfolio.Get(userId));
            const portfolios = response.data;
            if (portfolios && portfolios.length > 0) {
                // Initial load: pick the first one as active if not already set
                return portfolios;
            }
            return [];
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState: {
        list: [],
        activePortfolioId: null,
        loading: false,
        error: null,
    },
    reducers: {
        setActivePortfolio: (state, action) => {
            state.activePortfolioId = action.payload;
            // Optionally persist it in localStorage if desired
            localStorage.setItem('activePortfolioId', action.payload);
        },
        clearPortfolios: (state) => {
            state.list = [];
            state.activePortfolioId = null;
            localStorage.removeItem('activePortfolioId');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPortfolios.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPortfolios.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
                
                // Set active portfolio if not set
                if (action.payload.length > 0) {
                    const savedId = localStorage.getItem('activePortfolioId');
                    const exists = action.payload.find(p => p.id === savedId);
                    
                    if (exists) {
                        state.activePortfolioId = savedId;
                    } else if (!state.activePortfolioId || !action.payload.find(p => p.id === state.activePortfolioId)) {
                        state.activePortfolioId = action.payload[0].id;
                        localStorage.setItem('activePortfolioId', action.payload[0].id);
                    }
                }
            })
            .addCase(fetchPortfolios.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setActivePortfolio, clearPortfolios } = portfolioSlice.actions;
export default portfolioSlice.reducer;
