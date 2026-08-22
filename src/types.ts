export type UserRole = 'host' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  teamId: string | null; // null means unassigned
  level: number;
  status: 'present' | 'absent' | 'retired'; // 'present' (Có mặt), 'absent' (Vắng mặt), 'retired' (Đã nghỉ)
  studentCode?: string;
  note?: string;
  updatedAt?: number;
}

export interface TeamLead {
  id: string;
  name: string;
  avatar?: string;
  badgeTitle?: string;
}

export interface TeamAssistant {
  participantId: string;
  name: string;
  avatar?: string;
  studentCode?: string;
}

export interface TeamHistoryAssistant {
  participantId: string;
  name: string;
  avatar?: string;
}

export type ParticipantRole = 'viewer' | 'assistant' | 'host';

export interface ParticipantRoleRecord {
  roomId: string;
  participantId: string;
  role: ParticipantRole;
}

export interface TeamColorScheme {
  id: string;
  name: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  headerBadgeText: string;
  leadBannerBg: string;
  leadAvatarBg: string;
  leadAvatarText: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  accentBg: string;
  avatarBg: string;
  avatarText: string;
  dotColor: string;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  lead: TeamLead;
  assistant?: TeamAssistant;
  colorScheme: TeamColorScheme;
  note?: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  activity: string;
  lastUpdated: string;
  totalParticipants: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

export interface TeamHistoryMember {
  participantId: string;
  name: string;
  status: Participant['status'];
  level: number;
}

export interface TeamHistoryTeam {
  teamId: string;
  teamName: string;
  note: string | null;
  assistant?: TeamHistoryAssistant;
  members: TeamHistoryMember[];
}

export interface TeamHistorySnapshotData {
  historyDate: string;
  teams: TeamHistoryTeam[];
  unassignedMembers: TeamHistoryMember[];
}

export interface TeamHistorySnapshot extends TeamHistorySnapshotData {
  id: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}
