import type { Participant, TeamHistorySnapshot } from '../types';

export function createHistoricalParticipants(snapshot: TeamHistorySnapshot): Participant[] {
  const assignedParticipants = snapshot.teams.flatMap((team) =>
    team.members.map((member) => ({
      id: member.participantId,
      name: member.name,
      teamId: team.teamId,
      level: member.level,
      status: member.status,
    }))
  );

  const unassignedParticipants = snapshot.unassignedMembers.map((member) => ({
    id: member.participantId,
    name: member.name,
    teamId: null,
    level: member.level,
    status: member.status,
  }));

  return [...assignedParticipants, ...unassignedParticipants];
}
