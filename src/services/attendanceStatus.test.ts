import test from 'node:test';
import assert from 'node:assert/strict';

import { getTapToggleStatus, getStatusLabel } from './attendanceStatus';

test('tap toggles only between present and absent, and restores retired to present', () => {
  assert.equal(getTapToggleStatus('present'), 'absent');
  assert.equal(getTapToggleStatus('absent'), 'present');
  assert.equal(getTapToggleStatus('retired'), 'present');
});

test('returns labels for all attendance statuses', () => {
  assert.equal(getStatusLabel('present'), 'CO MAT');
  assert.equal(getStatusLabel('absent'), 'VANG MAT');
  assert.equal(getStatusLabel('retired'), 'DA NGHI');
});
