import { supabase } from '../supabaseClient';
import type { TeamHistorySnapshot, TeamHistorySnapshotData } from '../types';

export async function fetchTeamHistorySnapshots(roomId: string): Promise<TeamHistorySnapshot[]> {
  const { data, error } = await supabase
    .from('team_history_snapshots')
    .select('*')
    .eq('room_id', roomId)
    .order('history_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((snapshot: any) => ({
    id: snapshot.id,
    roomId: snapshot.room_id,
    historyDate: snapshot.history_date,
    teams: snapshot.snapshot_data.teams ?? [],
    unassignedMembers: snapshot.snapshot_data.unassignedMembers ?? [],
    createdAt: snapshot.created_at,
    updatedAt: snapshot.updated_at,
  }));
}

export async function saveTeamHistorySnapshot(
  roomId: string,
  snapshot: TeamHistorySnapshotData
): Promise<TeamHistorySnapshot> {
  const { data, error } = await supabase
    .from('team_history_snapshots')
    .upsert(
      {
        room_id: roomId,
        history_date: snapshot.historyDate,
        snapshot_data: snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'room_id,history_date' }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    roomId: data.room_id,
    historyDate: data.history_date,
    teams: data.snapshot_data.teams ?? [],
    unassignedMembers: data.snapshot_data.unassignedMembers ?? [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
