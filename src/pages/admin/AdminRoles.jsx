import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Grid, Switch, FormControlLabel,
    Divider, Button, Chip, CircularProgress, Accordion, AccordionSummary,
    AccordionDetails, Stack, Alert
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Shield as ShieldIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axiosClient from '../../api/axiosClient';
import UrlPP from '../../api/UrlPP';
import usePermission from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

// Group permissions by module for display
const groupByModule = (permissions) => {
    return permissions.reduce((acc, p) => {
        if (!acc[p.module]) acc[p.module] = [];
        acc[p.module].push(p);
        return acc;
    }, {});
};

export default function AdminRoles() {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [enabledKeys, setEnabledKeys] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const canManage = usePermission(PERMISSIONS.ADMIN_ROLES_MANAGE);

    const fetchData = async () => {
        try {
            const res = await axiosClient.get(UrlPP.Admin.Roles);
            setRoles(res.data.roles);
            setAllPermissions(res.data.allPermissions);
            if (res.data.roles.length > 0 && !selectedRole) {
                selectRole(res.data.roles[0]);
            }
        } catch { enqueueSnackbar('Failed to load roles', { variant: 'error' }); }
    };

    useEffect(() => { fetchData(); }, []);

    const selectRole = (role) => {
        setSelectedRole(role);
        setEnabledKeys(new Set(role.permissions));
    };

    const togglePermission = (key) => {
        setEnabledKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            await axiosClient.put(UrlPP.Admin.UpdateRolePermissions(selectedRole.id), {
                permissionKeys: [...enabledKeys]
            });
            enqueueSnackbar(`Permissions saved for "${selectedRole.name}"`, { variant: 'success' });
            fetchData();
        } catch (err) {
            enqueueSnackbar(err.response?.data || 'Save failed', { variant: 'error' });
        } finally { setSaving(false); }
    };

    const grouped = groupByModule(allPermissions);

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 2 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldIcon color="primary" /> Roles & Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Select a role to configure its permissions. Changes take effect on next user login.
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Permission changes are <strong>session-baked</strong> — users must log out and back in to receive updated permissions.
            </Alert>

            <Grid container spacing={3}>
                {/* Role List */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                            <Typography variant="subtitle2" fontWeight="800">Roles</Typography>
                        </Box>
                        <Stack divider={<Divider />}>
                            {roles.map(role => (
                                <Box
                                    key={role.id}
                                    onClick={() => selectRole(role)}
                                    sx={{
                                        p: 2, cursor: 'pointer',
                                        bgcolor: selectedRole?.id === role.id ? 'primary.main' : 'transparent',
                                        color: selectedRole?.id === role.id ? 'primary.contrastText' : 'text.primary',
                                        '&:hover': { bgcolor: selectedRole?.id === role.id ? 'primary.dark' : 'action.hover' },
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <Typography variant="subtitle2" fontWeight="800">{role.name}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {role.permissions.length} permissions
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Permission Toggles */}
                <Grid item xs={12} md={9}>
                    {selectedRole ? (
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="800">{selectedRole.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{selectedRole.description}</Typography>
                                </Box>
                                {canManage && (
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={saving}
                                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                                    >
                                        {saving ? <CircularProgress size={18} /> : 'Save Changes'}
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ p: 2 }}>
                                {Object.entries(grouped).map(([module, perms]) => (
                                    <Accordion key={module} defaultExpanded elevation={0}
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography fontWeight="800">{module}</Typography>
                                                <Chip
                                                    size="small"
                                                    label={`${perms.filter(p => enabledKeys.has(p.key)).length}/${perms.length}`}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Stack spacing={1}>
                                                {perms.map(p => (
                                                    <Box key={p.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700">{p.description}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                                {p.key}
                                                            </Typography>
                                                        </Box>
                                                        <Switch
                                                            checked={enabledKeys.has(p.key)}
                                                            onChange={() => canManage && togglePermission(p.key)}
                                                            disabled={!canManage}
                                                            color="primary"
                                                        />
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </Paper>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                            <Typography color="text.secondary">Select a role to manage permissions</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}
