import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton,
    List, ListItem, ListItemText, ListItemSecondaryAction,
    Divider, Alert, useTheme, useMediaQuery
} from '@mui/material';
import { Add, Edit, Delete, ColorLens } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import CircleIcon from '@mui/icons-material/Circle';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { fetchPortfolios, setActivePortfolio } from '../features/portfolioSlice';
import ConfirmDialog from './ConfirmDialog';

const COLORS = ['#6C5DD3', '#3F8CFF', '#FF754C', '#FF3A29', '#34C759', '#F2C94C', '#9C27B0', '#E91E63'];

const PortfolioManagerModal = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();

    const userId = useSelector(state => state.auth.user);
    const { list, activePortfolioId } = useSelector(state => state.portfolio);

    const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'
    const [editingPort, setEditingPort] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [portToDelete, setPortToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        colorCode: COLORS[0]
    });
    const [loading, setLoading] = useState(false);

    const handleOpenCreate = () => {
        if (list.length >= 10) {
            enqueueSnackbar(t('portfolio.limit_reached'), { variant: 'warning' });
            return;
        }
        setFormData({ name: '', description: '', colorCode: COLORS[0] });
        setMode('create');
    };

    const handleOpenEdit = (port) => {
        setEditingPort(port);
        setFormData({
            name: port.name,
            description: port.description || '',
            colorCode: port.colorCode || COLORS[0]
        });
        setMode('edit');
    };

    const handleDeleteRequest = (port) => {
        if (list.length <= 1) {
            enqueueSnackbar("You cannot delete your only portfolio.", { variant: 'error' });
            return;
        }
        setPortToDelete(port);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axiosClient.delete(UrlPP.Portfolio.Delete(portToDelete.id));
            enqueueSnackbar(t('portfolio.success_delete'), { variant: 'success' });
            
            // If they deleted the active portfolio, Redux will auto-pick a new one on fetch
            if (activePortfolioId === portToDelete.id) {
                const navPort = list.find(p => p.id !== portToDelete.id);
                if (navPort) dispatch(setActivePortfolio(navPort.id));
            }
            
            await dispatch(fetchPortfolios(userId));
        } catch (err) {
            enqueueSnackbar(err.response?.data || 'Failed to delete', { variant: 'error' });
        } finally {
            setConfirmDeleteOpen(false);
            setPortToDelete(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'create') {
                const res = await axiosClient.post(UrlPP.Portfolio.Add(userId), formData);
                enqueueSnackbar(t('portfolio.success_create'), { variant: 'success' });
                await dispatch(fetchPortfolios(userId));
                // Automatically switch to the newly created portfolio
                dispatch(setActivePortfolio(res.data.id));
            } else {
                await axiosClient.put(UrlPP.Portfolio.Update(editingPort.id), formData);
                enqueueSnackbar(t('portfolio.success_update'), { variant: 'success' });
                await dispatch(fetchPortfolios(userId));
            }
            setMode('list');
        } catch (err) {
            enqueueSnackbar(err.response?.data || 'An error occurred', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={() => { setMode('list'); onClose(); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        {mode === 'list' && t('portfolio.manage')}
                        {mode === 'create' && t('portfolio.create')}
                        {mode === 'edit' && t('portfolio.edit')}
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {list.length}/10
                    </Typography>
                </DialogTitle>
                
                <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
                    {mode === 'list' && (
                        <Box>
                            {list.length >= 10 && (
                                <Alert severity="warning" sx={{ mb: 2 }}>{t('portfolio.limit_reached')}</Alert>
                            )}
                            <List disablePadding>
                                {list.map((port, index) => (
                                    <Box key={port.id}>
                                        <ListItem sx={{ py: 1.5 }}>
                                            <CircleIcon sx={{ color: port.colorCode || theme.palette.primary.main, mr: 2, fontSize: 16 }} />
                                            <ListItemText 
                                                primary={port.name} 
                                                secondary={port.description}
                                                primaryTypographyProps={{ fontWeight: 700 }}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" onClick={() => handleOpenEdit(port)} sx={{ mr: 1, color: 'info.main' }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton 
                                                    edge="end" 
                                                    onClick={() => handleDeleteRequest(port)} 
                                                    sx={{ color: 'error.main' }}
                                                    disabled={list.length <= 1}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < list.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        </Box>
                    )}

                    {(mode === 'create' || mode === 'edit') && (
                        <form id="portfolio-form" onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    label={t('portfolio.name')}
                                    fullWidth
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <TextField
                                    label={t('portfolio.description')}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight="700" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ColorLens fontSize="small"/> {t('portfolio.color')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                        {COLORS.map(color => (
                                            <Box 
                                                key={color}
                                                onClick={() => setFormData(prev => ({ ...prev, colorCode: color }))}
                                                sx={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    bgcolor: color,
                                                    cursor: 'pointer',
                                                    border: formData.colorCode === color ? '3px solid' : 'none',
                                                    borderColor: theme.palette.text.primary,
                                                    boxShadow: formData.colorCode === color ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </form>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    {mode === 'list' ? (
                        <>
                            <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>{t('common.close')}</Button>
                            <Button 
                                variant="contained" 
                                startIcon={<Add />} 
                                onClick={handleOpenCreate}
                                disabled={list.length >= 10}
                                sx={{ fontWeight: 800 }}
                            >
                                {t('portfolio.create')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setMode('list')} color="inherit" sx={{ fontWeight: 700 }}>{t('common.cancel')}</Button>
                            <Button 
                                type="submit" 
                                form="portfolio-form"
                                variant="contained" 
                                disabled={loading || !formData.name}
                                sx={{ fontWeight: 800 }}
                            >
                                {loading ? t('common.loading') : (mode === 'create' ? t('common.add') : t('common.update'))}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <ConfirmDialog 
                open={confirmDeleteOpen} 
                onClose={() => setConfirmDeleteOpen(false)} 
                onConfirm={handleConfirmDelete} 
                title={t('portfolio.delete')} 
                message={t('portfolio.confirm_delete')}
                severity="error"
            />
        </>
    );
};

export default PortfolioManagerModal;
