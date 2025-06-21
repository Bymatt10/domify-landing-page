export type UserRole = 'customer' | 'provider' | 'admin';

export interface Permission {
  name: string;
  description: string;
  roles: UserRole[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
}

// Definir todos los permisos disponibles
export const PERMISSIONS: Permission[] = [
  // Customer permissions
  { name: 'read_own_profile', description: 'Read own customer profile', roles: ['customer', 'provider', 'admin'] },
  { name: 'update_own_profile', description: 'Update own customer profile', roles: ['customer', 'provider', 'admin'] },
  { name: 'create_bookings', description: 'Create service bookings', roles: ['customer', 'admin'] },
  { name: 'view_own_bookings', description: 'View own bookings', roles: ['customer', 'admin'] },
  { name: 'create_reviews', description: 'Create reviews for providers', roles: ['customer', 'admin'] },
  { name: 'manage_favorites', description: 'Manage favorite providers', roles: ['customer', 'admin'] },

  // Provider permissions
  { name: 'create_provider_profile', description: 'Create provider profile', roles: ['provider', 'admin'] },
  { name: 'update_provider_profile', description: 'Update provider profile', roles: ['provider', 'admin'] },
  { name: 'create_services', description: 'Create services', roles: ['provider', 'admin'] },
  { name: 'manage_own_services', description: 'Manage own services', roles: ['provider', 'admin'] },
  { name: 'view_provider_bookings', description: 'View bookings for own services', roles: ['provider', 'admin'] },
  { name: 'manage_provider_bookings', description: 'Manage bookings for own services', roles: ['provider', 'admin'] },
  { name: 'view_provider_reviews', description: 'View reviews for own services', roles: ['provider', 'admin'] },

  // Admin permissions
  { name: 'read_all_users', description: 'Read all user profiles', roles: ['admin'] },
  { name: 'update_all_users', description: 'Update any user profile', roles: ['admin'] },
  { name: 'delete_users', description: 'Delete users', roles: ['admin'] },
  { name: 'manage_categories', description: 'Manage service categories', roles: ['admin'] },
  { name: 'manage_applications', description: 'Manage provider applications', roles: ['admin'] },
  { name: 'view_analytics', description: 'View platform analytics', roles: ['admin'] },
  { name: 'manage_platform_settings', description: 'Manage platform settings', roles: ['admin'] },
  { name: 'moderate_reviews', description: 'Moderate reviews', roles: ['admin'] },
  { name: 'handle_disputes', description: 'Handle booking disputes', roles: ['admin'] },
];

// Función para obtener permisos por rol
export function getPermissionsForRole(role: UserRole): string[] {
  return PERMISSIONS
    .filter(permission => permission.roles.includes(role))
    .map(permission => permission.name);
}

// Función para verificar si un rol tiene un permiso específico
export function hasPermission(role: UserRole, permission: string): boolean {
  return getPermissionsForRole(role).includes(permission);
}

// Función para obtener todos los roles que tienen un permiso específico
export function getRolesWithPermission(permission: string): UserRole[] {
  return PERMISSIONS
    .find(p => p.name === permission)?.roles || [];
}

// Función para validar si un usuario puede acceder a un endpoint
export function canAccessEndpoint(userRole: UserRole, requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
} 