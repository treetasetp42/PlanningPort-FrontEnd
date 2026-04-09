import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Avatar, Button,
    Switch, IconButton, Divider, useTheme, Card, CardContent,
    List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
    Brightness4, Brightness7, Language, Palette,
    Logout, Person, ChevronRight
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toggleTheme, setPrimaryColor } from '../features/themeSlice';
import { logout } from '../features/authSlice';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import ConfirmDialog from '../components/ConfirmDialog';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const darkMode = useSelector((state) => state.theme.darkMode);
    const primaryColor = useSelector((state) => state.theme.primaryColor);
    const userId = useSelector((state) => state.auth.user);

    const [userData, setUserData] = useState({ username: '' });
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const colors = ['#1976d2', '#d32f2f', '#388e3c', '#7b1fa2', '#f57c00'];

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosClient.get(UrlPP.User.Me);
                setUserData(response.data);
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
            {/* Page Title */}
            <Typography variant="h4" fontWeight="800" sx={{ mb: 4 }}>
                {t('settings.title')}
            </Typography>

            {/* Profile Section (Separate) */}
            <Paper elevation={0} sx={{
                p: 3, mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', gap: 3
            }}>
                <Avatar sx={{
                    width: 80, height: 80, bgcolor: 'primary.main',
                    fontSize: '2rem', fontWeight: 800,
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}22`
                }}>
                    {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight="800">
                        {userData.username || 'Loading...'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Invest Planner Member
                    </Typography>
                </Box>
            </Paper>

            {/* Settings Box (Row layout) */}
            <Paper elevation={0} sx={{
                p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider'
            }}>
                <List disablePadding>
                    {/* 1. Theme Mode */}
                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon><Brightness4 color="primary" /></ListItemIcon>
                        <ListItemText
                            primary={t('settings.theme_mode')}
                            primaryTypographyProps={{ fontWeight: 700 }}
                        />
                        <Switch
                            checked={darkMode}
                            onChange={() => dispatch(toggleTheme())}
                            color="primary"
                        />
                    </ListItem>

                    <Divider variant="inset" component="li" />

                    {/* 2. Color Theme */}
                    <ListItem sx={{ py: 2, alignItems: 'center' }}>
                        <ListItemIcon><Palette color="primary" /></ListItemIcon>
                        <ListItemText
                            primary={t('settings.theme_color')}
                            primaryTypographyProps={{ fontWeight: 700 }}
                            sx={{ minWidth: 150 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                            {colors.map((color) => (
                                <Box
                                    key={color}
                                    onClick={() => dispatch(setPrimaryColor(color))}
                                    sx={{
                                        width: 28, height: 28, borderRadius: '50%', bgcolor: color, cursor: 'pointer',
                                        border: primaryColor === color ? `3px solid ${theme.palette.text.primary}` : '2px solid transparent',
                                        transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' }
                                    }}
                                />
                            ))}
                        </Box>
                    </ListItem>

                    <Divider variant="inset" component="li" />

                    {/* 3. Language Switcher */}
                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon><Language color="primary" /></ListItemIcon>
                        <ListItemText
                            primary={t('settings.language_section')}
                            primaryTypographyProps={{ fontWeight: 700 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                variant={i18n.language.startsWith('en') ? 'contained' : 'outlined'}
                                onClick={() => changeLanguage('en')}
                                sx={{ borderRadius: 2, px: 2, fontWeight: 700 }}
                            >
                                EN
                            </Button>
                            <Button
                                size="small"
                                variant={i18n.language.startsWith('th') ? 'contained' : 'outlined'}
                                onClick={() => changeLanguage('th')}
                                sx={{ borderRadius: 2, px: 2, fontWeight: 700 }}
                            >
                                TH
                            </Button>
                        </Box>
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default Settings;
