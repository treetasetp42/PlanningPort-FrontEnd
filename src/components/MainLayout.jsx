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


const drawerWidth = 240;

const MainLayout = ({ children }) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const darkMode = useSelector((state) => state.theme.darkMode);
    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // Auto-close sidebar on mobile transition
    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    const handleProfileMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
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
        { text: t('common.watchlist'), icon: <ListAlt />, path: '/watchlist' },
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
                        {/* Language Switcher */}
                        <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 2, p: 0.5, mr: 1 }}>
                            <Button 
                                size="small" 
                                onClick={() => changeLanguage('en')}
                                sx={{ 
                                    minWidth: 40, px: 1, 
                                    bgcolor: i18n.language.startsWith('en') ? 'background.paper' : 'transparent',
                                    color: i18n.language.startsWith('en') ? 'primary.main' : 'text.secondary',
                                    fontWeight: i18n.language.startsWith('en') ? 700 : 500,
                                    '&:hover': { bgcolor: i18n.language.startsWith('en') ? 'background.paper' : 'action.selected' }
                                }}
                            >
                                EN
                            </Button>
                            <Button 
                                size="small" 
                                onClick={() => changeLanguage('th')}
                                sx={{ 
                                    minWidth: 40, px: 1, 
                                    bgcolor: i18n.language.startsWith('th') ? 'background.paper' : 'transparent',
                                    color: i18n.language.startsWith('th') ? 'primary.main' : 'text.secondary',
                                    fontWeight: i18n.language.startsWith('th') ? 700 : 500,
                                    '&:hover': { bgcolor: i18n.language.startsWith('th') ? 'background.paper' : 'action.selected' }
                                }}
                            >
                                TH
                            </Button>
                        </Box>

                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                                {colors.map((color) => (
                                    <Box
                                        key={color}
                                        onClick={() => handleColorChange(color)}
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: '50%',
                                            bgcolor: color,
                                            cursor: 'pointer',
                                            border: (theme) => theme.palette.primary.main === color ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
                                            '&:hover': { transform: 'scale(1.2)' },
                                            transition: 'transform 0.2s'
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        <IconButton sx={{ color: 'text.secondary' }} onClick={handleThemeToggle}>
                            {darkMode ? <Brightness7 fontSize={isMobile ? "small" : "medium"} /> : <Brightness4 fontSize={isMobile ? "small" : "medium"} />}
                        </IconButton>

                        <IconButton onClick={handleProfileMenu} sx={{ p: 0.5 }}>
                            <Avatar sx={{ width: isMobile ? 28 : 35, height: isMobile ? 28 : 35, bgcolor: 'primary.main', fontSize: isMobile ? '0.75rem' : '0.9rem', fontWeight: 600 }}>
                                PP
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>{t('common.edit_profile')}</MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                            {t('common.logout')}
                        </MenuItem>
                        {isMobile && <Divider />}
                        {isMobile && colors.map((color) => (
                            <MenuItem key={color} onClick={() => { handleColorChange(color); handleClose(); }}>
                                <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: '50%', mr: 1 }} />
                                {t('common.settings')}
                            </MenuItem>
                        ))}
                    </Menu>
                </Toolbar>
            </AppBar>

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
                    p: isMobile ? 2 : 4,
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