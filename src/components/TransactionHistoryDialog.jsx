import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, CircularProgress, Chip, useTheme, useMediaQuery
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import { UrlPP } from '../api/UrlPP';
import { useTranslation } from 'react-i18next';

const TransactionHistoryDialog = ({ open, onClose, userId }) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (open && userId) {
            fetchHistory();
        }
    }, [open, userId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(UrlPP.Transaction.History(userId));
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        const typeLower = (type || '').toLowerCase();
        if (typeLower === 'buy' || typeLower === 'deposit') return 'success';
        if (typeLower === 'sell' || typeLower === 'withdraw') return 'error';
        return 'default';
    };

    const getLocalizedType = (type) => {
        const typeLower = (type || '').toLowerCase();
        if (typeLower === 'buy') return t('transaction.buy') || 'Buy';
        if (typeLower === 'sell') return t('transaction.sell') || 'Sell';
        if (typeLower === 'deposit') return t('common.deposit') || 'Deposit';
        if (typeLower === 'withdraw') return t('common.withdraw') || 'Withdraw';
        return type;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}
            PaperProps={{
                sx: { 
                    borderRadius: isMobile ? 0 : 3,
                    backgroundImage: 'none',
                    bgcolor: 'background.paper'
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.5rem', py: 2 }}>
                {t('dashboard.transaction_history') || 'Transaction History'}
            </DialogTitle>
            <DialogContent dividers sx={{ p: isMobile ? 0 : 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : history.length === 0 ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}>
                        <Typography color="text.secondary" variant="body1">
                            {t('dashboard.no_transactions') || 'No transactions found'}
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: '70vh' }}>
                        <Table stickyHeader size={isMobile ? "small" : "medium"}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>{t('common.date') || 'Date'}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>{t('common.symbol') || 'Symbol'}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>{t('common.type') || 'Type'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>{t('dashboard.holdings') || 'Qty'}</TableCell>
                                    {!isMobile && <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>{t('common.price') || 'Price'}</TableCell>}
                                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>{t('common.total') || 'Total'}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((row) => {
                                    const isCash = row.symbol === 'CASH' || (row.assetType || '').toLowerCase() === 'cash';
                                    const typeColor = getTypeColor(row.type);
                                    
                                    return (
                                        <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {new Date(row.transactionDate).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {new Date(row.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    fontWeight="700" 
                                                    color={isCash ? 'text.secondary' : 'primary.main'}
                                                    sx={{ 
                                                        fontSize: isCash ? '0.85rem' : '1rem',
                                                        letterSpacing: -0.2
                                                    }}
                                                >
                                                    {row.symbol}
                                                </Typography>
                                                {isCash && (
                                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: -0.5 }}>
                                                        Wallet
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getLocalizedType(row.type)}
                                                    size="small"
                                                    color={typeColor}
                                                    sx={{
                                                        fontWeight: 800,
                                                        borderRadius: 1,
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        px: 0.5
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="600">
                                                    {row.quantity !== null ? row.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '-'}
                                                </Typography>
                                            </TableCell>
                                            {!isMobile && (
                                                <TableCell align="right">
                                                    <Typography variant="body2" color="text.secondary">
                                                        {row.pricePerUnit ? `$${row.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            <TableCell align="right">
                                                <Typography 
                                                    variant="body2" 
                                                    fontWeight="800" 
                                                    color={typeColor === 'default' ? 'text.primary' : `${typeColor}.main`}
                                                >
                                                    ${((row.quantity || 0) * (row.pricePerUnit || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, px: 3 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    disableElevation
                    fullWidth={isMobile}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 4, py: 1 }}
                >
                    {t('common.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransactionHistoryDialog;
