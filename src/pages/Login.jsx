import { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Typography, Box, Paper,
    useTheme, useMediaQuery,
    Divider, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Checkbox, Link
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, loginGuest } from '../features/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '../components/Logo';

const Login = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language ? i18n.language.split('-')[0] : 'en';
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tabIndex, setTabIndex] = useState(0);
    const [credentials, setCredentials] = useState({ remoteUser: '', remotePassword: '', confirmPassword: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [linkDialog, setLinkDialog] = useState({ open: false, email: '', credential: '' });

    const [consentChecked, setConsentChecked] = useState(false);
    const [consentDialogOpen, setConsentDialogOpen] = useState({ open: false, viewOnly: false });

    // Password requirements validation rules
    const password = credentials.remotePassword || '';
    const isMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isPasswordValid = isMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecial;
    const passwordsMatch = password !== '' && password === credentials.confirmPassword;

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

    const handleGuestLogin = () => {
        dispatch(loginGuest());
        enqueueSnackbar(t('login.login_success'), { variant: 'success' });
        navigate('/');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoadingMessage(tabIndex === 0 ? t('common.login') : t('login.register_button'));

        // REQUIREMENT 3: Cold Start Mitigation UX
        // If the backend is cold, the request might take 15-20s. 
        // We show a reassuring message after 3 seconds of waiting.
        const coldStartTimer = setTimeout(() => {
            setLoadingMessage(t('login.cold_start_warning', { defaultValue: 'Connecting to secure server... Please wait' }));
        }, 3000);

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
            } finally {
                clearTimeout(coldStartTimer);
                setIsLoading(false);
            }
        } else {
            // REGISTER
            if (!credentials.email || !credentials.email.trim()) {
                enqueueSnackbar(t('login.please_enter_email'), { variant: 'error' });
                setIsLoading(false);
                clearTimeout(coldStartTimer);
                return;
            }
            if (!isPasswordValid || !passwordsMatch || !consentChecked) {
                enqueueSnackbar(t('login.register_failed') + ': Validation error', { variant: 'error' });
                setIsLoading(false);
                clearTimeout(coldStartTimer);
                return;
            }

            try {
                await axiosClient.post(UrlPP.User.Register, {
                    remoteUser: credentials.remoteUser,
                    remotePassword: credentials.remotePassword,
                    email: credentials.email
                });
                enqueueSnackbar(t('login.register_success'), { variant: 'success' });
                setTabIndex(0);
                setCredentials({ remoteUser: '', remotePassword: '', confirmPassword: '', email: '' });
                setConsentChecked(false);
            } catch (error) {
                enqueueSnackbar(t('login.register_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
            } finally {
                clearTimeout(coldStartTimer);
                setIsLoading(false);
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setLoadingMessage(t('common.login'));

        const coldStartTimer = setTimeout(() => {
            setLoadingMessage(t('login.cold_start_warning', { defaultValue: 'Connecting to secure server... Please wait' }));
        }, 3000);

        try {
            const response = await axiosClient.post(UrlPP.User.GoogleLogin, {
                credential: credentialResponse.credential
            });
            dispatch(loginSuccess(response.data));
            enqueueSnackbar(t('login.login_success'), { variant: 'success' });
            navigate('/dashboard');
        } catch (error) {
            if (error.response?.status === 409 && error.response?.data?.requiresLinking) {
                setLinkDialog({
                    open: true,
                    email: error.response.data.email,
                    credential: credentialResponse.credential
                });
            } else {
                enqueueSnackbar(t('login.login_failed') + ': ' + (error.response?.data || ''), { variant: 'error' });
            }
        } finally {
            clearTimeout(coldStartTimer);
            setIsLoading(false);
        }
    };

    const handleConfirmLink = async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
                        <Tabs value={tabIndex} onChange={(e, newValue) => {
                            setTabIndex(newValue);
                            setConsentChecked(false);
                            setCredentials({ remoteUser: '', remotePassword: '', confirmPassword: '', email: '' });
                        }} variant="fullWidth">
                            <Tab label={t('common.login')} sx={{ fontWeight: 700 }} />
                            <Tab label={t('login.register_tab')} sx={{ fontWeight: 700 }} />
                        </Tabs>
                    </Box>

                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        {tabIndex === 0 && <Logo height={110} style={{ margin: '0 auto 16px auto' }} />}
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
                            disabled={isLoading}
                            value={credentials.remoteUser}
                            onChange={(e) => setCredentials({ ...credentials, remoteUser: e.target.value })}
                        />
                        {tabIndex === 1 && (
                            <TextField
                                fullWidth
                                required
                                label={t('login.email_optional')}
                                type="email"
                                margin="normal"
                                variant="outlined"
                                disabled={isLoading}
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
                            disabled={isLoading}
                            value={credentials.remotePassword}
                            onChange={(e) => setCredentials({ ...credentials, remotePassword: e.target.value })}
                        />

                        {/* Password Requirements Indicator */}
                        {tabIndex === 1 && password !== '' && (
                            <Box sx={{ mt: 1, mb: 1, textAlign: 'left', px: 1 }}>
                                <Typography variant="caption" fontWeight="700" color="text.secondary" gutterBottom display="block">
                                    {t('login.password_requirements_title')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {[
                                        { met: isMinLength, label: t('login.password_req_length') },
                                        { met: hasLowercase, label: t('login.password_req_lowercase') },
                                        { met: hasUppercase, label: t('login.password_req_uppercase') },
                                        { met: hasNumber, label: t('login.password_req_number') },
                                        { met: hasSpecial, label: t('login.password_req_special') }
                                    ].map((req, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: req.met ? 'success.main' : 'text.disabled',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color={req.met ? 'success.main' : 'text.secondary'}
                                                sx={{ transition: 'color 0.2s' }}
                                            >
                                                {req.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {tabIndex === 1 && (
                            <TextField
                                fullWidth
                                required
                                label={t('login.confirm_password_label')}
                                type="password"
                                margin="normal"
                                variant="outlined"
                                disabled={isLoading}
                                value={credentials.confirmPassword}
                                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                                error={credentials.confirmPassword !== '' && !passwordsMatch}
                                helperText={credentials.confirmPassword !== '' && !passwordsMatch ? t('login.password_mismatch') : ''}
                            />
                        )}

                        {/* Consent Checkbox */}
                        {tabIndex === 1 && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', textAlign: 'left', px: 1 }}>
                                <Checkbox
                                    checked={consentChecked}
                                    onClick={() => setConsentDialogOpen({ open: true, viewOnly: false })}
                                    color="primary"
                                    sx={{ p: 0, mr: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="body2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConsentDialogOpen({ open: true, viewOnly: false });
                                        }}
                                        sx={{ textDecoration: 'underline', color: 'inherit', fontWeight: 600, textAlign: 'left' }}
                                    >
                                        {t('login.consent_checkbox')}
                                    </Link>
                                </Typography>
                            </Box>
                        )}

                        {tabIndex === 0 ? (
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={isLoading}
                                sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                            >
                                {isLoading ? loadingMessage : t('common.login')}
                            </Button>
                        ) : (
                            consentChecked && (
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={isLoading || !isPasswordValid || !passwordsMatch}
                                    sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                >
                                    {isLoading ? loadingMessage : t('login.register_button')}
                                </Button>
                            )
                        )}

                        {tabIndex === 0 && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </Box>

                    {/* Guest Mode Button */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1,
                                borderRadius: 8,
                                borderWidth: '2px !important',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            {t('login.guest_mode') || (i18n.language.startsWith('th') ? 'ผู้เยี่ยมชม / Guest Mode' : 'Guest Mode / ผู้เยี่ยมชม')}
                        </Button>
                    </Box>

                    {/* Google TOS and Privacy Policy disclaimer */}
                    <Box sx={{ mt: 2, textAlign: 'center', px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('common.login') === 'เข้าสู่ระบบ' ? (
                                <>
                                    ในการคลิก 'ดำเนินการต่อด้วย Google' คุณยอมรับ{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="caption"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConsentDialogOpen({ open: true, viewOnly: true });
                                        }}
                                        sx={{ verticalAlign: 'baseline', fontWeight: 600, textDecoration: 'underline', color: 'text.secondary' }}
                                    >
                                        ข้อตกลงการให้บริการ
                                    </Link>{' '}
                                    และ{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="caption"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConsentDialogOpen({ open: true, viewOnly: true });
                                        }}
                                        sx={{ verticalAlign: 'baseline', fontWeight: 600, textDecoration: 'underline', color: 'text.secondary' }}
                                    >
                                        นโยบายความเป็นส่วนตัว
                                    </Link>
                                </>
                            ) : (
                                <>
                                    By clicking 'Continue with Google', you agree to our{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="caption"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConsentDialogOpen({ open: true, viewOnly: true });
                                        }}
                                        sx={{ verticalAlign: 'baseline', fontWeight: 600, textDecoration: 'underline', color: 'text.secondary' }}
                                    >
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="caption"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConsentDialogOpen({ open: true, viewOnly: true });
                                        }}
                                        sx={{ verticalAlign: 'baseline', fontWeight: 600, textDecoration: 'underline', color: 'text.secondary' }}
                                    >
                                        Privacy Policy
                                    </Link>
                                    .
                                </>
                            )}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Dialog open={linkDialog.open} onClose={() => !isLoading && setLinkDialog({ open: false, email: '', credential: '' })}>
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
                    <Button onClick={() => setLinkDialog({ open: false, email: '', credential: '' })} color="inherit" disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="contained" onClick={handleConfirmLink} disabled={isLoading}>
                        {isLoading ? loadingMessage : t('login.link_account')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Consent dialog (Terms of Service & Privacy Policy) */}
            <Dialog
                open={consentDialogOpen.open}
                onClose={() => setConsentDialogOpen((prev) => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>{t('login.consent_dialog_title')}</Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[{ key: 'en', label: 'EN' }, { key: 'th', label: 'TH' }].map(({ key, label }) => (
                            <Button
                                key={key}
                                size="small"
                                variant={currentLanguage === key ? 'contained' : 'text'}
                                onClick={() => i18n.changeLanguage(key)}
                                sx={{
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    px: 1.5,
                                    py: 0.25,
                                    fontSize: '0.7rem',
                                    minWidth: 'auto',
                                    ...(currentLanguage !== key && {
                                        color: 'text.secondary',
                                    })
                                }}
                            >
                                {label}
                            </Button>
                        ))}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.primary" paragraph sx={{ whiteSpace: 'pre-line', fontWeight: 500 }}>
                        {t('login.consent_dialog_body')}
                    </Typography>

                    <Typography variant="subtitle2" fontWeight="700" color="primary.main" gutterBottom sx={{ mt: 2 }}>
                        {t('login.consent_dialog_tos_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('login.consent_dialog_tos_body')}
                    </Typography>

                    <Typography variant="subtitle2" fontWeight="700" color="primary.main" gutterBottom sx={{ mt: 2 }}>
                        {t('login.consent_dialog_privacy_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('login.consent_dialog_privacy_body')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    {!consentDialogOpen.viewOnly ? (
                        <>
                            <Button
                                onClick={() => {
                                    setConsentChecked(false);
                                    setConsentDialogOpen({ open: false, viewOnly: false });
                                }}
                                sx={{ fontWeight: 700 }}
                                color="inherit"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setConsentChecked(true);
                                    setConsentDialogOpen({ open: false, viewOnly: false });
                                }}
                                sx={{ fontWeight: 700, borderRadius: 2 }}
                            >
                                {t('login.consent_dialog_accept')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => setConsentDialogOpen((prev) => ({ ...prev, open: false }))}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            {t('common.close')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Login;
