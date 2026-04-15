import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
    Tooltip, TextField, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, FormControl, InputLabel,
    Select, MenuItem, Divider, Stack, Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    ManageAccounts as ManageIcon,
    Lock as BanIcon,
    LockOpen as UnbanIcon,
    Key as ResetPwdIcon,
    AdminPanelSettings as AdminIcon,
    Shield as ShieldIcon,
    MoreVert as MoreVertIcon,
    Block as DisableIcon,
    CheckCircle as EnableIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Menu, MenuItem as MuiMenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import axiosClient from '../../api/axiosClient';
import UrlPP from '../../api/UrlPP';
import { useNavigate } from 'react-router-dom';
import usePermission from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

const BAN_PRESETS = [
    { label: '1 Hour', hours: 1 },
    { label: '24 Hours', hours: 24 },
    { label: '7 Days', hours: 24 * 7 },
    { label: '30 Days', hours: 24 * 30 },
    { label: '1 Year', hours: 24 * 365 },
    { label: 'Permanent', hours: null },
];

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newRoleId, setNewRoleId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [banReason, setBanReason] = useState('');
    const [banPreset, setBanPreset] = useState(null);
    const [resetResultPassword, setResetResultPassword] = useState(null);
    const [actionAnchorEl, setActionAnchorEl] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const canEdit = usePermission(PERMISSIONS.ADMIN_USERS_EDIT);

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get(UrlPP.Admin.Users());
            setUsers(res.data.users);
            setTotal(res.data.total);
        } catch { enqueueSnackbar('Failed to load users', { variant: 'error' }); }
    };

    const fetchRoles = async () => {
        try {
            const res = await axiosClient.get(UrlPP.Admin.RolesList);
            setRoles(res.data);
        } catch { }
    };

    useEffect(() => { fetchUsers(); fetchRoles(); }, []);

    const openManage = (user) => {
        setSelectedUser(user);
        setNewRoleId(user.roleId);
        setNewPassword('');
        setBanReason('');
        setBanPreset(null);
        setResetResultPassword(null);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            // Change role
            if (newRoleId !== selectedUser.roleId) {
                await axiosClient.put(UrlPP.Admin.ChangeRole(selectedUser.id), { roleId: newRoleId });
            }
            // Reset password (if manual password provided)
            if (newPassword.trim().length >= 6) {
                await axiosClient.post(UrlPP.Admin.ResetPassword(selectedUser.id), { newPassword });
            }
            // Ban
            if (banPreset !== null) {
                const until = banPreset.hours
                    ? new Date(Date.now() + banPreset.hours * 3600000).toISOString()
                    : null;
                await axiosClient.put(UrlPP.Admin.BanUser(selectedUser.id), {
                    banUntil: until,
                    reason: banReason
                });
                enqueueSnackbar('User banned', { variant: 'warning' });
            }
            enqueueSnackbar('User updated successfully', { variant: 'success' });
            setDialogOpen(false);
            fetchUsers();
        } catch (err) {
            enqueueSnackbar(err.response?.data || 'Operation failed', { variant: 'error' });
        }
    };

    const handleAutoResetPassword = async () => {
        try {
            const res = await axiosClient.post(UrlPP.Admin.ResetPassword(selectedUser.id), { newPassword: null });
            setResetResultPassword(res.data.newPassword);
            enqueueSnackbar('New password generated!', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(err.response?.data || 'Reset failed', { variant: 'error' });
        }
    };

    const handleToggleStatus = async () => {
        const newActive = !selectedUser.isActive;
        try {
            await axiosClient.put(UrlPP.Admin.ChangeStatus(selectedUser.id), {
                isActive: newActive,
                reason: `Administrator manually ${newActive ? 'enabled' : 'disabled'} the account.`
            });
            enqueueSnackbar(`Account ${newActive ? 'enabled' : 'disabled'}`, { variant: 'info' });
            setDialogOpen(false);
            fetchUsers();
        } catch (err) {
            enqueueSnackbar(err.response?.data || 'Status update failed', { variant: 'error' });
        }
        setActionAnchorEl(null);
    };

    const handleUnban = async (userId) => {
        try {
            await axiosClient.put(UrlPP.Admin.UnbanUser(userId));
            enqueueSnackbar('User unbanned', { variant: 'success' });
            fetchUsers();
        } catch { enqueueSnackbar('Unban failed', { variant: 'error' }); }
    };

    const filtered = users.filter(u =>
        u.remoteUser?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 2 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminIcon color="primary" /> Admin Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{total} total users</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ShieldIcon />}
                    onClick={() => navigate('/admin/roles')}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    Manage Roles & Permissions
                </Button>
            </Box>

            {/* Search */}
            <TextField
                fullWidth
                size="small"
                placeholder="Search by username, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2, maxWidth: 400 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            {['#', 'User', 'Email', 'Role', 'Linked', 'Status', 'Joined', 'Actions'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: 0.5 }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((user, idx) => (
                            <TableRow key={user.id} hover sx={{ opacity: user.isBanned ? 0.6 : 1 }}>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{idx + 1}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar src={getAvatarUrl(user.avatarUrl)} sx={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                                            {user.displayName?.[0] || user.remoteUser?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="700">{user.displayName || user.remoteUser}</Typography>
                                            <Typography variant="caption" color="text.secondary">@{user.remoteUser}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell><Typography variant="caption">{user.email || '—'}</Typography></TableCell>
                                <TableCell>
                                    <Chip label={user.roleName} size="small" color={user.roleName === 'Admin' ? 'error' : user.roleName === 'Moderator' ? 'warning' : 'default'} />
                                </TableCell>
                                <TableCell>
                                    {user.isGoogleLinked ? <Chip label="Google" size="small" color="info" variant="outlined" /> : '—'}
                                </TableCell>
                                <TableCell>
                                    {!user.isActive
                                        ? <Chip label="Disabled" size="small" color="default" variant="outlined" />
                                        : user.isBanned
                                            ? <Chip label="Banned" size="small" color="error" />
                                            : <Chip label="Active" size="small" color="success" variant="outlined" />}
                                </TableCell>
                                <TableCell><Typography variant="caption">{new Date(user.createdAt).toLocaleDateString()}</Typography></TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {canEdit && (
                                            <Tooltip title="Manage">
                                                <IconButton size="small" onClick={() => openManage(user)}>
                                                    <ManageIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {canEdit && user.isBanned && (
                                            <Tooltip title="Unban">
                                                <IconButton size="small" color="success" onClick={() => handleUnban(user.id)}>
                                                    <UnbanIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Manage Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle fontWeight="800">
                    Manage: {selectedUser?.displayName || selectedUser?.remoteUser}
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        {/* Profile Header (Read-only) */}
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                                src={getAvatarUrl(selectedUser?.avatarUrl)} 
                                sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'primary.main' }}
                            >
                                {selectedUser?.displayName?.[0] || selectedUser?.remoteUser?.[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="900">{selectedUser?.displayName || selectedUser?.remoteUser}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedUser?.email || 'No email provided'}</Typography>
                                <Typography variant="caption" color="primary.main" fontWeight="700">@{selectedUser?.remoteUser}</Typography>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Role Change */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="700" gutterBottom>Change Role</Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel>Role</InputLabel>
                                <Select value={newRoleId} label="Role" onChange={(e) => setNewRoleId(e.target.value)}>
                                    {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Reset Password */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="700" gutterBottom>Reset Password</Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <TextField
                                    fullWidth size="small" label="New Password"
                                    type="text" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter manual password..."
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleAutoResetPassword}
                                    sx={{ whiteSpace: 'nowrap', borderRadius: 2 }}
                                >
                                    Generate
                                </Button>
                            </Stack>
                            {resetResultPassword && (
                                <Alert icon={<KeyIcon />} severity="success" sx={{ borderRadius: 2, mb: 1 }}>
                                    <Typography variant="body2" fontWeight="700">Generated Password:</Typography>
                                    <Typography variant="h6" sx={{ letterSpacing: 2, fontFamily: 'monospace' }}>{resetResultPassword}</Typography>
                                    <Typography variant="caption">Copy this and send to the user. It won't be shown again.</Typography>
                                </Alert>
                            )}
                            <Typography variant="caption" color="text.secondary">Use the manual field or click Generate.</Typography>
                        </Box>

                        {/* Ban */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="700" gutterBottom>Ban User</Typography>
                            <TextField
                                fullWidth size="small" label="Ban Reason"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Why are you banning this user?"
                                sx={{ mb: 1 }}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {BAN_PRESETS.map(p => (
                                    <Chip
                                        key={p.label}
                                        label={p.label}
                                        onClick={() => setBanPreset(banPreset?.label === p.label ? null : p)}
                                        color={banPreset?.label === p.label ? 'error' : 'default'}
                                        variant={banPreset?.label === p.label ? 'filled' : 'outlined'}
                                        size="small"
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                            {banPreset && (
                                <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                                    User will be banned {banPreset.hours ? `for ${banPreset.label}` : 'permanently'}.
                                </Alert>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Box>
                        <Button
                            startIcon={<MoreVertIcon />}
                            onClick={(e) => setActionAnchorEl(e.currentTarget)}
                            sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary' }}
                        >
                            Actions
                        </Button>
                        <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl)}
                            onClose={() => setActionAnchorEl(null)}
                            PaperProps={{ sx: { borderRadius: 2, minWidth: 150 } }}
                        >
                            <MuiMenuItem onClick={handleToggleStatus}>
                                {selectedUser?.isActive ? (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'error.main' }}>
                                        <DisableIcon fontSize="small" />
                                        <Typography variant="body2">Disable Account</Typography>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.main' }}>
                                        <EnableIcon fontSize="small" />
                                        <Typography variant="body2">Enable Account</Typography>
                                    </Stack>
                                )}
                            </MuiMenuItem>
                        </Menu>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                            Save Changes
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
