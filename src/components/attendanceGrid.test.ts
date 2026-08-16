import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAttendanceGridRows } from './attendanceGrid';
import type { Participant } from '../types';

test('builds attendance rows with two participants per row', () => {
  const participants = [
    createParticipant('p-1'),
    createParticipant('p-2'),
    createParticipant('p-3'),
    createParticipant('p-4'),
    createParticipant('p-5'),
  ];

  assert.deepEqual(buildAttendanceGridRows(participants).map((row) => row.map((item) => item?.id ?? null)), [
    ['p-1', 'p-2'],
    ['p-3', 'p-4'],
    ['p-5', null],
  ]);
});

function createParticipant(id: string): Participant {
  return {
    id,
    name: id,
    teamId: null,
    level: 0,
    status: 'present',
  };
}
