import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, InputLabel,
    FormControl, Grid, Typography, InputAdornment, Box, Alert, AlertTitle,
    useMediaQuery, useTheme,
    Chip
} from '@mui/material';
import { ShoppingCart, AccountBalanceWallet } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from './ConfirmDialog';

const TransactionModal = ({
    open, onClose, symbol, initialPrice, initialValues, onSuccess,
    isEdit = false,
    allowedTypes = ['Buy', 'Sell'],
    maxHoldings = Infinity,
    exchange
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    // xs is < 600px by default
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const userId = useSelector((state) => state.auth.user);
    const { activePortfolioId } = useSelector((state) => state.portfolio);
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cashBalance, setCashBalance] = useState(0);

    const [formData, setFormData] = useState({
        type: allowedTypes.includes('Buy') ? 'Buy' : allowedTypes[0],
        quantity: '',
        pricePerUnit: '',
        currency: 'USD',
        assetType: 'Stock',
        subtype: '',
        exchange: exchange || 'NASDAQ'
    });

    const estimatedTotal = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.pricePerUnit) || 0);
    const estimatedProfit = formData.type === 'Sell'
        ? ((parseFloat(formData.pricePerUnit) || 0) - (initialValues?.averageCost || 0)) * (parseFloat(formData.quantity) || 0)
        : 0;
    const isInsufficientCash = formData.type === 'Buy' && estimatedTotal > cashBalance;

    const fetchCashBalance = async () => {
        if (!activePortfolioId) return;
        try {
            const res = await axiosClient.get(UrlPP.Cash.GetBalance(activePortfolioId));
            const balance = typeof res.data === 'object'
                ? (res.data.balance ?? res.data.cashBalance ?? res.data.cash ?? 0)
                : (res.data ?? 0);
            setCashBalance(Number(balance));
        } catch (err) {
            console.error("Failed to fetch balance", err);
        }
    };

    useEffect(() => {
        if (open) {
            fetchCashBalance();
            const autoType = (symbol === 'BTC' || symbol === 'ETH') ? 'Crypto' : 'Stock';
            setFormData({
                type: initialValues?.type || (allowedTypes.includes('Buy') ? 'Buy' : allowedTypes[0]),
                quantity: initialValues?.holdings || '',
                pricePerUnit: initialPrice || '',
                assetType: initialValues?.assetType || autoType,
                subtype: initialValues?.subtype || '',
                currency: initialValues?.currency || 'USD',
                exchange: initialValues?.exchange || exchange || 'NASDAQ'
            });
        }
    }, [open, symbol, initialPrice, initialValues, allowedTypes, exchange, activePortfolioId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.quantity || !formData.pricePerUnit) {
            alert(t('common.please_fill_all'));
            return;
        }
        if (isInsufficientCash) return;
        if (formData.type === 'Sell' && parseFloat(formData.quantity) > maxHoldings) {
            alert(t('transaction.insufficient_holdings') || `Insufficient holdings! You only have ${maxHoldings} units.`);
            return;
        }
        setConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                symbol: symbol,
                ...formData,
                quantity: parseFloat(formData.quantity),
                pricePerUnit: parseFloat(formData.pricePerUnit)
            };
            if (isEdit) {
                await axiosClient.put(UrlPP.Transaction.Update(activePortfolioId, symbol), payload);
            } else {
                await axiosClient.post(UrlPP.Transaction.Add + `?portfolioId=${activePortfolioId}`, payload);
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            alert(t('common.error') + ': ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCart color="primary" />
                        {formData.type === 'Buy' ? t('transaction.buy_title') : t('transaction.sell_title')}
                    </Box>
                    <Chip
                        label={symbol}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 900, px: 1, borderRadius: 1.5 }}
                    />
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                    <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                            {/* Row 1: Type & Quantity (6/6) */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: 2
                            }}>
                                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                                    <InputLabel id="transaction-type-label">{t('transaction.type')}</InputLabel>
                                    <Select
                                        labelId="transaction-type-label"
                                        name="type"
                                        value={formData.type}
                                        label={t('transaction.type')}
                                        onChange={handleChange}
                                        disabled={allowedTypes.length === 1}
                                        sx={{
                                            color: formData.type === 'Buy' ? 'success.main' : 'error.main',
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                            '& .MuiSelect-select': {
                                                color: formData.type === 'Buy' ? 'success.main' : 'error.main',
                                            }
                                        }}
                                    >
                                        {allowedTypes.map(type => (
                                            <MenuItem key={type} value={type}>
                                                {type === 'Buy' ? t('transaction.buy') : t('transaction.sell')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={t('transaction.quantity')}
                                    name="quantity"
                                    type="number"
                                    inputProps={{ step: "1", min: "0" }}
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    sx={{ flex: 1, borderRadius: 2 }}
                                />
                            </Box>

                            {/* Row 2: Price, Asset Type, Subtype (4/4/4) */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: 2
                            }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={t('transaction.price')}
                                    name="pricePerUnit"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    value={formData.pricePerUnit}
                                    onChange={handleChange}
                                    required
                                    sx={{ flex: 4 }}
                                />
                                <FormControl fullWidth size="small" sx={{ flex: 4 }}>
                                    <InputLabel id="asset-type-label">{t('transaction.asset_type')}</InputLabel>
                                    <Select
                                        labelId="asset-type-label"
                                        name="assetType"
                                        value={formData.assetType}
                                        label={t('transaction.asset_type')}
                                        onChange={handleChange}
                                        disabled={true}
                                    >
                                        <MenuItem value="Stock">Stock</MenuItem>
                                        <MenuItem value="Crypto">Crypto</MenuItem>
                                        <MenuItem value="ETF">ETF</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={t('transaction.subtype')}
                                    name="subtype"
                                    placeholder="Tech, Bank..."
                                    value={formData.subtype}
                                    onChange={handleChange}
                                    sx={{ flex: 4 }}
                                />
                            </Box>

                            {/* Wallet & Total Info Section (6/6) */}
                            <Box sx={{
                                p: 2.5,
                                bgcolor: 'action.selected',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                mt: 1
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? 2 : 0,
                                    justifyContent: 'space-between'
                                }}>
                                    {/* Buying Power / Profit Info */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMobile ? 'center' : 'flex-start',
                                        flex: 1
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
                                            <AccountBalanceWallet sx={{ fontSize: 16 }} />
                                            <Typography variant="caption" fontWeight="800" sx={{ letterSpacing: 1 }}>
                                                {formData.type === 'Buy' ? t('transaction.buying_power').toUpperCase() : (t('transaction.est_profit') || 'EST. PROFIT').toUpperCase()}
                                            </Typography>
                                        </Box>
                                        <Typography variant="h5" fontWeight="900" color={formData.type === 'Buy' ? (isInsufficientCash ? 'error.main' : 'success.main') : (estimatedProfit >= 0 ? 'success.main' : 'error.main')}>
                                            {formData.type === 'Buy'
                                                ? `$${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                : `${estimatedProfit >= 0 ? '+' : '-'}$${Math.abs(estimatedProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                            }
                                        </Typography>
                                    </Box>

                                    {/* Estimated Proceeds / Total */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMobile ? 'center' : 'flex-end',
                                        textAlign: isMobile ? 'center' : 'right',
                                        flex: 1
                                    }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ mb: 0.5, letterSpacing: 1 }}>
                                            {formData.type === 'Buy' ? t('transaction.estimated_total').toUpperCase() : (t('transaction.est_proceeds') || 'EST. PROCEEDS').toUpperCase()}
                                        </Typography>
                                        <Typography variant="h4" fontWeight="1000" color="primary">
                                            ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Error Alert */}
                            {isInsufficientCash && (
                                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                                    <AlertTitle sx={{ fontWeight: 800 }}>{t('transaction.insufficient_cash')}</AlertTitle>
                                    <Typography variant="caption" fontWeight="600">
                                        {t('transaction.insufficient_cash_instruction')}
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>{t('common.cancel')}</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color={formData.type === 'Buy' ? "success" : "error"}
                            disabled={loading || isInsufficientCash}
                            sx={{ fontWeight: 'bold', px: 3 }}
                        >
                            {loading ? t('common.loading') : (formData.type === 'Buy' ? t('transaction.buy') : t('transaction.sell'))}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
                title={t('confirm.transaction_title')}
                message={t('confirm.transaction_message', { type: formData.type === 'Buy' ? t('transaction.buy') : t('transaction.sell'), symbol: symbol })}
                severity={formData.type === 'Sell' ? 'error' : 'primary'}
                confirmText={formData.type === 'Buy' ? t('transaction.buy') : t('transaction.sell')}
            />
        </>
    );
};

export default TransactionModal;