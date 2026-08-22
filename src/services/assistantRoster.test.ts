import test from 'node:test';
import assert from 'node:assert/strict';

import { getAssistantParticipants } from './assistantRoster';
import type { Participant } from '../types';

test('returns only participants that have the assistant role in the active room', () => {
  const assistants = getAssistantParticipants('room-1', participants, [
    { roomId: 'room-1', participantId: 'p-1', role: 'assistant' },
    { roomId: 'room-1', participantId: 'p-2', role: 'viewer' },
    { roomId: 'room-2', participantId: 'p-3', role: 'assistant' },
  ]);

  assert.deepEqual(assistants.map((participant) => participant.id), ['p-1']);
});

const participants: Participant[] = [
  { id: 'p-1', name: 'An', teamId: null, level: 0, status: 'present' },
  { id: 'p-2', name: 'Bình', teamId: null, level: 0, status: 'present' },
  { id: 'p-3', name: 'Chi', teamId: null, level: 0, status: 'present' },
];
