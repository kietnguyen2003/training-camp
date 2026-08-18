const HOST_ACCESS_CODE = '7303';
const VIEWER_ACCESS_CODE = '1234';
const ACCESS_ROLE_SESSION_KEY = 'teamflow-access-role';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type AccessRole = 'host' | 'viewer';

export function getAccessRoleFromCode(input: string): AccessRole | null {
  const normalizedInput = input.trim();

  if (normalizedInput === HOST_ACCESS_CODE) {
    return 'host';
  }

  if (normalizedInput === VIEWER_ACCESS_CODE) {
    return 'viewer';
  }

  return null;
}

export function getStoredAccessRole(storage: StorageLike = sessionStorage): AccessRole | null {
  const storedRole = storage.getItem(ACCESS_ROLE_SESSION_KEY);

  if (storedRole === 'host' || storedRole === 'viewer') {
    return storedRole;
  }

  return null;
}

export function persistAccessRole(
  role: AccessRole,
  storage: StorageLike = sessionStorage
): void {
  storage.setItem(ACCESS_ROLE_SESSION_KEY, role);
}

export function clearAccessRole(storage: StorageLike = sessionStorage): void {
  storage.removeItem(ACCESS_ROLE_SESSION_KEY);
}
