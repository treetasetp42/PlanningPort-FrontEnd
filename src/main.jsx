import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import './i18n';
import { store } from './store';
import { getAppTheme } from './theme';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import NotifierPipe from './components/NotifierPipe';
import useDynamicFavicon from './hooks/useDynamicFavicon';

const Root = () => {
  const { darkMode, primaryColor, fontSize } = useSelector((state) => state.theme);
  const theme = getAppTheme(darkMode, primaryColor, fontSize);

  // Dynamically change browser tab favicon to match user's selected primary color and theme mode
  useDynamicFavicon(darkMode, primaryColor);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <NotifierPipe />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Root />
  </Provider>
);