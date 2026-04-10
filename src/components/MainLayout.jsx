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
    ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { toggleTheme, setPrimaryColor } from '../features/themeSlice';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from './ConfirmDialog';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';


const drawerWidth = 240;

const MainLayout = ({ children }) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const darkMode = useSelector((state) => state.theme.darkMode);
    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [userData, setUserData] = useState({ username: '', displayName: '', avatarUrl: '' });

    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_BASE_URL}${path}`;
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosClient.get(UrlPP.User.Me);
                setUserData(response.data);
            } catch (err) {
                console.error("Failed to fetch user data in MainLayout", err);
            }
        };
        fetchUserData();
    }, []);

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

    const menuItems = [
        { text: t('common.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
        { text: t('common.market'), icon: <ListAlt />, path: '/market' },
        { text: t('common.settings'), icon: <SettingsIcon />, path: '/settings' },
    ];

    const currentItem = menuItems.find(item => window.location.pathname === item.path);
    const pageTitle = currentItem ? currentItem.text : 'Invest Planner';

    const drawerContent = (
        <>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="img" src="/favicon.svg" sx={{ width: 32, height: 32 }} />
                    <Typography variant="h6" fontWeight="800">Invest Planner</Typography>
                </Box>
                {isMobile && (
                    <IconButton onClick={() => setOpen(false)}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider sx={{ opacity: 0.5 }} />
            <Box sx={{ overflow: 'auto', py: 2 }}>
                <List sx={{ px: 1.5 }}>
                    {menuItems.map((item) => {
                        const active = window.location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        if (isMobile) setOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: active ? 'primary.main' : 'transparent',
                                        color: active ? 'primary.contrastText' : 'text.secondary',
                                        '&:hover': {
                                            bgcolor: active ? 'primary.main' : 'action.hover',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: active ? 'primary.contrastText' : 'text.secondary',
                                        }
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
                    })}
                </List>
            </Box>
        </>
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
                        <Typography
                            variant={isMobile ? "subtitle1" : "h6"}
                            fontWeight="800"
                            color="text.primary"
                            noWrap
                        >
                            {pageTitle}
                        </Typography>
                    </Box>

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
                                {userData.role || 'Member'}
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
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