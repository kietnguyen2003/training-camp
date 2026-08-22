import test from 'node:test';
import assert from 'node:assert/strict';

import { createHistoricalParticipants } from './teamHistoryView';
import type { TeamHistorySnapshot } from '../types';

test('reconstructs the saved courts and unassigned members as read-only participants', () => {
  assert.deepEqual(createHistoricalParticipants(snapshot), [
    {
      id: 'p-1',
      name: 'An',
      teamId: 'team-1',
      level: 1,
      status: 'present',
    },
    {
      id: 'p-2',
      name: 'Bình',
      teamId: null,
      level: 2,
      status: 'absent',
    },
  ]);
});

const snapshot: TeamHistorySnapshot = {
  id: 'history-1',
  roomId: 'room-1',
  historyDate: '2026-08-22',
  createdAt: '2026-08-22T10:00:00.000Z',
  updatedAt: '2026-08-22T10:00:00.000Z',
  teams: [
    {
      teamId: 'team-1',
      teamName: 'Sân 1',
      note: null,
      members: [{ participantId: 'p-1', name: 'An', status: 'present', level: 1 }],
    },
  ],
  unassignedMembers: [{ participantId: 'p-2', name: 'Bình', status: 'absent', level: 2 }],
};
