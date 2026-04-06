import { useEffect, useState } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, TextField,
    Button, Box, useTheme, useMediaQuery, Chip
} from '@mui/material';
import TransactionModal from '../components/TransactionModal';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import TradingViewChart from '../components/TradingViewChart';
import { Delete as DeleteIcon, Add as AddIcon, ShoppingCart as CartIcon, ShowChart as ChartIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// ─── Helper: parse any "EXCHANGE:SYMBOL" or plain "SYMBOL" string ──────────
const parseSymbol = (input) => {
    const upper = input.toUpperCase().trim();
    if (upper.includes(':')) {
        const [exchange, ...rest] = upper.split(':');
        return { exchange, symbol: rest.join(':') };
    }
    // Heuristic: known crypto tickers default to BINANCE
    const cryptoTickers = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'];
    const exchange = cryptoTickers.includes(upper) ? 'BINANCE' : 'NASDAQ';
    return { exchange, symbol: upper };
};

const Market = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [list, setList] = useState([]);
    // inputText: what the user types in the text field (raw, could be "AAPL" or "NASDAQ:AAPL")
    const [inputText, setInputText] = useState('');
    // isSearchOpen: toggle for the search input
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // activeSelection: {exchange, symbol} — the single source of truth for the chart & Add button
    const [activeSelection, setActiveSelection] = useState({ exchange: 'NASDAQ', symbol: 'AAPL' });

    const [selectedItem, setSelectedItem] = useState({ symbol: '', price: '' });
    const [modalOpen, setModalOpen] = useState(false);
    const userId = useSelector((state) => state.auth.user);

    // Derived: the full TradingView symbol string for the chart
    const chartSymbol = `${activeSelection.exchange}:${activeSelection.symbol}`;

    // ── 1. Fetch Watchlist ────────────────────────────────────────────────────
    const fetchWatchlist = async () => {
        try {
            const res = await axiosClient.get(UrlPP.Watchlist.Get(userId));
            setList(res.data);
        } catch (err) {
            console.error('Fetch error', err);
        }
    };

    useEffect(() => {
        if (userId) fetchWatchlist();
    }, [userId]);

    // ── 2. Handle Search ─────────────────────────────────────────────────────
    const handleSearch = () => {
        if (!inputText) return;
        const parsed = parseSymbol(inputText);
        setActiveSelection(parsed);
        setIsSearchOpen(false); // Close search after selection
        setInputText(`${parsed.exchange}:${parsed.symbol}`);
    };

    // ── 3. Handle clicking Chart icon on a watchlist row ─────────────────────
    const handleViewChart = (item) => {
        const exchange = item.exchange || 'NASDAQ';
        const symbol = item.symbol;
        setActiveSelection({ exchange, symbol });
        setInputText(`${exchange}:${symbol}`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll focus to chart
    };

    // ── 4. Add current active selection to watchlist ──────────────────────────
    const handleAdd = async () => {
        const { exchange, symbol } = activeSelection;
        if (!symbol) return;

        // Prevent duplicates — check both exchange and symbol
        const alreadyExists = list.some(
            item => item.symbol.toUpperCase() === symbol && item.exchange?.toUpperCase() === exchange
        );
        if (alreadyExists) {
            alert(t('watchlist.duplicate') || `${exchange}:${symbol} is already in your watchlist.`);
            return;
        }

        try {
            await axiosClient.post(UrlPP.Watchlist.Add(userId, exchange, symbol));
            // Success Feedback
            fetchWatchlist();
        } catch (err) {
            alert(err.response?.data || t('common.failed'));
        }
    };

    // ── 5. Remove from watchlist ──────────────────────────────────────────────
    const handleRemove = async (item) => {
        const exchange = item.exchange || 'NASDAQ';
        try {
            await axiosClient.delete(UrlPP.Watchlist.Remove(userId, exchange, item.symbol));
            fetchWatchlist();
        } catch (err) {
            console.error('Remove error', err);
        }
    };

    // ── 6. Open Transaction modal ─────────────────────────────────────────────
    const handleBuyClick = (item) => {
        setSelectedItem({ symbol: item.symbol, price: item.currentPrice });
        setModalOpen(true);
    };

    const handleTransactionSuccess = () => console.log('Transaction Success');

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 2 } }}>
            {/* ── Page Title ── */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="800">
                    {t('common.market')}
                </Typography>
            </Box>

            {/* ── Premium Symbol Header ── */}
            <Paper elevation={0} sx={{
                p: { xs: 1.5, md: 2 },
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                    <IconButton
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        sx={{
                            bgcolor: isSearchOpen ? 'primary.main' : 'action.hover',
                            color: isSearchOpen ? 'white' : 'inherit',
                            '&:hover': { bgcolor: isSearchOpen ? 'primary.dark' : 'action.selected' },
                            width: 44, height: 44
                        }}
                    >
                        <ChartIcon />
                    </IconButton>

                    {isSearchOpen ? (
                        <TextField
                            size="small"
                            placeholder="Enter Symbol (e.g. AAPL)..."
                            autoFocus
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value.toUpperCase())}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            onBlur={() => { if (!inputText) setIsSearchOpen(false); }}
                            sx={{ width: { xs: 160, sm: 300 } }}
                        />
                    ) : (
                        <Box sx={{ cursor: 'pointer' }} onClick={() => setIsSearchOpen(true)}>
                            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="800" sx={{ lineHeight: 1 }}>
                                {activeSelection.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">
                                {activeSelection.exchange} MARKET
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{
                        px: { xs: 2, md: 4 },
                        borderRadius: 2,
                        height: 44,
                        fontWeight: '800',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                >
                    {t('watchlist.wishlist') || 'Wishlist'}
                </Button>
            </Paper>

            {/* ── TradingView Chart ── */}
            <Paper elevation={0} sx={{
                mb: 4,
                height: { xs: 350, md: 480 },
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.05)',
            }}>
                <TradingViewChart symbol={chartSymbol} theme={theme.palette.mode} />
            </Paper>

            {/* ── Watchlist Table ── */}
            <TableContainer component={Paper} elevation={0} sx={{
                borderRadius: 2,
                overflowX: 'auto',
                boxShadow: '0px 4px 15px rgba(0,0,0,0.02)'
            }}>
                <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>{t('common.symbol')}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Exchange</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>{t('common.price')}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>{t('common.action')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.map((item) => (
                            <TableRow key={`${item.exchange}-${item.symbol}`} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{item.symbol}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.exchange || 'NASDAQ'}
                                        size="small"
                                        variant="outlined"
                                        color={item.exchange === 'BINANCE' ? 'warning' : 'primary'}
                                        sx={{ fontWeight: '700', borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Typography fontWeight="800" variant="body2" color="primary">
                                        ${(item.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="info"
                                        onClick={() => handleViewChart(item)}
                                        sx={{ bgcolor: 'info.light', '&:hover': { bgcolor: '#b2ebf2' }, width: 40, height: 40, mr: 0.5 }}
                                    >
                                        <ChartIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleBuyClick(item)}
                                        sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: '#bbdefb' }, width: 40, height: 40, mr: 0.5 }}
                                    >
                                        <CartIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemove(item)}
                                        sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: '#ffcdd2' }, width: 40, height: 40 }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary" variant="body2">
                                        {t('watchlist.empty')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Transaction Modal ─────────────────────────────────────────── */}
            <TransactionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                symbol={selectedItem.symbol}
                initialPrice={selectedItem.price}
                onSuccess={handleTransactionSuccess}
            />
        </Container>
    );
};

export default Market;
