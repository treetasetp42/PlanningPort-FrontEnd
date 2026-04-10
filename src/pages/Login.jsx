import { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Typography, Box, Paper,
    useTheme, useMediaQuery,
    Divider, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tabIndex, setTabIndex] = useState(0);
    const [credentials, setCredentials] = useState({ remoteUser: '', remotePassword: '', email: '' });
    const [linkDialog, setLinkDialog] = useState({ open: false, email: '', credential: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('expired') === 'true') {
            enqueueSnackbar(t('login.session_expired'), { variant: 'warning', preventDuplicate: true });
            // Clean up the URL
            navigate('/login', { replace: true });
        }
    }, [location, enqueueSnackbar, t, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (tabIndex === 0) {
            // LOGIN
            try {
                const response = await axiosClient.post(UrlPP.User.Login, {
                    remoteUser: credentials.remoteUser,
                    remotePassword: credentials.remotePassword
                });
                dispatch(loginSuccess(response.data));
                enqueueSnackbar(t('login.login_success'), { variant: 'success' });
                navigate('/dashboard');
            } catch (error) {
                enqueueSnackbar(t('login.login_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
            }
        } else {
            // REGISTER
            try {
                await axiosClient.post(UrlPP.User.Register, credentials);
                enqueueSnackbar(t('login.register_success'), { variant: 'success' });
                setTabIndex(0);
                setCredentials({ ...credentials, remotePassword: '' });
            } catch (error) {
                enqueueSnackbar(t('login.register_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axiosClient.post(UrlPP.User.GoogleLogin, {
                credential: credentialResponse.credential
            });
            dispatch(loginSuccess(response.data));
            enqueueSnackbar(t('login.login_success'), { variant: 'success' });
            navigate('/dashboard');
        } catch (error) {
            if (error.response?.status === 409 && error.response?.data?.requiresLinking) {
                // Open confirmation dialog instead of failing
                setLinkDialog({
                    open: true,
                    email: error.response.data.email,
                    credential: credentialResponse.credential
                });
            } else {
                enqueueSnackbar(t('login.login_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
            }
        }
    };

    const handleConfirmLink = async () => {
        try {
            const response = await axiosClient.post(UrlPP.User.ConfirmGoogleLink, {
                credential: linkDialog.credential
            });
            setLinkDialog({ open: false, email: '', credential: '' });
            dispatch(loginSuccess(response.data));
            enqueueSnackbar(t('login.link_success'), { variant: 'success' });
            navigate('/dashboard');
        } catch (error) {
            enqueueSnackbar(t('login.link_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
            setLinkDialog({ open: false, email: '', credential: '' });
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
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} variant="fullWidth">
                            <Tab label={t('common.login')} sx={{ fontWeight: 700 }} />
                            <Tab label={t('login.register_tab')} sx={{ fontWeight: 700 }} />
                        </Tabs>
                    </Box>

                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="800" color="primary.main">
                            {tabIndex === 0 ? t('login.title') : t('login.register_title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {tabIndex === 0 ? t('login.subtitle') : t('login.register_subtitle')}
                        </Typography>
                    </Box>

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            required
                            label={t('common.username')}
                            margin="normal"
                            variant="outlined"
                            value={credentials.remoteUser}
                            onChange={(e) => setCredentials({ ...credentials, remoteUser: e.target.value })}
                        />
                        {tabIndex === 1 && (
                            <TextField
                                fullWidth
                                label={t('login.email_optional')}
                                type="email"
                                margin="normal"
                                variant="outlined"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            />
                        )}
                        <TextField
                            fullWidth
                            required
                            label={t('common.password')}
                            type="password"
                            margin="normal"
                            variant="outlined"
                            value={credentials.remotePassword}
                            onChange={(e) => setCredentials({ ...credentials, remotePassword: e.target.value })}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                        >
                            {tabIndex === 0 ? t('common.login') : t('login.register_button')}
                        </Button>

                        {tabIndex === 0 && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => navigate('/forgot-password')}
                                    sx={{ fontWeight: 600, textTransform: 'none' }}
                                >
                                    {t('login.forgot_password_link')}
                                </Button>
                            </Box>
                        )}
                    </form>

                    <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant="body2" color="text.secondary">OR</Typography>
                        <Divider sx={{ flex: 1 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => enqueueSnackbar(t('login.login_failed'), { variant: 'error' })}
                            useOneTap={false} // Disable auto-prompt when we have linking flows
                            theme="filled_blue"
                            shape="pill"
                            text={tabIndex === 0 ? 'signin_with' : 'signup_with'}
                        />
                    </Box>
                </Paper>
            </Box>

            <Dialog open={linkDialog.open} onClose={() => setLinkDialog({ open: false, email: '', credential: '' })}>
                <DialogTitle fontWeight={800}>{t('login.link_confirm_title')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('login.link_confirm_body1')} <strong>{linkDialog.email}</strong> {t('login.link_confirm_body2')}
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        {t('login.link_confirm_question')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setLinkDialog({ open: false, email: '', credential: '' })} color="inherit">
                        {t('common.cancel')}
                    </Button>
                    <Button variant="contained" onClick={handleConfirmLink}>
                        {t('login.link_account')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Login;
