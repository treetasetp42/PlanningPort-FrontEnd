import { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Typography, Box, Paper,
    useTheme, useMediaQuery
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

const Login = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [credentials, setCredentials] = useState({ remoteUser: '', remotePassword: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
 
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post(UrlPP.User.Login, credentials);
            dispatch(loginSuccess(response.data));
            enqueueSnackbar(t('login.login_success'), { variant: 'success' });
            navigate('/dashboard');
        } catch (error) {
            enqueueSnackbar(t('login.login_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{
                mt: { xs: 4, sm: 8 },
                px: { xs: 2, sm: 0 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Paper elevation={0} sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: { xs: 3, sm: 4 },
                    border: '1px solid',
                    borderColor: 'divider',
                    width: '100%'
                }}>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="800" color="primary.main">
                            {t('login.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('login.subtitle')}
                        </Typography>
                    </Box>

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label={t('common.username')}
                            margin="normal"
                            variant="outlined"
                            onChange={(e) => setCredentials({ ...credentials, remoteUser: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label={t('common.password')}
                            type="password"
                            margin="normal"
                            variant="outlined"
                            onChange={(e) => setCredentials({ ...credentials, remotePassword: e.target.value })}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                        >
                            {t('common.login')}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
