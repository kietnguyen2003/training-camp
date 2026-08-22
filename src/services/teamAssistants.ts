import type { Participant, Team } from '../types';

export function assignAssistantToTeam(
  teams: Team[],
  teamId: string,
  participant: Participant | null
): Team[] {
  return teams.map((team) => {
    if (team.id !== teamId) return team;

    if (!participant) {
      return { ...team, assistant: undefined };
    }

    return {
      ...team,
      assistant: {
        participantId: participant.id,
        name: participant.name,
        avatar: participant.avatar,
        studentCode: participant.studentCode,
      },
    };
  });
}
