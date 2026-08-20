import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPersistedTeamNotes, normalizeTeamNoteDraft } from './teamNotes';
import type { Team } from '../types';

const teams: Team[] = [0, 1, 2, 3].map((level) => createTeam(level));

test('applies persisted note content onto matching teams', () => {
  const hydratedTeams = applyPersistedTeamNotes(teams, [
    { teamId: 'team-1', content: 'San 1 uu tien khoi dong' },
    { teamId: 'team-3', content: 'Tap trung footwork' },
  ]);

  assert.equal(hydratedTeams[0]?.note, 'San 1 uu tien khoi dong');
  assert.equal(hydratedTeams[1]?.note, undefined);
  assert.equal(hydratedTeams[2]?.note, 'Tap trung footwork');
  assert.equal(hydratedTeams[3]?.note, undefined);
});

test('trims a draft note and clears blank content before save', () => {
  assert.equal(normalizeTeamNoteDraft('  Ghi chu san 2  '), 'Ghi chu san 2');
  assert.equal(normalizeTeamNoteDraft('   \n  '), null);
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
