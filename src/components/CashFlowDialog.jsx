import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Box, Typography, TextField, Button 
} from '@mui/material';
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
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount('');
        }
    }, [open]);

    const handleSubmit = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            return; 
        }
        setConfirmOpen(true);
    };

    const handleConfirmSubmit = () => {
        onSubmit(parseFloat(amount));
        setConfirmOpen(false);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: { xs: '90%', sm: 400 } } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {type === 'deposit' ? t('dashboard.deposit_cash') : t('dashboard.withdraw_cash')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label={t('common.amount')}
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                            variant="outlined"
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>$</Typography>
                            }}
                        />
                        {type === 'withdraw' && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {t('dashboard.buying_power')}: ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color={type === 'withdraw' ? 'error' : 'primary'}
                        sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
                    >
                        {type === 'deposit' ? t('common.confirm') : t('common.withdraw')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog 
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
                title={t('confirm.cash_title')}
                message={t('confirm.cash_message', {
                    type: type === 'deposit' ? t('dashboard.deposit_cash') : t('dashboard.withdraw_cash'),
                    amount: amount
                })}
                severity={type === 'withdraw' ? 'error' : 'primary'}
                confirmText={t('common.confirm')}
            />
        </>
    );
};

export default CashFlowDialog;
