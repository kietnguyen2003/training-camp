import assert from 'node:assert/strict';
import test from 'node:test';
import type { Participant } from '../types';
import { clearParticipantTeamAssignments } from './teamReset';

const participants: Participant[] = [
  {
    id: 'participant-1',
    name: 'Hieu',
    teamId: 'team-1',
    level: 1,
    status: 'present',
    note: '',
    updatedAt: 1,
  },
  {
    id: 'participant-2',
    name: 'Tram',
    teamId: 'team-2',
    level: 2,
    status: 'present',
    note: '',
    updatedAt: 1,
  },
];

test('clears participant team assignments without mutating the roster', () => {
  const resetParticipants = clearParticipantTeamAssignments(participants, 123);

  assert.deepEqual(
    resetParticipants.map(({ id, teamId, updatedAt }) => ({ id, teamId, updatedAt })),
    [
      { id: 'participant-1', teamId: null, updatedAt: 123 },
      { id: 'participant-2', teamId: null, updatedAt: 123 },
    ],
  );
  assert.equal(participants[0].teamId, 'team-1');
  assert.equal(participants[1].teamId, 'team-2');
});
