const HOST_ACCESS_CODE = '7303';
const ACCESS_ROLE_SESSION_KEY = 'teamflow-access-role';
const STUDENT_CODE_PATTERN = /^[A-Z0-9_-]{2,32}$/;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type AccessRole = 'host' | 'viewer';

export function getAccessRoleFromCode(input: string): AccessRole | null {
  const normalizedInput = input.trim();

  if (normalizedInput === HOST_ACCESS_CODE) {
    return 'host';
  }

  return null;
}

export function normalizeStudentCode(input: string): string | null {
  const normalizedInput = input.trim().toUpperCase();
  return STUDENT_CODE_PATTERN.test(normalizedInput) ? normalizedInput : null;
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
