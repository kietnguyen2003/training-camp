import type { Participant } from '../types';

export function buildAttendanceGridRows(participants: Participant[]): Array<[Participant | null, Participant | null]> {
  const rows: Array<[Participant | null, Participant | null]> = [];

  for (let index = 0; index < participants.length; index += 2) {
    rows.push([participants[index] ?? null, participants[index + 1] ?? null]);
  }

  return rows;
}
