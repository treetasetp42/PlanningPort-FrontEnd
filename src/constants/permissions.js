// Single source of truth for all permission keys on the frontend.
// These must match the keys defined in the backend PermissionSeeder.

export const PERMISSIONS = {
    // Admin Module
    ADMIN_ACCESS:       'ADMIN_ACCESS',
    ADMIN_USERS_VIEW:   'ADMIN_USERS_VIEW',
    ADMIN_USERS_EDIT:   'ADMIN_USERS_EDIT',
    ADMIN_ROLES_VIEW:   'ADMIN_ROLES_VIEW',
    ADMIN_ROLES_MANAGE: 'ADMIN_ROLES_MANAGE',

    // Portfolio Module
    PORTFOLIO_VIEW:     'PORTFOLIO_VIEW',
    PORTFOLIO_CREATE:   'PORTFOLIO_CREATE',
    PORTFOLIO_DELETE:   'PORTFOLIO_DELETE',

    // Market Module
    MARKET_VIEW:        'MARKET_VIEW',
    MARKET_TRADE:       'MARKET_TRADE',
};
