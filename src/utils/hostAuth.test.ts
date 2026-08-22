import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clearAccessRole,
  getAccessRoleFromCode,
  getStoredAccessRole,
  normalizeStudentCode,
  persistAccessRole,
} from './hostAuth';

test('maps only the host code and rejects the retired shared viewer code', () => {
  assert.equal(getAccessRoleFromCode('7303'), 'host');
  assert.equal(getAccessRoleFromCode(' 7303 '), 'host');
  assert.equal(getAccessRoleFromCode('1234'), null);
  assert.equal(getAccessRoleFromCode(''), null);
});

test('normalizes valid student codes and rejects invalid formats', () => {
  assert.equal(normalizeStudentCode(' sv01 '), 'SV01');
  assert.equal(normalizeStudentCode('CT-2026_01'), 'CT-2026_01');
  assert.equal(normalizeStudentCode(''), null);
  assert.equal(normalizeStudentCode('SV 01'), null);
});

test('persists and clears the local access role', () => {
  const storage = createStorageMock();

  assert.equal(getStoredAccessRole(storage), null);

  persistAccessRole('viewer', storage);
  assert.equal(getStoredAccessRole(storage), 'viewer');

  persistAccessRole('host', storage);
  assert.equal(getStoredAccessRole(storage), 'host');

  clearAccessRole(storage);
  assert.equal(getStoredAccessRole(storage), null);
});

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}
