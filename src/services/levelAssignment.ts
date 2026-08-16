import type { Participant, Team } from '../types';

export interface ParticipantTeamAssignment {
  id: string;
  teamId: string | null;
}

export function assignPresentParticipantsToTeams(
  participants: Participant[],
  teams: Team[]
): ParticipantTeamAssignment[] {
  const teamIndexById = new Map(teams.map((team, index) => [team.id, index]));
  const currentLoads = new Map<string, number>(
    teams.map((team) => [
      team.id,
      participants.filter(
        (participant) => participant.status === 'present' && participant.teamId === team.id
      ).length,
    ])
  );

  const pendingAssignments = participants
    .filter((participant) => participant.status === 'present' && participant.teamId === null)
    .sort((left, right) => left.level - right.level);

  const updates: ParticipantTeamAssignment[] = [];

  for (const participant of pendingAssignments) {
    const eligibleTeams = getEligibleTeams(participant.level, teams);
    if (eligibleTeams.length === 0) continue;

    const targetTeam = eligibleTeams.reduce((best, candidate) => {
      if (!best) return candidate;

      const bestLoad = currentLoads.get(best.id) ?? 0;
      const candidateLoad = currentLoads.get(candidate.id) ?? 0;

      if (candidateLoad !== bestLoad) {
        return candidateLoad < bestLoad ? candidate : best;
      }

      const bestIndex = teamIndexById.get(best.id) ?? -1;
      const candidateIndex = teamIndexById.get(candidate.id) ?? -1;
      const bestIsExact = bestIndex === participant.level;
      const candidateIsExact = candidateIndex === participant.level;

      if (candidateIsExact !== bestIsExact) {
        return candidateIsExact ? candidate : best;
      }

      return candidateIndex > bestIndex ? candidate : best;
    }, eligibleTeams[0] as Team);

    updates.push({
      id: participant.id,
      teamId: targetTeam.id,
    });

    currentLoads.set(targetTeam.id, (currentLoads.get(targetTeam.id) ?? 0) + 1);
  }

  return updates;
}

function getEligibleTeams(level: number, teams: Team[]): Team[] {
  return teams.filter((_, index) => index === level || (level > 0 && index === level - 1));
}
