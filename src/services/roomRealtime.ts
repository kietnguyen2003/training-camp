export interface RoomRealtimeBinding {
  event: '*';
  schema: 'public';
  table: 'participants' | 'levels' | 'teams' | 'team_notes';
  filter: string;
}

export function getRoomRealtimeBindings(roomId: string): RoomRealtimeBinding[] {
  return [
    {
      event: '*',
      schema: 'public',
      table: 'participants',
      filter: `room_id=eq.${roomId}`,
    },
    {
      event: '*',
      schema: 'public',
      table: 'team_notes',
      filter: `room_id=eq.${roomId}`,
    },
    {
      event: '*',
      schema: 'public',
      table: 'teams',
      filter: `room_id=eq.${roomId}`,
    },
    {
      event: '*',
      schema: 'public',
      table: 'levels',
      filter: `room_id=eq.${roomId}`,
    },
  ];
}
