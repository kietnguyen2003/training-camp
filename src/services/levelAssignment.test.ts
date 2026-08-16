import test from 'node:test';
import assert from 'node:assert/strict';

import { assignPresentParticipantsToTeams } from './levelAssignment';
import type { Participant, Team } from '../types';

const teams = [0, 1, 2, 3].map((level) => createTeam(level));

test('assigns level 0 participants only to the matching court', () => {
  const participants: Participant[] = [
    createParticipant({ id: 'p-1', level: 0, teamId: null, status: 'present' }),
  ];

  assert.deepEqual(assignPresentParticipantsToTeams(participants, teams), [
    { id: 'p-1', teamId: 'team-1' },
  ]);
});

test('allows higher levels to learn down one level when balancing courts', () => {
  const participants: Participant[] = [
    createParticipant({ id: 'existing-l3', level: 3, teamId: 'team-4', status: 'present' }),
    createParticipant({ id: 'incoming-l3', level: 3, teamId: null, status: 'present' }),
  ];

  assert.deepEqual(assignPresentParticipantsToTeams(participants, teams), [
    { id: 'incoming-l3', teamId: 'team-3' },
  ]);
});

test('never assigns a participant to a court above their level', () => {
  const participants: Participant[] = [
    createParticipant({ id: 'existing-l1-a', level: 1, teamId: 'team-2', status: 'present' }),
    createParticipant({ id: 'existing-l1-b', level: 1, teamId: 'team-2', status: 'present' }),
    createParticipant({ id: 'incoming-l0', level: 0, teamId: null, status: 'present' }),
  ];

  assert.deepEqual(assignPresentParticipantsToTeams(participants, teams), [
    { id: 'incoming-l0', teamId: 'team-1' },
  ]);
});

test('ignores absent or already assigned participants when generating updates', () => {
  const participants: Participant[] = [
    createParticipant({ id: 'present-assigned', level: 2, teamId: 'team-3', status: 'present' }),
    createParticipant({ id: 'absent-unassigned', level: 2, teamId: null, status: 'absent' }),
    createParticipant({ id: 'present-unassigned', level: 2, teamId: null, status: 'present' }),
  ];

  assert.deepEqual(assignPresentParticipantsToTeams(participants, teams), [
    { id: 'present-unassigned', teamId: 'team-2' },
  ]);
});

function createTeam(level: number): Team {
  return {
    id: `team-${level + 1}`,
    number: level + 1,
    name: `Level ${level}`,
    lead: {
      id: `lead-${level + 1}`,
      name: `Coach ${level + 1}`,
    },
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

function createParticipant(overrides: Partial<Participant> & Pick<Participant, 'id'>): Participant {
  return {
    id: overrides.id,
    name: overrides.id,
    teamId: overrides.teamId ?? null,
    level: overrides.level ?? 0,
    status: overrides.status ?? 'present',
    studentCode: overrides.studentCode,
    note: overrides.note,
    avatar: overrides.avatar,
    updatedAt: overrides.updatedAt,
  };
}
