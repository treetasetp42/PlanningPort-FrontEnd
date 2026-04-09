import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // This will be watched by a special global component
    enqueueSnackbar: (state, action) => {
      state.notifications.push({
        ...action.payload,
        key: action.payload.key || new Date().getTime() + Math.random()
      });
    },
    removeSnackbar: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.key !== action.payload
      );
    }
  }
});

export const { enqueueSnackbar, removeSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
