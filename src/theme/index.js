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

/**
 * Typography scales per font size preset.
 * Large mode: h1-h4 are locked at MUI defaults; only small text variants grow.
 * Small mode: base fontSize reduced so all variants scale down proportionally.
 * Normal mode: MUI default (fontSize: 14).
 */
const getTypographyScale = (fontSize) => {
    if (fontSize === 'small') {
        return {
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 12, // base rem multiplier — all variants scale down
            button: { textTransform: 'none', fontWeight: 600 },
        };
    }

    if (fontSize === 'large') {
        return {
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 14, // keep base same — we control individual variants below
            button: { textTransform: 'none', fontWeight: 600 },
            // Lock big headings — keep them at MUI defaults so they don't shrink
            h1: { fontSize: '6rem', fontWeight: 700 },      
            h2: { fontSize: '3.75rem', fontWeight: 700 },   
            h3: { fontSize: '3rem', fontWeight: 700 },      
            h4: { fontSize: '2.125rem', fontWeight: 700 }, 
            // Scale up smaller text variants for readability
            h5: { fontSize: '1.5rem', fontWeight: 600 },    
            h6: { fontSize: '1.25rem', fontWeight: 600 },   
            subtitle1: { fontSize: '1.125rem', fontWeight: 600 }, 
            subtitle2: { fontSize: '1.0625rem', fontWeight: 600 },
            body1: { fontSize: '1.125rem' },                      
            body2: { fontSize: '1.0625rem' },                     
            caption: { fontSize: '1rem' },                        
            overline: { fontSize: '0.875rem' },                   
        };
    }

    // 'normal' — MUI defaults
    return {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: 14,
        button: { textTransform: 'none', fontWeight: 600 },
    };
};

export const getAppTheme = (darkMode, primaryColor = '#6C5DD3', fontSize = 'normal') => createTheme({
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
    typography: getTypographyScale(fontSize),
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