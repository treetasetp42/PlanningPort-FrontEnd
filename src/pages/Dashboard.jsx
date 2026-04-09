import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Divider, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { ShowChart, Payments, Code, Language, CurrencyBitcoin, Edit, Delete, Settings, AddCircle, RemoveCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { IconButton, Button as MuiButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import SummaryCard from '../components/SummaryCard';
import CashFlowDialog from '../components/CashFlowDialog';
import TransactionHistoryDialog from '../components/TransactionHistoryDialog';

const Dashboard = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // UI Dialogs State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [symbolToDelete, setSymbolToDelete] = useState('');
    const [cashDialogOpen, setCashDialogOpen] = useState(false);
    const [cashDialogType, setCashDialogType] = useState('deposit'); // 'deposit' or 'withdraw'
    const [cashAmount, setCashAmount] = useState('');
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

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

    const handleDeleteRequest = (symbol) => {
        setSymbolToDelete(symbol);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axiosClient.delete(UrlPP.Transaction.Delete(userId, symbolToDelete));
            enqueueSnackbar(t('common.success'), { variant: 'success' });
            fetchDashboard();
        } catch (err) {
            enqueueSnackbar(t('common.error'), { variant: 'error' });
        }
    };

    const handleOpenCashDialog = (type) => {
        setCashDialogType(type);
        setCashAmount('');
        setCashDialogOpen(true);
    };

    const handleCashSubmit = async (amount) => {
        try {
            if (cashDialogType === 'deposit') {
                await axiosClient.post(UrlPP.Cash.Deposit(userId, amount));
                enqueueSnackbar(t('common.success'), { variant: 'success' });
            } else {
                // Check balance locally first for better UX
                if (data?.cashBalance < amount) {
                    enqueueSnackbar(t('dashboard.insufficient_balance') || "Insufficient balance", { variant: 'error' });
                    return;
                }
                await axiosClient.post(UrlPP.Cash.Withdraw(userId, amount));
                enqueueSnackbar(t('common.success'), { variant: 'success' });
            }
            setCashDialogOpen(false);
            fetchDashboard();
        } catch (err) {
            enqueueSnackbar(err.response?.data || "Operation failed", { variant: 'error' });
        }
    };

    const handleEdit = (asset) => {
        setSelectedAsset(asset);
        setModalOpen(true);
    };

    const summaryCardsData = [
        {
            title: t('dashboard.total_investment'),
            value: `$${(data?.totalInvestment || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            subtitle: "Unrealized P/L",
            subValue: `${(data?.totalUnrealizedProfit || 0) >= 0 ? '+' : '-'}$${Math.abs(data?.totalUnrealizedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            subValueColor: (data?.totalUnrealizedProfit || 0) >= 0 ? 'success.main' : 'error.main'
        },
        {
            title: t('dashboard.buying_power'),
            value: `$${(data?.cashBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            sx: { color: 'primary.main' },
            subtitle: "Realized Profit",
            subValue: `${(data?.realizedProfit || 0) >= 0 ? '+' : '-'}$${Math.abs(data?.realizedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            subValueColor: (data?.realizedProfit || 0) >= 0 ? 'success.main' : 'error.main',
            actions: isEditMode && (
                <>
                    <IconButton
                        size="medium"
                        onClick={() => handleOpenCashDialog('deposit')}
                        sx={{ bgcolor: 'action.hover', color: 'primary.main', width: 40, height: 40 }}
                    >
                        <AddCircle sx={{ fontSize: 24 }} />
                    </IconButton>
                    <IconButton
                        size="medium"
                        onClick={() => handleOpenCashDialog('withdraw')}
                        sx={{ bgcolor: 'action.hover', color: 'error.main', width: 40, height: 40 }}
                    >
                        <RemoveCircle sx={{ fontSize: 24 }} />
                    </IconButton>
                </>
            )
        }
    ];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container
            maxWidth="xl"
            disableGutters
            sx={{ mt: { xs: 1, md: 2 } }}
        >
            <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, px: { xs: 2, md: 0 } }}>
                <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" color="text.primary">
                        {t('dashboard.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('dashboard.welcome')}
                    </Typography>
                </Box>
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

            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4, p: 2 }}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <SummaryCard
                        primary
                        isMobile={isMobile}
                        title="TOTAL NET WORTH"
                        value={`${data?.totalValue >= 0 ? '' : '-'}$${Math.abs(data?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        subtitle={t('dashboard.global_assets')}
                        onClick={() => setHistoryDialogOpen(true)}
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={isMobile ? 2 : 3} sx={{ height: '100%' }}>
                        {summaryCardsData.map((card, idx) => (
                            <Grid key={idx} size={{ xs: 12, sm: 6, md: 6 }}>
                                <SummaryCard {...card} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            {/* Asset List Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, px: { xs: 2, md: 0 } }}>
                <Typography variant="h6" fontWeight="700">
                    {t('dashboard.breakdown')}
                </Typography>
            </Box>

            <Grid container spacing={isMobile ? 2 : 3} p={2}>
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
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={asset.symbol}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>
                                        {asset.symbol}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isEditMode && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="medium"
                                                    onClick={() => handleEdit(asset)}
                                                    sx={{ bgcolor: 'action.hover', color: 'primary.main', width: 40, height: 40 }}
                                                >
                                                    <Edit sx={{ fontSize: 20 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="medium"
                                                    onClick={() => handleDeleteRequest(asset.symbol)}
                                                    sx={{ bgcolor: 'error.light', color: 'error.main', width: 40, height: 40 }}
                                                >
                                                    <Delete sx={{ fontSize: 20 }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                        {!isEditMode && (
                                            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', width: 38, height: 38, justifyContent: 'center', alignItems: 'center' }}>
                                                {getIcon(asset.subtype)}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                                        {asset.assetType} • {asset.exchange || 'NASDAQ'}
                                    </Typography>
                                    <Typography variant="caption" color="primary.main" fontWeight="800" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, py: 0.2, borderRadius: 1 }}>
                                        {asset.subtype || 'General'}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2, opacity: 0.6 }} />

                                <Grid container spacing={1}>
                                    <Grid size={4}>
                                        <Typography variant="caption" color="text.secondary">{t('dashboard.holdings')}</Typography>
                                        <Typography variant="body2" fontWeight="700">{asset.holdings}</Typography>
                                    </Grid>
                                    <Grid size={4} sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">{t('dashboard.average_cost')}</Typography>
                                        <Typography variant="body2" fontWeight="700">
                                            ${(asset.averageCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Grid>
                                    <Grid size={4} sx={{ textAlign: 'right' }}>
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

            {/* ── Confirm Delete Asset Dialog ────────────────────────────────── */}
            <ConfirmDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('common.delete')}
                message={t('common.confirm_delete')}
                severity="error"
            />

            <CashFlowDialog
                open={cashDialogOpen}
                onClose={() => setCashDialogOpen(false)}
                onSubmit={handleCashSubmit}
                type={cashDialogType}
                currentBalance={data?.cashBalance || 0}
            />

            <TransactionHistoryDialog
                open={historyDialogOpen}
                onClose={() => setHistoryDialogOpen(false)}
                userId={userId}
            />

            {/* Modal สำหรับแก้ไขธุรกรรม  */}
            {selectedAsset && (
                <TransactionModal
                    open={modalOpen}
                    onClose={() => { setModalOpen(false); setSelectedAsset(null); }}
                    symbol={selectedAsset.symbol}
                    initialPrice={selectedAsset.averageCost}
                    initialValues={selectedAsset}
                    isEdit={true}
                    allowedTypes={['Buy', 'Sell']}
                    maxHoldings={selectedAsset.holdings}
                    onSuccess={() => {
                        fetchDashboard();
                        enqueueSnackbar(t('common.success'), { variant: 'success' });
                    }}
                />
            )}
        </Container>
    );
};

export default Dashboard;