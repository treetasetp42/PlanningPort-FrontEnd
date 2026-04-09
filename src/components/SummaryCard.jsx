import { Paper, Box, Typography } from '@mui/material';

const SummaryCard = ({
    title,
    value,
    subtitle,
    subValue,
    subValueColor = 'text.secondary',
    actions,
    primary = false,
    isMobile = false,
    onClick = null,
    sx = {}
}) => {
    const hoverStyles = onClick ? {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            bgcolor: primary ? 'primary.dark' : 'action.selected',
            transform: isMobile ? 'none' : 'translateY(-2px)',
            boxShadow: 4
        }
    } : {};
    if (primary) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    width: '100%',
                    boxSizing: 'border-box',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: { xs: 2, md: 2 },
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ...hoverStyles,
                    ...sx
                }}
                onClick={onClick}
            >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, letterSpacing: 1, fontWeight: 700 }}>
                    {title}
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800">
                    {value}
                </Typography>
                {subtitle && (
                    <Box sx={{ mt: 2, display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.5, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 }}>
                        <Typography variant="caption" fontWeight="700">
                            {subtitle}
                        </Typography>
                    </Box>
                )}
            </Paper>
        );
    }

    return (
        <Paper sx={{
            p: 2,
            pb: 3,
            borderRadius: { xs: 2, md: 2 },
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
            ...hoverStyles,
            ...sx
        }}
            onClick={onClick}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 40 }}>
                        <Typography variant="button" color="text.primary" fontWeight="800">
                            {title}
                        </Typography>
                        {actions && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {actions}
                            </Box>
                        )}
                    </Box>
                    <Typography variant="h6" fontWeight="900" color={sx.color || 'inherit'}>
                        {value}
                    </Typography>
                </Box>

                {subtitle && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                            {subtitle}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            fontWeight="800"
                            sx={{ color: subValueColor }}
                        >
                            {subValue}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default SummaryCard;
