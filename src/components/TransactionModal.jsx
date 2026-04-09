import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, InputLabel,
    FormControl, Grid, Typography, InputAdornment, Box
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { useTranslation } from 'react-i18next';

const TransactionModal = ({
    open, onClose, symbol, initialPrice, initialValues, onSuccess,
    isEdit = false,
    allowedTypes = ['Buy', 'Sell'],
    maxHoldings = Infinity,
    exchange
}) => {
    const { t } = useTranslation();
    const userId = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: allowedTypes.includes('Buy') ? 'Buy' : allowedTypes[0],
        quantity: '',
        pricePerUnit: '',
        currency: 'USD',
        assetType: 'Stock',
        subtype: '',
        exchange: exchange || 'NASDAQ'
    });

    useEffect(() => {
        if (open) {
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
    }, [open, symbol, initialPrice, initialValues, allowedTypes, exchange]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🛡️ Validation: Ensure we have essential data
        if (!formData.quantity || !formData.pricePerUnit) {
            alert(t('common.please_fill_all'));
            return;
        }

        // 🛡️ Safety Validation: Prevent selling more than holdings
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
                await axiosClient.put(UrlPP.Transaction.Update(userId, symbol), payload);
            } else {
                await axiosClient.post(`${UrlPP.Transaction.Add}?userId=${userId}`, payload);
            }

            onSuccess();
            onClose();
        } catch (err) {
            alert(t('common.error') + ': ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
        return (
            <>
                <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCart color="primary" />
                        {t('transaction.title', { symbol: symbol })}
                    </DialogTitle>

                    <form onSubmit={handleSubmit}>
                        <DialogContent dividers sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Transaction Type */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="transaction-type-label">{t('transaction.type')}</InputLabel>
                                        <Select
                                            labelId="transaction-type-label"
                                            name="type"
                                            value={formData.type}
                                            label={t('transaction.type')}
                                            onChange={handleChange}
                                            disabled={allowedTypes.length === 1}
                                            sx={{
                                                bgcolor: formData.type === 'Buy' ? 'success.light' : 'error.light',
                                                color: formData.type === 'Buy' ? 'success.dark' : 'error.dark',
                                                fontWeight: 'bold',
                                                borderRadius: 2
                                            }}
                                        >
                                            {allowedTypes.map(type => (
                                                <MenuItem key={type} value={type}>
                                                    {type === 'Buy' ? t('transaction.buy') : t('transaction.sell')}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Quantity */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={t('transaction.quantity')}
                                        name="quantity"
                                        type="number"
                                        inputProps={{ step: "0.0001", min: "0" }}
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        sx={{ borderRadius: 2 }}
                                    />
                                </Grid>

                                {/* Price per Unit */}
                                <Grid item xs={12} sm={6}>
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
                                    />
                                </Grid>

                                {/* Asset Type (Disabled) */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
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
                                </Grid>

                                {/* Subtype */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={t('transaction.subtype')}
                                        name="subtype"
                                        placeholder="e.g. Tech, Bank"
                                        value={formData.subtype}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                {/* Total Calculation Preview */}
                                <Grid item xs={12}>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'action.selected',
                                        borderRadius: 3,
                                        textAlign: 'center',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                                            {t('transaction.estimated_total')}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="900" color="primary">
                                            ${((formData.quantity || 0) * (formData.pricePerUnit || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={onClose} color="inherit" disabled={loading}>
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color={formData.type === 'Buy' ? "success" : "error"}
                                disabled={loading}
                                sx={{ fontWeight: 'bold' }}
                            >
                                {loading ? t('common.loading') : (isEdit ? t('common.update') : t('common.confirm'))}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <ConfirmDialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={handleConfirmSubmit}
                    title={t('confirm.transaction_title')}
                    message={t('confirm.transaction_message', {
                        type: formData.type === 'Buy' ? t('transaction.buy') : t('transaction.sell'),
                        symbol: symbol
                    })}
                    severity={formData.type === 'Sell' ? 'error' : 'primary'}
                    confirmText={formData.type === 'Buy' ? t('transaction.buy') : t('transaction.sell')}
                />
            </>
        );
    };
}
export default TransactionModal;