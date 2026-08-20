import type { Team } from '../types';

interface PersistedTeamNote {
  teamId: string;
  content?: string | null;
}

export function applyPersistedTeamNotes(
  teams: Team[],
  persistedNotes: PersistedTeamNote[]
): Team[] {
  const notesByTeamId = new Map(
    persistedNotes.map((teamRecord) => [teamRecord.teamId, normalizeOptionalNote(teamRecord.content)])
  );

  return teams.map((team) => {
    const persistedNote = notesByTeamId.get(team.id);
    return persistedNote === undefined ? team : { ...team, note: persistedNote ?? undefined };
  });
}

export function normalizeTeamNoteDraft(note: string): string | null {
  return normalizeOptionalNote(note);
}

function normalizeOptionalNote(note: string | null | undefined): string | null {
  const normalizedNote = note?.trim() ?? '';
  return normalizedNote.length > 0 ? normalizedNote : null;
}
