import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#6C5DD3', // UKO Indigo
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FFB648',
        },
        background: {
            default: '#F7F8FA',
            paper: '#ffffff',
        },
        text: {
            primary: '#2D3748',
            secondary: '#718096',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: "'Public Sans', sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                    border: 'none',
                },
                elevation1: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

export const getAppTheme = (darkMode, primaryColor = '#6C5DD3') => createTheme({
    palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: primaryColor },
        secondary: { main: '#FFB648' },
        background: {
            default: darkMode ? '#1A202C' : '#F7F8FA',
            paper: darkMode ? '#2D3748' : '#ffffff',
        },
        text: {
            primary: darkMode ? '#ffffff' : '#2D3748',
            secondary: darkMode ? '#A0AEC0' : '#718096',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: "'Public Sans', sans-serif",
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: darkMode 
                        ? '0px 4px 20px rgba(0, 0, 0, 0.2)' 
                        : '0px 4px 20px rgba(0, 0, 0, 0.05)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});



export default theme;