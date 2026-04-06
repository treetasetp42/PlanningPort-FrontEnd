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

const TransactionModal = ({ open, onClose, symbol, initialPrice, initialValues, onSuccess, isEdit = false }) => {
    const { t } = useTranslation();
    const userId = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'Buy',
        quantity: '',
        pricePerUnit: '',
        currency: 'USD',
        assetType: 'Stock',
        subtype: ''
    });

    useEffect(() => {
        if (open) {
            const autoType = (symbol === 'BTC' || symbol === 'ETH') ? 'Crypto' : 'Stock';

            setFormData({
                type: initialValues?.type || 'Buy',
                quantity: initialValues?.holdings || '',
                pricePerUnit: initialPrice || '',
                assetType: initialValues?.assetType || autoType,
                subtype: initialValues?.subtype || '',
                currency: initialValues?.currency || 'USD'
            });
        }
    }, [open, symbol, initialPrice, initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.quantity || !formData.pricePerUnit) {
            alert(t('common.please_fill_all'));
            return;
        }

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
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart color="primary" />
                {t('transaction.title', { symbol: symbol })}
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('transaction.type')}</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    label={t('transaction.type')}
                                    onChange={handleChange}
                                    sx={{
                                        bgcolor: formData.type === 'Buy' ? 'success.light' : 'error.light',
                                        color: formData.type === 'Buy' ? 'success.dark' : 'error.dark',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <MenuItem value="Buy">{t('transaction.buy')}</MenuItem>
                                    <MenuItem value="Sell">{t('transaction.sell')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Quantity & Price */}
                        <Grid item xs={6}>
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
                            />
                        </Grid>
                        <Grid item xs={6}>
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

                        {/* Total Calculation Preview */}
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {t('transaction.estimated_total')}
                                </Typography>
                                <Typography variant="h6" fontWeight="800" color="primary">
                                    ${((formData.quantity || 0) * (formData.pricePerUnit || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Asset Type & Subtype */}
                        <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('transaction.asset_type')}</InputLabel>
                                <Select
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
                        <Grid item xs={6}>
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
                        {loading ? t('common.loading') : t('common.confirm')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TransactionModal;