import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Divider, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { ShowChart, Payments, Code, Language, CurrencyBitcoin } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = useSelector((state) => state.auth.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const res = await axiosClient.get(`/Transaction/dashboard/${userId}`);
                setData(res.data);
            } catch (err) {
                console.error("Fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [userId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 2 } }}>
            <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" color="text.primary">
                        {t('dashboard.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('dashboard.welcome')}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    {/* Hero Card - Total Portfolio Value */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            height: '100%',
                            boxSizing: 'border-box',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: { xs: 3, md: 4 },
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: { xs: 120, md: 200 },
                                height: { xs: 120, md: 200 },
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                            {t('dashboard.total_value')}
                        </Typography>
                        <Typography variant={isMobile ? "h4" : "h2"} fontWeight="800">
                            {data?.totalValue >= 0 ? '' : '-'}${Math.abs(data?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.5, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 }}>
                            <Typography variant="caption" fontWeight="700">
                                {t('dashboard.global_assets')}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12} sm={6} lg={12}>
                            <Paper sx={{ p: 3, borderRadius: { xs: 3, md: 4 } }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600" gutterBottom>
                                    {t('dashboard.profit_loss')}
                                </Typography>
                                <Typography
                                    variant={isMobile ? "h5" : "h4"}
                                    fontWeight="800"
                                    sx={{ color: data?.totalProfit >= 0 ? 'success.main' : 'error.main' }}
                                >
                                    {data?.totalProfit >= 0 ? '+' : '-'}${Math.abs(data?.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={12}>
                            <Paper sx={{ p: 3, borderRadius: { xs: 3, md: 4 } }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600" gutterBottom>
                                    {t('dashboard.statistics')}
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800">
                                    {t('dashboard.assets_count', { count: data?.assets?.length || 0 })}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Asset List Section */}
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                {t('dashboard.breakdown')}
            </Typography>

            <Grid container spacing={isMobile ? 2 : 3}>
                {data?.assets?.map((asset) => {
                    const getIcon = (subtype) => {
                        const s = subtype?.toLowerCase();
                        if (s?.includes('tech')) return <Code sx={{ color: 'primary.main', fontSize: 18 }} />;
                        if (s?.includes('stock')) return <ShowChart sx={{ color: 'primary.main', fontSize: 18 }} />;
                        if (s?.includes('crypto')) return <CurrencyBitcoin sx={{ color: 'primary.main', fontSize: 18 }} />;
                        if (s?.includes('cash')) return <Payments sx={{ color: 'primary.main', fontSize: 18 }} />;
                        return <Language sx={{ color: 'primary.main', fontSize: 18 }} />;
                    };
                    return (
                        <Grid item xs={12} sm={6} md={4} key={asset.symbol}>
                            <Paper
                                sx={{
                                    p: { xs: 2, md: 3 },
                                    borderRadius: { xs: 3, md: 4 },
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: isMobile ? 'none' : 'translateY(-4px)',
                                        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="800">{asset.symbol}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                            {asset.assetType} • {asset.subtype}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', width: 34, height: 34, justifyContent: 'center', alignItems: 'center' }}>
                                        {getIcon(asset.subtype)}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2, opacity: 0.6 }} />

                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">{t('dashboard.holdings')}</Typography>
                                        <Typography variant="body2" fontWeight="700">{asset.holdings}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary">{t('dashboard.profit_loss')}</Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight="700"
                                            sx={{ color: asset.profitLoss >= 0 ? 'success.main' : 'error.main' }}
                                        >
                                            {asset.profitLoss >= 0 ? '+' : '-'}${Math.abs(asset.profitLoss || 0).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default Dashboard;