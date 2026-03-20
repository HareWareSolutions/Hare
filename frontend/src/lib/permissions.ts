import { useAuthStore } from './store';

export function useHasPermission() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;

    if (!user.roles) return false;

    // Check if any role has the required permission or global wildcard
    return user.roles.some(role => {
      if (role.permissions.includes('*')) return true;
      if (role.permissions.includes(requiredPermission)) return true;
      
      // Handle prefix wildcards like "finance.*"
      const [namespace] = requiredPermission.split('.');
      if (role.permissions.includes(`${namespace}.*`)) return true;
      
      return false;
    });
  };

  return { hasPermission };
}
