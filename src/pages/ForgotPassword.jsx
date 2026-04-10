import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post(UrlPP.User.ForgotPassword, { email });
            setSubmitted(true);
            enqueueSnackbar(t('login.reset_email_sent'), { variant: 'info' });
        } catch (error) {
            enqueueSnackbar(t('common.error'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', width: '100%' }}>
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate('/login')} size="small">
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" fontWeight="800">
                            {t('login.forgot_password_title')}
                        </Typography>
                    </Box>

                    {!submitted ? (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('login.forgot_password_subtitle')}
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    required
                                    label={t('common.email')}
                                    type="email"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                >
                                    {t('login.send_reset_link')}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                {t('login.reset_email_sent')}
                            </Typography>
                            <Button variant="outlined" onClick={() => navigate('/login')} sx={{ borderRadius: 2 }}>
                                {t('common.back_to_login')}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPassword;
