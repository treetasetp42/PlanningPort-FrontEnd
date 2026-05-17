import { useState, useEffect } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
    ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem,
    useMediaQuery, useTheme,
    Button
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard as DashboardIcon,
    Settings as SettingsIcon, Logout as LogoutIcon,
    AccountCircle, ListAlt, Brightness4, Brightness7,
    ChevronLeft as ChevronLeftIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { toggleTheme, setPrimaryColor } from '../features/themeSlice';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from './ConfirmDialog';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import { fetchPortfolios, setActivePortfolio } from '../features/portfolioSlice';
import PortfolioManagerModal from './PortfolioManagerModal';
import usePermission from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';
import Logo from './Logo';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const darkMode = useSelector((state) => state.theme.darkMode);
    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const [portfolioMenuAnchor, setPortfolioMenuAnchor] = useState(null);
    const [portfolioManagerOpen, setPortfolioManagerOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { list: portfolios, activePortfolioId, loading: portfoliosLoading } = useSelector(state => state.portfolio);
    const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

    const [userData, setUserData] = useState({ username: '', displayName: '', avatarUrl: '' });

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosClient.get(UrlPP.User.Me);
                setUserData(response.data);
                dispatch(fetchPortfolios(response.data.userId));
            } catch (err) {
                console.error("Failed to fetch user data in MainLayout", err);
            }
        };
        fetchUserData();
    }, [dispatch]);

    // Auto-close sidebar on mobile transition
    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    const handleProfileMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogoutClick = () => {
        handleClose();
        setConfirmLogoutOpen(true);
    };

    const handleConfirmLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    const handleColorChange = (color) => {
        dispatch(setPrimaryColor(color));
    };

    const colors = ['#1976d2', '#d32f2f', '#388e3c', '#7b1fa2', '#f57c00'];

    const hasAdminAccess = usePermission(PERMISSIONS.ADMIN_ACCESS);
    const permissions = useSelector((state) => state.auth.permissions);

    const allMenuItems = [
        { text: t('common.dashboard'), icon: <DashboardIcon />, path: '/dashboard', permission: null },
        { text: t('common.market'), icon: <ListAlt />, path: '/market', permission: PERMISSIONS.MARKET_VIEW },
        { text: t('common.settings'), icon: <SettingsIcon />, path: '/settings', permission: null },
    ];

    const menuItems = allMenuItems.filter(item =>
        !item.permission || (Array.isArray(permissions) && permissions.includes(item.permission))
    );


    const currentItem = menuItems.find(item => window.location.pathname === item.path);
    const pageTitle = currentItem ? currentItem.text : (window.location.pathname.startsWith('/admin') ? 'Admin' : 'Invest Planner');

    const NavItem = ({ item }) => {
        const active = window.location.pathname === item.path || window.location.pathname.startsWith(item.path + '/');
        return (
            <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                    onClick={() => { navigate(item.path); if (isMobile) setOpen(false); }}
                    sx={{
                        borderRadius: 2,
                        bgcolor: active ? 'primary.main' : 'transparent',
                        color: active ? 'primary.contrastText' : 'text.secondary',
                        '&:hover': { bgcolor: active ? 'primary.main' : 'action.hover' },
                        '& .MuiListItemIcon-root': { color: active ? 'primary.contrastText' : 'text.secondary' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
                <Box
                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <Logo width={170} height={70} />
                </Box>
                {isMobile && (
                    <IconButton onClick={() => setOpen(false)}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>

            {/* Main nav — grows to fill space */}
            <Box sx={{ overflow: 'auto', py: 2, flex: 1 }}>
                <List sx={{ px: 1.5 }}>
                    {menuItems.map((item) => <NavItem key={item.text} item={item} />)}
                </List>
            </Box>

            {/* Admin Panel — pinned at bottom, only for admins */}
            {hasAdminAccess && (
                <Box sx={{ px: 1.5, pb: 2 }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <NavItem item={{
                        text: 'Admin Panel',
                        icon: <AdminIcon />,
                        path: '/admin'
                    }} />
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
            {/* Header */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => isMobile ? theme.zIndex.drawer - 1 : theme.zIndex.drawer + 1,
                    bgcolor: darkMode ? 'background.paper' : '#ffffff',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundImage: 'none',
                    color: 'text.primary',
                    width: (!isMobile && open) ? `calc(100% - ${drawerWidth}px)` : '100%',
                    ml: (!isMobile && open) ? `${drawerWidth}px` : 0,
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setOpen(!open)}
                            sx={{
                                mr: isMobile ? 1 : 2,
                                p: 1, // Larger hit area
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography
                                variant={isMobile ? "subtitle1" : "h6"}
                                fontWeight="800"
                                color="text.primary"
                                noWrap
                                sx={{ lineHeight: 1 }}
                            >
                                {pageTitle}
                            </Typography>
                            {/* Portfolio Selector */}
                            {!portfoliosLoading && portfolios.length > 0 ? (
                                <Box
                                    onClick={(e) => setPortfolioMenuAnchor(e.currentTarget)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        mt: 0.5,
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    <Box sx={{
                                        width: 10, height: 10,
                                        borderRadius: '50%',
                                        bgcolor: activePortfolio?.colorCode || 'primary.main',
                                        mr: 1
                                    }} />
                                    <Typography variant="caption" fontWeight="700" color="text.secondary">
                                        {activePortfolio?.name || 'Select Portfolio'}
                                    </Typography>
                                </Box>
                            ) : (
                                !portfoliosLoading && (
                                    <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => setPortfolioManagerOpen(true)}
                                        sx={{
                                            p: 0, minWidth: 0, textTransform: 'none',
                                            fontSize: '0.75rem', fontWeight: 700,
                                            color: 'primary.main', justifyContent: 'flex-start',
                                            mt: 0.5
                                        }}
                                    >
                                        + {t('portfolio.create') || 'Create Portfolio'}
                                    </Button>
                                )
                            )}
                        </Box>
                    </Box>

                    {/* Portfolio Menu Dropdown */}
                    <Menu
                        anchorEl={portfolioMenuAnchor}
                        open={Boolean(portfolioMenuAnchor)}
                        onClose={() => setPortfolioMenuAnchor(null)}
                        PaperProps={{ sx: { minWidth: 200, borderRadius: 2, mt: 1 } }}
                    >
                        {portfolios.map(port => (
                            <MenuItem
                                key={port.id}
                                selected={port.id === activePortfolioId}
                                onClick={() => {
                                    dispatch(setActivePortfolio(port.id));
                                    setPortfolioMenuAnchor(null);
                                }}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}
                            >
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: port.colorCode || 'primary.main' }} />
                                <Typography variant="body2" fontWeight="700">{port.name}</Typography>
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                setPortfolioMenuAnchor(null);
                                setPortfolioManagerOpen(true);
                            }}
                            sx={{ color: 'primary.main', py: 1.5 }}
                        >
                            <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
                            <Typography variant="body2" fontWeight="800">{t('portfolio.manage') || 'Manage Portfolios'}</Typography>
                        </MenuItem>
                    </Menu>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 2 }}>
                        <IconButton onClick={handleProfileMenu} sx={{ p: 0.5 }}>
                            <Avatar
                                src={getAvatarUrl(userData.avatarUrl)}
                                sx={{
                                    width: isMobile ? 28 : 35,
                                    height: isMobile ? 28 : 35,
                                    bgcolor: 'primary.main',
                                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                {!userData.avatarUrl && (userData.displayName || userData.username || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <Box sx={{ px: 2, py: 1.5, minWidth: 180 }}>
                            <Typography variant="subtitle2" fontWeight="800" noWrap>
                                {userData.displayName || userData.username || 'User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {userData.roleName || 'Member'}
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <MenuItem onClick={() => { handleThemeToggle(); handleClose(); }}>
                            <ListItemIcon>
                                {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                            </ListItemIcon>
                            {darkMode ? t('settings.light') : t('settings.dark')}
                        </MenuItem>
                        <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                            {t('common.settings')}
                        </MenuItem>
                        <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                            {t('common.logout')}
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <ConfirmDialog
                open={confirmLogoutOpen}
                onClose={() => setConfirmLogoutOpen(false)}
                onConfirm={handleConfirmLogout}
                title={t('confirm.logout_title')}
                message={t('confirm.logout_message')}
                confirmText={t('common.logout')}
                severity="error"
            />

            <PortfolioManagerModal
                open={portfolioManagerOpen}
                onClose={() => setPortfolioManagerOpen(false)}
            />

            <Drawer
                key={isMobile ? 'mobile' : 'desktop'} // Force remount on resize to prevent state traps
                variant={isMobile ? "temporary" : "persistent"}
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    width: isMobile ? 0 : drawerWidth,
                    flexShrink: 0,
                    pointerEvents: (isMobile && !open) ? 'none' : 'auto',
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: darkMode ? 'background.paper' : '#ffffff',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    px: isMobile ? 0 : 4,
                    py: isMobile ? 2 : 4,
                    mt: 8,
                    width: '100%',
                    transition: (theme) => theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ml: (!isMobile && open) ? 0 : (isMobile ? 0 : `-${drawerWidth}px`),
                }}
            >
                {children}
            </Box>
        </Box>
    );
};



export default MainLayout;