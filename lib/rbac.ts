export type Role = 'ADMIN' | 'OPERATOR' | 'USER';

export const ROLES = {
    ADMIN: 'ADMIN' as Role,
    OPERATOR: 'OPERATOR' as Role,
    USER: 'USER' as Role,
};

export const PERMISSIONS = {
    // Users
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users', // Edit, Delete, change balance

    // Games
    VIEW_GAMES: 'view_games',
    MANAGE_GAMES: 'manage_games', // Create, Edit, Delete Games

    // Tournaments (Templates)
    VIEW_TOURNAMENTS: 'view_tournaments',
    MANAGE_TOURNAMENTS: 'manage_tournaments', // Create, Edit, Delete, Activate Templates

    // Transactions / Deposits
    VIEW_TRANSACTIONS: 'view_transactions',
    APPROVE_DEPOSITS: 'approve_deposits',
    DELETE_TRANSACTIONS: 'delete_transactions',

    // System
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_SETTINGS: 'manage_settings',
    SEND_ANNOUNCEMENTS: 'send_announcements',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: Object.values(PERMISSIONS),
    OPERATOR: [
        // PERMISSIONS.VIEW_USERS, // Restricted: Operators cannot manage or view user list
        PERMISSIONS.VIEW_GAMES,
        PERMISSIONS.VIEW_TOURNAMENTS, // Operators can view templates
        PERMISSIONS.VIEW_TRANSACTIONS,
        PERMISSIONS.APPROVE_DEPOSITS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.SEND_ANNOUNCEMENTS,
    ],
    USER: [], // Regular users don't access admin panel usually
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}

export function getRoleFromUser(user: any): Role {
    if (user?.role) return user.role;
    return ROLES.USER;
}
