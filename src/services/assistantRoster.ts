import type { Participant, ParticipantRoleRecord } from '../types';

export function getAssistantParticipants(
  roomId: string,
  participants: Participant[],
  roleRecords: ParticipantRoleRecord[]
): Participant[] {
  const assistantIds = new Set(
    roleRecords
      .filter((record) => record.roomId === roomId && record.role === 'assistant')
      .map((record) => record.participantId)
  );

  return participants.filter((participant) => assistantIds.has(participant.id));
}
