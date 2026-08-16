import { supabase } from '../supabaseClient';
import { Participant, Room, Team, UserRole } from '../types';
import { INITIAL_ROOM, INITIAL_TEAMS, INITIAL_PARTICIPANTS } from '../mockData';
import { getRoomRealtimeBindings } from './roomRealtime';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
}

// ----------------------------------------------------
// User Profile & Role Services
// ----------------------------------------------------
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      role: data.role as UserRole,
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function upsertUserProfile(profile: UserProfile): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      role: data.role as UserRole,
    };
  } catch (err) {
    console.error('Error in upsertUserProfile:', err);
    return null;
  }
}

// ----------------------------------------------------
// Room, Team & Participant Data Seeding & Fetching
// ----------------------------------------------------
export async function fetchInitialRoomData(roomId: string = 'room-badminton-camp') {
  try {
    // 1. Fetch Room
    let roomWasCreated = false;
    let { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    if (!roomData) {
      const { data: newRoom } = await supabase
        .from('rooms')
        .insert({
          id: INITIAL_ROOM.id,
          code: INITIAL_ROOM.code,
          name: INITIAL_ROOM.name,
          activity: INITIAL_ROOM.activity,
        })
        .select()
        .single();
      roomData = newRoom || INITIAL_ROOM;
      roomWasCreated = true;
    }

    // 2. Fetch Teams
    let { data: teamsData } = await supabase.from('teams').select('*').eq('room_id', roomId).order('number');
    if (!teamsData || teamsData.length === 0) {
      const teamsToInsert = INITIAL_TEAMS.map((t) => ({
        id: t.id,
        room_id: roomId,
        number: t.number,
        name: t.name,
        lead_name: t.lead.name,
        lead_avatar: t.lead.avatar,
        color_scheme_id: t.colorScheme.id,
      }));
      await supabase.from('teams').insert(teamsToInsert);
      teamsData = teamsToInsert;
    }

    // 3. Fetch Participants
    let { data: participantsData } = await supabase.from('participants').select('*').eq('room_id', roomId);
    if (roomWasCreated && (!participantsData || participantsData.length === 0)) {
      const participantsToInsert = INITIAL_PARTICIPANTS.map((p) => ({
        id: p.id,
        room_id: roomId,
        team_id: p.teamId,
        level: p.level ?? 0,
        name: p.name,
        student_code: p.studentCode,
        status: p.status,
        note: p.note,
        avatar: p.avatar,
        updated_at: p.updatedAt || Date.now(),
      }));
      await supabase.from('participants').insert(participantsToInsert);
      participantsData = participantsToInsert;
    }

    // Transform participants data
    const formattedParticipants: Participant[] = (participantsData || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      teamId: p.team_id,
      level: Number.isFinite(Number(p.level)) ? Number(p.level) : 0,
      status: p.status,
      studentCode: p.student_code,
      note: p.note,
      avatar: p.avatar,
      updatedAt: Number(p.updated_at) || Date.now(),
    }));

    return {
      room: {
        id: roomData.id,
        code: roomData.code,
        name: roomData.name,
        activity: roomData.activity,
        lastUpdated: 'Vừa xong',
        totalParticipants: formattedParticipants.length,
      } as Room,
      teams: INITIAL_TEAMS, // uses rich preset UI color schemes
      participants: formattedParticipants,
    };
  } catch (err) {
    console.error('Error fetching initial room data:', err);
    return {
      room: INITIAL_ROOM,
      teams: INITIAL_TEAMS,
      participants: INITIAL_PARTICIPANTS,
    };
  }
}

// ----------------------------------------------------
// Mutation Services (Host Actions)
// ----------------------------------------------------
export async function updateParticipantTeamInDB(
  participantId: string,
  teamId: string | null
) {
  try {
    await supabase
      .from('participants')
      .update({ team_id: teamId, updated_at: Date.now() })
      .eq('id', participantId);
  } catch (err) {
    console.error('Error updating participant team in DB:', err);
  }
}

export async function updateParticipantStatusInDB(
  participantId: string,
  status: 'present' | 'absent',
  note?: string
) {
  try {
    await supabase
      .from('participants')
      .update({ status, note, updated_at: Date.now() })
      .eq('id', participantId);
  } catch (err) {
    console.error('Error updating participant status in DB:', err);
  }
}

export async function updateParticipantLevelInDB(
  participantId: string,
  level: number
) {
  try {
    await supabase
      .from('participants')
      .update({ level, updated_at: Date.now() })
      .eq('id', participantId);
  } catch (err) {
    console.error('Error updating participant level in DB:', err);
  }
}

export async function addParticipantToDB(
  roomId: string,
  name: string,
  teamId: string | null
) {
  try {
    const newId = 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase
      .from('participants')
      .insert({
        id: newId,
        room_id: roomId,
        team_id: teamId,
        level: 0,
        name,
        status: 'present',
        updated_at: Date.now(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding participant to DB:', err);
    return null;
  }
}

export async function resetRoomTeamsInDB(roomId: string) {
  try {
    await supabase
      .from('participants')
      .update({ team_id: null, updated_at: Date.now() })
      .eq('room_id', roomId);
  } catch (err) {
    console.error('Error resetting room teams in DB:', err);
  }
}

export async function deleteAllParticipantsInDB(roomId: string) {
  try {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('room_id', roomId);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting participants in DB:', err);
  }
}

export async function deleteParticipantFromDB(participantId: string) {
  try {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting participant from DB:', err);
    return false;
  }
}

export async function batchUpdateParticipantTeamsInDB(
  updates: { id: string; teamId: string | null }[]
) {
  try {
    const promises = updates.map((u) =>
      supabase
        .from('participants')
        .update({ team_id: u.teamId, updated_at: Date.now() })
        .eq('id', u.id)
    );
    await Promise.all(promises);
  } catch (err) {
    console.error('Error batch updating participant teams:', err);
  }
}

// ----------------------------------------------------
// Realtime Subscription Listener
// ----------------------------------------------------
export function subscribeToRoomChanges(
  roomId: string,
  onParticipantChange: () => void
) {
  const channel = getRoomRealtimeBindings(roomId).reduce(
    (activeChannel, binding) =>
      activeChannel.on('postgres_changes', binding, () => {
        onParticipantChange();
      }),
    supabase.channel(`room-realtime-${roomId}`)
  ).subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
