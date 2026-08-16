const HOST_ACCESS_CODE = '7303';
const HOST_SESSION_KEY = 'teamflow-host-session';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function isValidHostCode(input: string): boolean {
  return input.trim() === HOST_ACCESS_CODE;
}

export function getStoredHostSession(storage: StorageLike = sessionStorage): boolean {
  return storage.getItem(HOST_SESSION_KEY) === 'true';
}

export function persistHostSession(storage: StorageLike = sessionStorage): void {
  storage.setItem(HOST_SESSION_KEY, 'true');
}

export function clearHostSession(storage: StorageLike = sessionStorage): void {
  storage.removeItem(HOST_SESSION_KEY);
}
