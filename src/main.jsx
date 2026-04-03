import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import './i18n';
import { store } from './store';
import { getAppTheme } from './theme';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const Root = () => {
  const { darkMode, primaryColor } = useSelector((state) => state.theme);
  const theme = getAppTheme(darkMode, primaryColor);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Root />
  </Provider>
);