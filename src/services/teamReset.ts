import type { Participant } from '../types';

export function clearParticipantTeamAssignments(
  participants: Participant[],
  updatedAt = Date.now(),
): Participant[] {
  return participants.map((participant) => ({
    ...participant,
    teamId: null,
    updatedAt,
  }));
}
