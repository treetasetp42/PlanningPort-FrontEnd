import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Divider, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { ShowChart, Payments, Code, Language, CurrencyBitcoin, Edit, Delete, Settings } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { IconButton, Button as MuiButton } from '@mui/material';
import TransactionModal from '../components/TransactionModal';

const Dashboard = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const userId = useSelector((state) => state.auth.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const fetchDashboard = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await axiosClient.get(UrlPP.Transaction.Dashboard(userId));
            setData(res.data);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [userId]);

    const handleDelete = async (symbol) => {
        if (!window.confirm(t('common.confirm_delete') || `Are you sure you want to remove ${symbol}?`)) return;
        try {
            await axiosClient.delete(UrlPP.Transaction.Delete(userId, symbol));
            fetchDashboard();
        } catch (err) {
            alert(t('common.error'));
        }
    };

    const handleEdit = (asset) => {
        setSelectedAsset(asset);
        setModalOpen(true);
    };

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
                            borderRadius: { xs: 2, md: 2 },
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
                            <Paper sx={{ p: 3, borderRadius: { xs: 2, md: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">{t('dashboard.total_investment')}</Typography>
                                        <Typography variant="subtitle1" fontWeight="700">
                                            ${(data?.totalInvestment || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">{t('dashboard.profit_loss')}</Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="800"
                                            sx={{ color: data?.totalProfit >= 0 ? 'success.main' : 'error.main' }}
                                        >
                                            {data?.totalProfit >= 0 ? '+' : '-'}${Math.abs(data?.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={12}>
                            <Paper sx={{ p: 3, borderRadius: { xs: 2, md: 2 } }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="700">
                    {t('dashboard.breakdown')}
                </Typography>
                <MuiButton
                    size="small"
                    startIcon={<Settings sx={{ fontSize: 16 }} />}
                    onClick={() => setIsEditMode(!isEditMode)}
                    variant={isEditMode ? "contained" : "outlined"}
                    color={isEditMode ? "primary" : "inherit"}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    {isEditMode ? t('common.done') || 'Done' : t('common.manage') || 'Manage'}
                </MuiButton>
            </Box>

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
                                    borderRadius: { xs: 2, md: 2 },
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isEditMode && (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(asset)}
                                                    sx={{ bgcolor: 'action.hover', color: 'primary.main', width: 30, height: 30 }}
                                                >
                                                    <Edit sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(asset.symbol)}
                                                    sx={{ bgcolor: 'error.light', color: 'error.main', width: 30, height: 30 }}
                                                >
                                                    <Delete sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                        {!isEditMode && (
                                            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', width: 34, height: 34, justifyContent: 'center', alignItems: 'center' }}>
                                                {getIcon(asset.subtype)}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2, opacity: 0.6 }} />

                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" color="text.secondary">{t('dashboard.holdings')}</Typography>
                                        <Typography variant="body2" fontWeight="700">{asset.holdings}</Typography>
                                    </Grid>
                                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">{t('dashboard.average_cost')}</Typography>
                                        <Typography variant="body2" fontWeight="700">
                                            ${(asset.averageCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
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

            {/* Modal สำหรับแก้ไขธุรกรรม  */}
            {selectedAsset && (
                <TransactionModal
                    open={modalOpen}
                    onClose={() => { setModalOpen(false); setSelectedAsset(null); }}
                    symbol={selectedAsset.symbol}
                    initialPrice={selectedAsset.averageCost}
                    initialValues={selectedAsset}
                    isEdit={true}
                    onSuccess={() => {
                        fetchDashboard();
                        alert(t('common.success') || "Updated successfully");
                    }}
                />
            )}
        </Container>
    );
};

export default Dashboard;