import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const FullScreenLoader = ({ message = "Initializing InvestPlanner..." }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.background.default,
                zIndex: 9999,
            }}
        >
            <Box sx={{ position: 'relative', mb: 3 }}>
                <CircularProgress
                    size={80}
                    thickness={2}
                    sx={{ color: theme.palette.primary.main }}
                />
                <Box
                    component="img"
                    src="/favicon.svg"
                    alt="Logo"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        height: 35,
                        width: 35
                    }}
                />
            </Box>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'pulse 2s infinite'
                }}
            >
                {message}
            </Typography>

            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                `}
            </style>
        </Box>
    );
};

export default FullScreenLoader;
