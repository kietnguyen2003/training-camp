import type {
  Participant,
  Team,
  TeamHistoryMember,
  TeamHistorySnapshotData,
  TeamHistoryTeam,
} from '../types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createTeamHistorySnapshot(
  historyDate: string,
  teams: Team[],
  participants: Participant[]
): TeamHistorySnapshotData {
  if (!DATE_PATTERN.test(historyDate)) {
    throw new Error('Ngày lịch sử phải có định dạng YYYY-MM-DD.');
  }

  const membersByTeam = new Map<string, TeamHistoryMember[]>();
  const unassignedMembers: TeamHistoryMember[] = [];

  for (const participant of participants) {
    const member = toHistoryMember(participant);

    if (participant.teamId) {
      const members = membersByTeam.get(participant.teamId) ?? [];
      members.push(member);
      membersByTeam.set(participant.teamId, members);
    } else {
      unassignedMembers.push(member);
    }
  }

  const snapshotTeams: TeamHistoryTeam[] = teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    note: team.note?.trim() || null,
    ...(team.assistant ? {
      assistant: {
        participantId: team.assistant.participantId,
        name: team.assistant.name,
        ...(team.assistant.avatar ? { avatar: team.assistant.avatar } : {}),
      },
    } : {}),
    members: membersByTeam.get(team.id) ?? [],
  }));

  return { historyDate, teams: snapshotTeams, unassignedMembers };
}

function toHistoryMember(participant: Participant): TeamHistoryMember {
  return {
    participantId: participant.id,
    name: participant.name,
    status: participant.status,
    level: participant.level,
  };
}
