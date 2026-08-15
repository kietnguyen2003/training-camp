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
  status: 'present' | 'absent'; // 'present' (Có mặt) or 'absent' (Vắng mặt)
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
  colorScheme: TeamColorScheme;
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
