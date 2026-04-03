import { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, TextField, 
    Button, Box, useTheme, useMediaQuery 
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';

import { useTranslation } from 'react-i18next';

const Watchlist = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [list, setList] = useState([]);
    const [symbol, setSymbol] = useState('');
    const userId = useSelector((state) => state.auth.user);

    // 1. ดึงรายการ Watchlist จาก Backend 
    const fetchWatchlist = async () => {
        try {
            const res = await axiosClient.get(`/Watchlist/${userId}`);
            setList(res.data);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => {
        if (userId) fetchWatchlist();
    }, [userId]);

    // 2. ฟังก์ชันเพิ่มหุ้น 
    const handleAdd = async () => {
        if (!symbol) return;
        try {
            await axiosClient.post(`/Watchlist/add?userId=${userId}&symbol=${symbol}`);
            setSymbol('');
            fetchWatchlist(); // โหลดใหม่หลังเพิ่มสำเร็จ 
        } catch (err) {
            alert(err.response?.data || t('common.failed'));
        }
    };

    // 3. ฟังก์ชันลบหุ้น  
    const handleRemove = async (sym) => {
        try {
            await axiosClient.delete(`/Watchlist/remove?userId=${userId}&symbol=${sym}`);
            fetchWatchlist(); // โหลดใหม่หลังลบสำเร็จ 
        } catch (err) {
            console.error("Remove error", err);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 2 } }}>
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800">
                    {t('common.watchlist')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('watchlist.subtitle')}
                </Typography>
            </Box>

            {/* ส่วนค้นหาและเพิ่ม  */}
            <Paper elevation={0} sx={{ 
                p: { xs: 2, md: 3 }, 
                mb: 4, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2, 
                borderRadius: { xs: 3, md: 4 } 
            }}>
                <TextField
                    label={t('common.symbol')}
                    size="small"
                    variant="outlined"
                    fullWidth
                    placeholder={t('watchlist.placeholder')}
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleAdd}
                    fullWidth={isMobile}
                    sx={{ px: 4, borderRadius: 2, height: { xs: 44, sm: 'auto' } }}
                >
                    {t('common.add')}
                </Button>
            </Paper>

            {/* ตารางแสดงรายการ  */}
            <TableContainer component={Paper} elevation={0} sx={{ 
                borderRadius: { xs: 3, md: 4 }, 
                overflow: 'hidden',
                overflowX: 'auto' // Enable horizontal scrolling 
            }}>
                <Table size={isMobile ? "small" : "medium"}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>{t('common.symbol')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.price')}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>{t('common.action')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.map((item) => (
                            <TableRow key={item.symbol} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{item.symbol}</TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight="700" variant="body2">
                                        {item.currentPrice >= 0 ? '' : '-'}${Math.abs(item.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleRemove(item.symbol)}
                                        sx={{ 
                                            bgcolor: 'error.light', 
                                            '&:hover': { bgcolor: '#ffcdd2' },
                                            width: 44, height: 44 // Touch friendly
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary" variant="body2">
                                        {t('watchlist.empty')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};


export default Watchlist;