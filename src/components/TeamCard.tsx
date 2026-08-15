import type { Key } from 'react';
import { UserPlus } from 'lucide-react';
import { Team, Participant } from '../types';
import { TeamLead } from './TeamLead';
import { MemberRow } from './MemberRow';

interface TeamCardProps {
  key?: Key;
  team: Team;
  members: Participant[];
  isHost: boolean;
  recentlyMovedId: string | null;
  onMoveMember: (participant: Participant) => void;
  onQuickAddMember?: (teamId: string) => void;
  onToggleStatus?: (participantId: string) => void;
}

export function TeamCard({
  team,
  members,
  isHost,
  recentlyMovedId,
  onMoveMember,
  onQuickAddMember,
  onToggleStatus,
}: TeamCardProps) {
  const { colorScheme, lead } = team;
  const presentMembers = members.filter((m) => m.status === 'present');
  const absentMembers = members.filter((m) => m.status === 'absent');

  return (
    <div
      id={`team-card-${team.id}`}
      className="bg-[#112238] rounded-3xl border border-[#1E3A5F] shadow-lg overflow-hidden flex flex-col transition-all duration-200"
    >
      {/* Header Banner */}
      <div
        className={`${colorScheme.headerBg} px-4 sm:px-5 py-3 border-b ${colorScheme.headerBorder} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${colorScheme.dotColor} shadow-xs`} />
          <h2 className={`font-bold text-base md:text-lg ${colorScheme.headerText} tracking-tight`}>
            {team.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold ${colorScheme.badgeBg}`}
          >
            {members.length} THÀNH VIÊN
            {absentMembers.length > 0 && ` (${presentMembers.length} có mặt)`}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Team Lead Section */}
        <TeamLead lead={lead} colorScheme={colorScheme} />

        {/* Member List */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Thành viên ({members.length})
            </span>
            {isHost && onQuickAddMember && (
              <button
                type="button"
                id={`quick-add-btn-${team.id}`}
                onClick={() => onQuickAddMember(team.id)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-amber-500/10 active:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <div className="py-5 px-3 rounded-2xl bg-[#0D1B2E]/60 border border-dashed border-slate-700/60 text-center text-xs text-slate-400 font-medium">
              Chưa có thành viên nào
            </div>
          ) : (
            <div className="space-y-1.5">
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  participant={member}
                  isHost={isHost}
                  colorScheme={colorScheme}
                  isRecentlyMoved={recentlyMovedId === member.id}
                  onMoveClick={onMoveMember}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

