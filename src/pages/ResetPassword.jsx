import { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';

const ResetPassword = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ token: '', email: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const email = queryParams.get('email');
        if (!token || !email) {
            enqueueSnackbar(t('login.reset_failed'), { variant: 'error' });
            navigate('/login');
        } else {
            setFormData(prev => ({ ...prev, token, email }));
        }
    }, [location, navigate, enqueueSnackbar, t]);

    const handleReset = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            enqueueSnackbar(t('login.password_mismatch'), { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post(UrlPP.User.ResetPassword, {
                token: formData.token,
                email: formData.email,
                newPassword: formData.newPassword
            });
            enqueueSnackbar(t('login.reset_success'), { variant: 'success' });
            navigate('/login');
        } catch (error) {
            enqueueSnackbar(error.response?.data || t('login.reset_failed'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', width: '100%' }}>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="800" color="primary.main">
                            {t('login.reset_password_title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('login.reset_password_subtitle')}
                        </Typography>
                    </Box>

                    <form onSubmit={handleReset}>
                        <TextField
                            fullWidth
                            required
                            label={t('login.new_password')}
                            type="password"
                            variant="outlined"
                            autoComplete="new-password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            required
                            label={t('login.confirm_password')}
                            type="password"
                            variant="outlined"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                        >
                            {t('login.reset_password_title')}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default ResetPassword;
