import { useState, useEffect } from 'react';
import {
    Brightness4, Edit, Language, Palette, PhotoCamera, Delete, Lock, Visibility, VisibilityOff
} from '@mui/icons-material';
import {
    Container, TextField, Button, Typography, Box, Paper,
    useTheme, useMediaQuery, Divider, Dialog, DialogTitle,
    DialogContent, DialogActions,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    Checkbox,
    Link
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toggleTheme, setPrimaryColor, setFontSize } from '../features/themeSlice';
import { logout, loginSuccess, loginGuest } from '../features/authSlice';
import axiosClient from '../api/axiosClient';
import UrlPP from '../api/UrlPP';
import ConfirmDialog from '../components/ConfirmDialog';
import { GoogleLogin } from '@react-oauth/google';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const darkMode = useSelector((state) => state.theme.darkMode);
    const primaryColor = useSelector((state) => state.theme.primaryColor);
    const fontSize = useSelector((state) => state.theme.fontSize);
    const userId = useSelector((state) => state.auth.user);
    const isGuest = useSelector((state) => state.auth.isGuest);

    const [isGuestRegisterOpen, setIsGuestRegisterOpen] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [guestCredentials, setGuestCredentials] = useState({ username: '', password: '', confirmPassword: '', email: '' });
    const [guestConsentChecked, setGuestConsentChecked] = useState(false);
    const [consentDialogOpen, setConsentDialogOpen] = useState({ open: false, viewOnly: false });

    const gPassword = guestCredentials.password || '';
    const gIsMinLength = gPassword.length >= 8;
    const gHasLowercase = /[a-z]/.test(gPassword);
    const gHasUppercase = /[A-Z]/.test(gPassword);
    const gHasNumber = /[0-9]/.test(gPassword);
    const gHasSpecial = /[^A-Za-z0-9]/.test(gPassword);
    const gIsPasswordValid = gIsMinLength && gHasLowercase && gHasUppercase && gHasNumber && gHasSpecial;
    const gPasswordsMatch = gPassword !== '' && gPassword === guestCredentials.confirmPassword;

    const [userData, setUserData] = useState({ username: '', displayName: '', avatarUrl: '' });
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
    const [requestDeleteDialogOpen, setRequestDeleteDialogOpen] = useState(false);

    const [editData, setEditData] = useState({
        username: '',
        displayName: '',
        email: '',
        avatarFile: null,
        deleteAvatar: false,
        previewUrl: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const newPassword = passwordData.newPassword || '';
    const isMinLength = newPassword.length >= 8;
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const isPasswordValid = isMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecial;
    const passwordsMatch = newPassword !== '' && newPassword === passwordData.confirmNewPassword;

    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const colors = ['#1976d2', '#d32f2f', '#388e3c', '#7b1fa2', '#f57c00'];

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchUserData = async () => {
        try {
            const response = await axiosClient.get(UrlPP.User.Me);
            setUserData(response.data);
            setEditData({
                username: response.data.username || '',
                displayName: response.data.displayName || '',
                email: response.data.email || '',
                avatarFile: null,
                deleteAvatar: false,
                previewUrl: getAvatarUrl(response.data.avatarUrl)
            });
        } catch (err) {
            console.error("Failed to fetch user data", err);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Optimization: Recursive quality reduction until < 500kb
                    let quality = 0.9;
                    const convert = (q) => {
                        canvas.toBlob((blob) => {
                            if (blob.size > 500 * 1024 && q > 0.1) {
                                convert(q - 0.1);
                            } else {
                                resolve(blob);
                            }
                        }, 'image/jpeg', q);
                    };
                    convert(quality);
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedBlob = await compressImage(file);
            setEditData({
                ...editData,
                avatarFile: compressedBlob,
                deleteAvatar: false,
                previewUrl: URL.createObjectURL(compressedBlob)
            });
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('RemoteUser', editData.username);
            formData.append('DisplayName', editData.displayName);
            formData.append('Email', editData.email);
            if (editData.avatarFile) {
                formData.append('AvatarFile', editData.avatarFile, 'avatar.jpg');
            }
            formData.append('DeleteCurrentAvatar', editData.deleteAvatar);

            await axiosClient.put(UrlPP.User.UpdateProfile, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setEditProfileOpen(false);
            fetchUserData()
            setNotification({ open: true, message: t('settings.profile_updated'), severity: 'success' });
        } catch (err) {
            setNotification({ open: true, message: err.response?.data || t('settings.profile_updated'), severity: 'error' });
        }
    };
    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setNotification({ open: true, message: t('login.password_mismatch'), severity: 'error' });
            return;
        }

        if (!isPasswordValid) {
            setNotification({ open: true, message: 'Password does not meet security requirements', severity: 'error' });
            return;
        }

        try {
            await axiosClient.post(UrlPP.User.ChangePassword, passwordData);
            setNotification({ open: true, message: 'Password changed successfully', severity: 'success' });
            setChangePasswordOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data || 'Failed to change password',
                severity: 'error'
            });
        }
    };

    const handleLinkGoogle = async (credentialResponse) => {
        try {
            await axiosClient.post(UrlPP.User.LinkGoogle, { credential: credentialResponse.credential });
            setNotification({ open: true, message: t('settings.profile_updated'), severity: 'success' });
            fetchUserData();
        } catch (err) {
            setNotification({ open: true, message: t('settings.unlink_google') + ' ' + (err.response?.data || ''), severity: 'error' });
        }
    };

    const handleUnlinkGoogle = async () => {
        setUnlinkDialogOpen(false);
        try {
            await axiosClient.post(UrlPP.User.UnlinkGoogle);
            setNotification({ open: true, message: t('settings.unlink_google') + ' ✓', severity: 'success' });
            fetchUserData();
        } catch (err) {
            const msg = err.response?.data || '';
            if (msg.includes('local password')) {
                setNotification({ open: true, message: t('settings.unlink_warning'), severity: 'warning' });
                setChangePasswordOpen(true); // Redirect them to the Set Password dialog immediately
            } else {
                setNotification({ open: true, message: msg, severity: 'error' });
            }
        }
    };

    const handleRequestDelete = async () => {
        setRequestDeleteDialogOpen(false);
        try {
            await axiosClient.post(UrlPP.User.RequestDelete);
            setNotification({ open: true, message: t('settings.request_deletion') + ' ✓', severity: 'warning' });
            fetchUserData();
        } catch (err) {
            setNotification({ open: true, message: err.response?.data || '', severity: 'error' });
        }
    };

    const handleCancelDelete = async () => {
        try {
            await axiosClient.post(UrlPP.User.CancelDelete);
            setNotification({ open: true, message: t('settings.cancel_deletion') + ' ✓', severity: 'success' });
            fetchUserData();
        } catch (err) {
            setNotification({ open: true, message: err.response?.data || '', severity: 'error' });
        }
    };

    const handleMigrateGuestData = async (newUserId, accessToken) => {
        try {
            const guestPortfolios = JSON.parse(localStorage.getItem('guest_portfolios') || '[]');

            // Loop through guest portfolios and migrate to backend!
            for (const guestPort of guestPortfolios) {
                // 1. Create portfolio on backend
                const newPortResponse = await axiosClient.post(UrlPP.Portfolio.Add(newUserId), {
                    name: guestPort.name,
                    description: guestPort.description,
                    colorCode: guestPort.colorCode
                });

                const newPortId = newPortResponse.data.id;

                // Calculate the initial cash balance needed so that after sequential transaction execution,
                // the backend cash balance reconciles to the exact local guestCash.
                const guestCash = parseFloat(localStorage.getItem(`guest_cash_${guestPort.id}`) || '10000.00');
                const guestTxs = JSON.parse(localStorage.getItem(`guest_transactions_${guestPort.id}`) || '[]');

                let initialCash = guestCash;
                for (const tx of guestTxs) {
                    const txCost = tx.quantity * tx.pricePerUnit;
                    if (tx.type === 'Buy') {
                        initialCash += txCost; // Add back the spent cash
                    } else if (tx.type === 'Sell') {
                        initialCash -= txCost; // Subtract the earned cash
                    }
                }
                initialCash = Math.max(0, initialCash);

                // 2. Deposit the computed initial cash balance
                if (initialCash > 0) {
                    await axiosClient.post(UrlPP.Cash.Deposit(newPortId, initialCash.toFixed(2)));
                }

                // 3. Migrate all Transactions
                for (const tx of guestTxs) {
                    await axiosClient.post(`/Transaction/add?portfolioId=${newPortId}`, {
                        symbol: tx.symbol,
                        type: tx.type,
                        quantity: tx.quantity,
                        pricePerUnit: tx.pricePerUnit,
                        assetType: tx.assetType,
                        subtype: tx.subtype,
                        exchange: tx.exchange
                    });
                }
            }

            // Clean up guest local storage keys
            localStorage.removeItem('guest_portfolios');
            guestPortfolios.forEach(p => {
                localStorage.removeItem(`guest_cash_${p.id}`);
                localStorage.removeItem(`guest_transactions_${p.id}`);
            });
            localStorage.removeItem('isGuest');

            setNotification({ open: true, message: t('settings.guest_register_success'), severity: 'success' });

            // Dispatch login success to transition UI
            dispatch(loginSuccess({
                accessToken,
                refreshToken: localStorage.getItem('refreshToken'),
                userId: newUserId,
                permissions: [
                    "PORTFOLIO_VIEW",
                    "PORTFOLIO_CREATE",
                    "PORTFOLIO_DELETE",
                    "MARKET_VIEW",
                    "MARKET_TRADE"
                ],
                roleName: "Member"
            }));

            // Refresh screen to fetch the official backend profile
            navigate('/');
            window.location.reload();
        } catch (err) {
            console.error("Migration error", err);
            setNotification({ open: true, message: "Failed to sync some guest portfolios", severity: 'warning' });
        } finally {
            setIsMigrating(false);
        }
    };

    const handleGuestRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!guestCredentials.email || !guestCredentials.email.trim()) {
            setNotification({ open: true, message: t('login.please_enter_email'), severity: 'error' });
            return;
        }
        if (!gIsPasswordValid || !gPasswordsMatch || !guestConsentChecked) {
            setNotification({ open: true, message: 'Please complete all validations and agree to terms', severity: 'error' });
            return;
        }

        setIsMigrating(true);
        try {
            // 1. Register account on backend
            await axiosClient.post(UrlPP.User.Register, {
                remoteUser: guestCredentials.username,
                remotePassword: guestCredentials.password,
                email: guestCredentials.email
            });

            // 2. Automatically log in to get credentials
            const loginResponse = await axiosClient.post(UrlPP.User.Login, {
                remoteUser: guestCredentials.username,
                remotePassword: guestCredentials.password
            });

            const { accessToken, refreshToken, userId } = loginResponse.data;

            // 3. Temporarily set token in localStorage and clear guest flag so network requests go through!
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userId', userId);
            localStorage.removeItem('isGuest');

            // 4. Run data migration!
            await handleMigrateGuestData(userId, accessToken);

            setIsGuestRegisterOpen(false);
        } catch (error) {
            setNotification({ open: true, message: 'Registration failed: ' + (error.response?.data || ''), severity: 'error' });
            setIsMigrating(false);
        }
    };

    const handleGuestGoogleSuccess = async (credentialResponse) => {
        setIsMigrating(true);
        try {
            // Send to Google Login / link endpoint to register or login using Google
            const response = await axiosClient.post(UrlPP.User.GoogleLogin, {
                credential: credentialResponse.credential
            });

            const { accessToken, refreshToken, userId } = response.data;

            // Set session credentials
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userId', userId);
            localStorage.removeItem('isGuest');

            // Migrate
            await handleMigrateGuestData(userId, accessToken);
        } catch (err) {
            console.error(err);
            setNotification({ open: true, message: 'Google link failed: ' + (err.response?.data || ''), severity: 'error' });
            setIsMigrating(false);
        }
    };

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

            {/* Profile Section */}
            <Paper elevation={0} sx={{
                p: 3, mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', gap: 3, position: 'relative'
            }}>
                <Avatar
                    src={getAvatarUrl(userData.avatarUrl)}
                    sx={{
                        width: 80, height: 80, bgcolor: 'primary.main',
                        fontSize: '2rem', fontWeight: 800,
                        boxShadow: `0 8px 24px ${theme.palette.primary.main}22`
                    }}
                >
                    {!userData.avatarUrl && (userData.displayName || userData.username || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="800">
                        {userData.displayName || userData.username || 'Loading...'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {userData.roleName || 'Member'} — {userData.email || '@' + userData.username}
                    </Typography>
                    {!isGuest && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => setEditProfileOpen(true)}
                            sx={{ borderRadius: 4, fontWeight: 700, mt: 1.5, textTransform: 'none' }}
                        >
                            {t('common.edit')}
                        </Button>
                    )}
                </Box>
            </Paper>

            {isGuest && (
                <Paper elevation={0} sx={{
                    p: 3, mb: 3, borderRadius: 4,
                    border: '1px dashed',
                    borderColor: 'primary.main',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(108,93,211,0.15) 0%, rgba(108,93,211,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(108,93,211,0.08) 0%, rgba(108,93,211,0.02) 100%)',
                    boxShadow: `0 8px 32px ${theme.palette.primary.main}11`
                }}>
                    <Typography variant="h6" fontWeight="800" color="primary" sx={{ mb: 1 }}>
                        ✨ {t('settings.guest_banner_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {t('settings.guest_banner_body')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            disabled={isMigrating}
                            onClick={() => setIsGuestRegisterOpen(true)}
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                        >
                            {isMigrating ? t('common.loading') : t('settings.guest_register_sync')}
                        </Button>
                        <Box sx={{ display: 'inline-block' }}>
                            <GoogleLogin
                                onSuccess={handleGuestGoogleSuccess}
                                onError={() => setNotification({ open: true, message: 'Google link failed', severity: 'error' })}
                                useOneTap={false}
                                theme="filled_blue"
                                text="continue_with"
                                type="standard"
                                shape="pill"
                                disabled={isMigrating}
                            />
                        </Box>
                    </Box>
                </Paper>
            )}

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

                    {/* 3. Font Size */}
                    <ListItem sx={{ py: 2, alignItems: 'center' }}>
                        <ListItemIcon>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', color: 'primary.main', fontWeight: 800, lineHeight: 1, ml: 0.25 }}>
                                <span style={{ fontSize: '0.7rem' }}>A</span>
                                <span style={{ fontSize: '1.1rem', margin: '0 1px' }}>A</span>
                                <span style={{ fontSize: '1.5rem' }}>A</span>
                            </Box>
                        </ListItemIcon>
                        <ListItemText
                            primary={t('settings.font_size')}
                            primaryTypographyProps={{ fontWeight: 700 }}
                            sx={{ minWidth: 150 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {[{ key: 'small', label: t('settings.font_small'), size: '0.75rem' },
                            { key: 'normal', label: t('settings.font_normal'), size: '0.875rem' },
                            { key: 'large', label: t('settings.font_large'), size: '1.0625rem' }]
                                .map(({ key, label, size }) => (
                                    <Button
                                        key={key}
                                        size="small"
                                        variant={fontSize === key ? 'contained' : 'outlined'}
                                        onClick={() => dispatch(setFontSize(key))}
                                        sx={{ borderRadius: 2, px: 1.5, fontWeight: 700, minWidth: 0, fontSize: size }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                        </Box>
                    </ListItem>

                    <Divider variant="inset" component="li" />

                    {/* 4. Language Switcher */}
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

                    {!isGuest && (
                        <>
                            <Divider variant="inset" component="li" />

                            {/* 4. Security / Password */}
                            <ListItem sx={{ py: 2 }}>
                                <ListItemIcon><Lock color="primary" /></ListItemIcon>

                                <ListItemText
                                    primary={t('settings.account_security')}
                                    secondary={userData.hasPassword ? t('settings.update_password') : t('settings.set_local_password')}
                                    primaryTypographyProps={{ fontWeight: 700 }}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setChangePasswordOpen(true)}
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                >
                                    {userData.hasPassword ? t('settings.change_password_btn') : t('settings.set_password_btn')}
                                </Button>
                            </ListItem>

                            <Divider variant="inset" component="li" />

                            {/* 5. Connected Accounts */}
                            <ListItem sx={{ py: 2 }}>
                                <ListItemIcon><Language color="primary" /></ListItemIcon>

                                <ListItemText
                                    primary={t('settings.connected_accounts')}
                                    secondary={t('settings.connected_accounts_desc')}
                                    primaryTypographyProps={{ fontWeight: 700 }}
                                />
                                <Box>
                                    {userData.isGoogleLinked ? (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => setUnlinkDialogOpen(true)}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                        >
                                            {t('settings.unlink_google')}
                                        </Button>
                                    ) : (
                                        <GoogleLogin
                                            onSuccess={handleLinkGoogle}
                                            onError={() => setNotification({ open: true, message: 'Google link popup closed or failed', severity: 'error' })}
                                            useOneTap={false}
                                            theme="filled_blue"
                                            text="continue_with"
                                            type="standard"
                                            shape="pill"
                                        />
                                    )}
                                </Box>
                            </ListItem>
                        </>
                    )}
                </List>
            </Paper>

            {/* Danger Zone — Delete Account */}
            {!isGuest && (
                <Paper elevation={0} sx={{
                    p: { xs: 2, sm: 3 }, mt: 3, borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'error.main',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(211,47,47,0.08)' : 'rgba(211,47,47,0.04)'
                }}>

                    <List disablePadding>
                        <ListItem sx={{ py: 1.5, px: 0 }}>
                            <ListItemText
                                primary={t('settings.delete_account')}
                                secondary={
                                    userData.deleteRequestedAt
                                        ? t('settings.delete_scheduled', {
                                            date: new Date(new Date(userData.deleteRequestedAt).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                                            days: Math.max(0, 14 - Math.floor((Date.now() - new Date(userData.deleteRequestedAt).getTime()) / (1000 * 60 * 60 * 24)))
                                        })
                                        : t('settings.delete_account_desc')
                                }
                                primaryTypographyProps={{ fontWeight: 700, color: 'error.main' }}
                                secondaryTypographyProps={{ color: userData.deleteRequestedAt ? 'warning.main' : 'text.secondary' }}
                            />
                            {userData.deleteRequestedAt ? (
                                <Button
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    onClick={handleCancelDelete}
                                    sx={{ borderRadius: 2, fontWeight: 700, ml: 2, flexShrink: 0 }}
                                >
                                    {t('settings.cancel_deletion')}
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setRequestDeleteDialogOpen(true)}
                                    sx={{ borderRadius: 2, fontWeight: 700, ml: 2, flexShrink: 0 }}
                                >
                                    {t('settings.request_deletion')}
                                </Button>
                            )}
                        </ListItem>
                    </List>
                </Paper>
            )}
            {/* Edit Profile Dialog */}
            <Dialog
                open={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>{t('settings.edit_profile_title')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={editData.previewUrl}
                                sx={{
                                    width: 100, height: 100,
                                    border: `4px solid ${theme.palette.background.paper}`,
                                    boxShadow: theme.shadows[3]
                                }}
                            >
                                {!editData.previewUrl && (editData.displayName).charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ position: 'absolute', bottom: 0, right: 0, display: 'flex', gap: 0.5 }}>
                                <IconButton
                                    component="label"
                                    size="small"
                                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                >
                                    <PhotoCamera fontSize="small" />
                                    <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                                </IconButton>
                                {editData.previewUrl && (
                                    <IconButton
                                        size="small"
                                        onClick={() => setEditData({ ...editData, deleteAvatar: true, avatarFile: null, previewUrl: '' })}
                                        sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Username"
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        disabled={userData.username !== userData.email}
                        helperText={userData.username !== userData.email ? "Username cannot be changed once set." : ""}
                        sx={{ mt: 3 }}
                    />
                    <TextField
                        fullWidth
                        label={t('settings.display_name')}
                        value={editData.displayName}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        disabled={userData.isGoogleLinked}
                        helperText={userData.isGoogleLinked ? "Email cannot be changed while linked to Google" : ""}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditProfileOpen(false)} sx={{ fontWeight: 700 }}>{t('common.cancel')}</Button>
                    <Button variant="contained" onClick={handleUpdateProfile} sx={{ fontWeight: 700, borderRadius: 2 }}>
                        {t('settings.save_changes')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {userData.hasPassword ? t('settings.change_password_btn') : t('settings.set_password_title')}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {userData.hasPassword ? t('settings.change_password_desc') : t('settings.set_password_desc')}
                    </Typography>

                    {userData.hasPassword && (
                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label={t('settings.current_password')}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}
                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label={t('settings.new_password')}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        sx={{ mb: 2 }}
                    />

                    {/* Password Requirements Indicator */}
                    {newPassword !== '' && (
                        <Box sx={{ mt: 1, mb: 2, textAlign: 'left', px: 1 }}>
                            <Typography variant="caption" fontWeight="700" color="text.secondary" gutterBottom display="block">
                                {t('login.password_requirements_title')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {[
                                    { met: isMinLength, label: t('login.password_req_length') },
                                    { met: hasLowercase, label: t('login.password_req_lowercase') },
                                    { met: hasUppercase, label: t('login.password_req_uppercase') },
                                    { met: hasNumber, label: t('login.password_req_number') },
                                    { met: hasSpecial, label: t('login.password_req_special') }
                                ].map((req, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: req.met ? 'success.main' : 'text.disabled',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color={req.met ? 'success.main' : 'text.secondary'}
                                                sx={{ transition: 'color 0.2s' }}
                                            >
                                                {req.label}
                                            </Typography>
                                        </Box>
                                    ))}
                            </Box>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label={t('settings.confirm_new_password')}
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        error={passwordData.confirmNewPassword !== '' && !passwordsMatch}
                        helperText={passwordData.confirmNewPassword !== '' && !passwordsMatch ? t('login.password_mismatch') : ''}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setChangePasswordOpen(false)} sx={{ fontWeight: 700 }}>{t('common.cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdatePassword}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                        disabled={
                            (userData.hasPassword && !passwordData.currentPassword) ||
                            !passwordData.newPassword ||
                            !passwordsMatch ||
                            !isPasswordValid
                        }
                    >
                        {userData.hasPassword ? t('settings.update_password_btn') : t('settings.set_password_btn')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmLogoutOpen}
                title="Logout"
                content="Are you sure you want to logout?"
                onConfirm={handleLogout}
                onClose={() => setConfirmLogoutOpen(false)}
            />

            {/* Unlink Google Confirmation */}
            <Dialog open={unlinkDialogOpen} onClose={() => setUnlinkDialogOpen(false)}>
                <DialogTitle fontWeight={800}>{t('settings.unlink_title')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('settings.unlink_body')}</Typography>
                    {!userData.hasPassword && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {t('settings.unlink_warning')}
                        </Alert>
                    )}
                    {userData.hasPassword && (
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            {t('settings.unlink_after')}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUnlinkDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button variant="contained" color="error" onClick={handleUnlinkGoogle} disabled={!userData.hasPassword}>
                        {t('settings.unlink_btn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Request Account Deletion Confirmation */}
            <Dialog open={requestDeleteDialogOpen} onClose={() => setRequestDeleteDialogOpen(false)}>
                <DialogTitle fontWeight={800}>⚠ {t('settings.request_delete_title')}</DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {t('settings.request_delete_warning')}
                    </Alert>
                    <Typography variant="body2">
                        {t('settings.request_delete_body')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 700 }}>
                        {t('settings.request_delete_note')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRequestDeleteDialogOpen(false)}>{t('settings.keep_account_btn')}</Button>
                    <Button variant="contained" color="error" onClick={handleRequestDelete}>
                        {t('settings.confirm_deletion_btn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Guest Register Sync Dialog */}
            <Dialog
                open={isGuestRegisterOpen}
                onClose={() => !isMigrating && setIsGuestRegisterOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {t('settings.guest_register_title')}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleGuestRegisterSubmit}>
                        <TextField
                            fullWidth
                            label={t('common.username')}
                            value={guestCredentials.username}
                            onChange={(e) => setGuestCredentials({ ...guestCredentials, username: e.target.value })}
                            disabled={isMigrating}
                            sx={{ mt: 1, mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            required
                            label={t('login.email_optional')}
                            value={guestCredentials.email}
                            onChange={(e) => setGuestCredentials({ ...guestCredentials, email: e.target.value })}
                            disabled={isMigrating}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label={t('common.password')}
                            value={guestCredentials.password}
                            onChange={(e) => setGuestCredentials({ ...guestCredentials, password: e.target.value })}
                            disabled={isMigrating}
                            sx={{ mb: 2 }}
                            required
                        />

                        {/* Password Requirements Indicator */}
                        {gPassword !== '' && (
                            <Box sx={{ mt: 1, mb: 2, textAlign: 'left', px: 1 }}>
                                <Typography variant="caption" fontWeight="700" color="text.secondary" gutterBottom display="block">
                                    {t('login.password_requirements_title')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {[
                                        { met: gIsMinLength, label: t('login.password_req_length') },
                                        { met: gHasLowercase, label: t('login.password_req_lowercase') },
                                        { met: gHasUppercase, label: t('login.password_req_uppercase') },
                                        { met: gHasNumber, label: t('login.password_req_number') },
                                        { met: gHasSpecial, label: t('login.password_req_special') }
                                    ].map((req, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        bgcolor: req.met ? 'success.main' : 'text.disabled',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    color={req.met ? 'success.main' : 'text.secondary'}
                                                    sx={{ transition: 'color 0.2s' }}
                                                >
                                                    {req.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                </Box>
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label={t('login.confirm_password_label')}
                            value={guestCredentials.confirmPassword}
                            onChange={(e) => setGuestCredentials({ ...guestCredentials, confirmPassword: e.target.value })}
                            disabled={isMigrating}
                            error={guestCredentials.confirmPassword !== '' && !gPasswordsMatch}
                            helperText={guestCredentials.confirmPassword !== '' && !gPasswordsMatch ? t('login.password_mismatch') : ''}
                            sx={{ mb: 2 }}
                            required
                        />

                        {/* Consent Checkbox */}
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', textAlign: 'left', px: 1 }}>
                            <Checkbox
                                checked={guestConsentChecked}
                                onClick={() => setConsentDialogOpen({ open: true, viewOnly: false })}
                                color="primary"
                                sx={{ p: 0, mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setConsentDialogOpen({ open: true, viewOnly: false });
                                    }}
                                    sx={{ textDecoration: 'underline', color: 'inherit', fontWeight: 600, textAlign: 'left' }}
                                >
                                    {t('login.consent_checkbox')}
                                </Link>
                            </Typography>
                        </Box>

                        <DialogActions sx={{ p: 0, mt: 3 }}>
                            <Button onClick={() => setIsGuestRegisterOpen(false)} sx={{ fontWeight: 700 }}>
                                {t('common.cancel')}
                            </Button>
                            {guestConsentChecked && (
                                <Button
                                    type="submit"
                                    disabled={isMigrating || !gIsPasswordValid || !gPasswordsMatch}
                                    variant="contained"
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                >
                                    {isMigrating ? t('common.loading') : t('settings.guest_register_sync')}
                                </Button>
                            )}
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Terms of Service & Privacy Policy Consent Dialog */}
            <Dialog open={consentDialogOpen.open} onClose={() => setConsentDialogOpen({ open: false, viewOnly: false })} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={800}>{t('login.consent_dialog_title')}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('login.consent_dialog_body')}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
                        {t('login.consent_dialog_tos_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('login.consent_dialog_tos_body')}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
                        {t('login.consent_dialog_privacy_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('login.consent_dialog_privacy_body')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    {!consentDialogOpen.viewOnly ? (
                        <>
                            <Button color="error" onClick={() => {
                                setGuestConsentChecked(false);
                                setConsentDialogOpen({ open: false, viewOnly: false });
                            }}>
                                {t('common.cancel')}
                            </Button>
                            <Button variant="contained" color="success" onClick={() => {
                                setGuestConsentChecked(true);
                                setConsentDialogOpen({ open: false, viewOnly: false });
                            }}>
                                {t('login.consent_dialog_accept')}
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" onClick={() => setConsentDialogOpen({ open: false, viewOnly: false })}>{t('common.close')}</Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%', borderRadius: 3, boxShadow: theme.shadows[6] }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Settings;
