import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * A reusable Confirmation Dialog to replace window.confirm()
 * 
 * @param {boolean} open - Whether the dialog is visible
 * @param {function} onClose - Function to call on cancel/dismiss
 * @param {function} onConfirm - Function to call on confirmation
 * @param {string} title - Dialog title (optional)
 * @param {string} message - Dialog message (optional)
 * @param {string} confirmText - Text for confirm button (optional)
 * @param {string} cancelText - Text for cancel button (optional)
 * @param {string} severity - 'primary' | 'error' | 'warning' (optional)
 */
const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    severity = 'primary'
}) => {
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    minWidth: { xs: '90%', sm: 400 }
                }
            }}
        >
            <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 800 }}>
                {title || t('common.confirm')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    <Typography variant="body1" color="text.primary">
                        {message}
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    color="inherit" 
                    variant="text"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    {cancelText || t('common.cancel')}
                </Button>
                <Button 
                    onClick={handleConfirm} 
                    color={severity === 'error' ? 'error' : 'primary'} 
                    variant="contained" 
                    autoFocus
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
                >
                    {confirmText || t('common.confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
