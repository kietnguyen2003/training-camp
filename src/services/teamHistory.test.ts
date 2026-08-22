import test from 'node:test';
import assert from 'node:assert/strict';

import { createTeamHistorySnapshot } from './teamHistorySnapshot';
import type { Participant, Team } from '../types';

test('creates an immutable daily snapshot grouped by team', () => {
  const snapshot = createTeamHistorySnapshot('2026-08-22', teams, participants);

  assert.deepEqual(snapshot, {
    historyDate: '2026-08-22',
    teams: [
      {
        teamId: 'team-1',
        teamName: 'Sân 1',
        note: 'Đánh đôi',
        members: [
          { participantId: 'p-1', name: 'An', status: 'present', level: 1 },
        ],
      },
      {
        teamId: 'team-2',
        teamName: 'Sân 2',
        note: null,
        members: [],
      },
    ],
    unassignedMembers: [
      { participantId: 'p-2', name: 'Bình', status: 'absent', level: 2 },
    ],
  });
});

test('rejects an invalid history date', () => {
  assert.throws(
    () => createTeamHistorySnapshot('22-08-2026', teams, participants),
    /YYYY-MM-DD/
  );
});

test('stores the assistant name in history without exposing their student code', () => {
  const teamsWithAssistant: Team[] = [
    { ...teams[0], assistant: { participantId: 'p-1', name: 'Coach An', studentCode: 'SV01' } },
  ];

  const snapshot = createTeamHistorySnapshot('2026-08-22', teamsWithAssistant, participants);

  assert.deepEqual(snapshot.teams[0].assistant, {
    participantId: 'p-1',
    name: 'Coach An',
  });
});

const teams: Team[] = [
  createTeam('team-1', 'Sân 1', 'Đánh đôi'),
  createTeam('team-2', 'Sân 2'),
];

const participants: Participant[] = [
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
];

function createTeam(id: string, name: string, note?: string): Team {
  return {
    id,
    number: 1,
    name,
    note,
    lead: { id: 'lead-1', name: 'Coach' },
    colorScheme: {
      id: 'test',
      name: 'test',
      headerBg: '',
      headerBorder: '',
      headerText: '',
      headerBadgeText: '',
      leadBannerBg: '',
      leadAvatarBg: '',
      leadAvatarText: '',
      badgeBg: '',
      badgeText: '',
      borderAccent: '',
      accentBg: '',
      avatarBg: '',
      avatarText: '',
      dotColor: '',
    },
  };
}
