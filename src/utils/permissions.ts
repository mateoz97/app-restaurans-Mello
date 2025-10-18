import { UserRole, Permission } from '../types';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_orders',
    'create_order',
    'edit_order',
    'delete_order',
    'view_inventory',
    'edit_inventory',
    'manage_users',
    'view_reports',
    'view_revenue'  // Solo admin puede ver ingresos
  ],
  manager: [
    'view_dashboard',
    'view_orders',
    'create_order',
    'edit_order',
    'delete_order',
    'view_inventory',
    'edit_inventory',
    'view_reports',
    'view_revenue'  // Manager también puede ver ingresos
  ],
  waiter: [
    'view_dashboard',
    'view_orders',
    'create_order',
    'edit_order',
    'view_inventory'
    // NO tiene view_revenue
  ],
  chef: [
    'view_dashboard',
    'view_orders',
    'edit_order',
    'view_inventory'
    // NO tiene view_revenue
  ]
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};
