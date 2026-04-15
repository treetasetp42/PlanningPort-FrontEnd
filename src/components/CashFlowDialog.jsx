import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Box, Typography, TextField, Button, ToggleButtonGroup, ToggleButton,
    Divider, InputAdornment
} from '@mui/material';
import { AddCircle, RemoveCircle, AccountBalanceWallet } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from './ConfirmDialog';

const CashFlowDialog = ({ 
    open, 
    onClose, 
    onSubmit, 
    type = 'deposit', 
    currentBalance = 0 
}) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [activeType, setActiveType] = useState(type);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount('');
            setActiveType(type);
        }
    }, [open, type]);

    const handleTypeChange = (event, newType) => {
        if (newType !== null) {
            setActiveType(newType);
        }
    };

    const handleSubmit = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            return; 
        }
        setConfirmOpen(true);
    };

    const handleConfirmSubmit = () => {
        onSubmit(parseFloat(amount), activeType);
        setConfirmOpen(false);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                PaperProps={{ 
                    sx: { 
                        borderRadius: 4, 
                        p: 0, 
                        minWidth: { xs: '95%', sm: 450 },
                        overflow: 'hidden'
                    } 
                }}
            >
                <DialogTitle sx={{ 
                    fontWeight: 900, 
                    fontSize: '1.25rem',
                    bgcolor: 'action.hover',
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceWallet color="primary" />
                        {t('common.manage') || 'Manage Cash'}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', opacity: 0.7 }}>
                        WALLET
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {/* Current Balance Display */}
                    <Box sx={{ 
                        p: 2.5, 
                        mb: 3, 
                        mt: 1,
                        borderRadius: 3, 
                        bgcolor: 'primary.main', 
                        color: 'primary.contrastText',
                        boxShadow: '0 8px 20px -8px rgba(25, 118, 210, 0.5)'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.9, letterSpacing: 1 }}>
                            {t('dashboard.buying_power').toUpperCase()}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 1000 }}>
                            ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
                            {t('common.type').toUpperCase()}
                        </Typography>
                        <ToggleButtonGroup
                            value={activeType}
                            exclusive
                            onChange={handleTypeChange}
                            fullWidth
                            sx={{ 
                                '& .MuiToggleButton-root': { 
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&.Mui-selected': {
                                        bgcolor: activeType === 'deposit' ? 'success.main' : 'error.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: activeType === 'deposit' ? 'success.dark' : 'error.dark',
                                        }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="deposit">
                                <AddCircle sx={{ mr: 1, fontSize: 20 }} />
                                {t('common.deposit') || 'Deposit'}
                            </ToggleButton>
                            <ToggleButton value="withdraw">
                                <RemoveCircle sx={{ mr: 1, fontSize: 20 }} />
                                {t('common.withdraw') || 'Withdraw'}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box>
                        <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
                            {t('common.amount').toUpperCase()}
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="0.00"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>$</Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    borderRadius: 3, 
                                    fontWeight: 800, 
                                    fontSize: '1.2rem',
                                    '& fieldset': { borderWidth: '2px !important' } 
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 4, pt: 0 }}>
                    <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700, borderRadius: 2 }}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        fullWidth
                        color={activeType === 'withdraw' ? 'error' : 'success'}
                        sx={{ 
                            fontWeight: 900, 
                            borderRadius: 3, 
                            py: 1.5,
                            fontSize: '1rem',
                            boxShadow: activeType === 'withdraw' 
                                ? '0 10px 20px -10px rgba(211, 47, 47, 0.5)' 
                                : '0 10px 20px -10px rgba(56, 142, 60, 0.5)'
                        }}
                    >
                        {activeType === 'deposit' ? t('common.deposit') : t('common.withdraw')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog 
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
                title={t('confirm.cash_title')}
                message={t('confirm.cash_message', {
                    type: activeType === 'deposit' ? t('common.deposit') : t('common.withdraw'),
                    amount: parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })
                })}
                severity={activeType === 'withdraw' ? 'error' : 'primary'}
                confirmText={t('common.confirm')}
            />
        </>
    );
};

export default CashFlowDialog;
