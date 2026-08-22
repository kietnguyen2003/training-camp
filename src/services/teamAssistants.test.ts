import test from 'node:test';
import assert from 'node:assert/strict';

import { assignAssistantToTeam } from './teamAssistants';
import type { Participant, Team } from '../types';

test('assigns a participant as the assistant for one court without changing their court placement', () => {
  const updatedTeams = assignAssistantToTeam(teams, 'team-1', participants[0]);

  assert.deepEqual(updatedTeams[0].assistant, {
    participantId: 'p-1',
    name: 'An',
    avatar: undefined,
    studentCode: 'SV01',
  });
  assert.equal(participants[0].teamId, 'team-2');
});

test('clears the assistant for a court', () => {
  const assignedTeams = assignAssistantToTeam(teams, 'team-1', participants[0]);
  const clearedTeams = assignAssistantToTeam(assignedTeams, 'team-1', null);

  assert.equal(clearedTeams[0].assistant, undefined);
});

const teams: Team[] = [createTeam('team-1'), createTeam('team-2')];
const participants: Participant[] = [
  { id: 'p-1', name: 'An', studentCode: 'SV01', teamId: 'team-2', level: 1, status: 'present' },
];

function createTeam(id: string): Team {
  return {
    id,
    number: 1,
    name: id,
    lead: { id: 'lead-1', name: 'Coach' },
    colorScheme: {
      id: 'test', name: 'test', headerBg: '', headerBorder: '', headerText: '', headerBadgeText: '',
      leadBannerBg: '', leadAvatarBg: '', leadAvatarText: '', badgeBg: '', badgeText: '',
      borderAccent: '', accentBg: '', avatarBg: '', avatarText: '', dotColor: '',
    },
  };
}
