import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clearHostSession,
  getStoredHostSession,
  isValidHostCode,
  persistHostSession,
} from './hostAuth';

test('accepts the configured host code and rejects invalid codes', () => {
  assert.equal(isValidHostCode('7303'), true);
  assert.equal(isValidHostCode(' 7303 '), true);
  assert.equal(isValidHostCode('1234'), false);
  assert.equal(isValidHostCode(''), false);
});

test('persists and clears the local host session', () => {
  const storage = createStorageMock();

  assert.equal(getStoredHostSession(storage), false);

  persistHostSession(storage);
  assert.equal(getStoredHostSession(storage), true);

  clearHostSession(storage);
  assert.equal(getStoredHostSession(storage), false);
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
