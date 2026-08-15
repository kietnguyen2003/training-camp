import { useState } from 'react';
import { UserPlus, Sparkles, Check, UserCheck, UserX, ChevronDown, ChevronUp } from 'lucide-react';
import { Participant } from '../types';
import { MemberRow } from './MemberRow';

interface UnassignedCardProps {
  unassignedMembers: Participant[];
  isHost: boolean;
  recentlyMovedId: string | null;
  onMoveMember: (participant: Participant) => void;
  onShuffle?: () => void;
  onAddNewMember?: () => void;
  onToggleStatus?: (participantId: string) => void;
  onOpenAttendance?: () => void;
}

export function UnassignedCard({
  unassignedMembers,
  isHost,
  recentlyMovedId,
  onMoveMember,
  onShuffle,
  onAddNewMember,
  onToggleStatus,
  onOpenAttendance,
}: UnassignedCardProps) {
  const [showAbsentSection, setShowAbsentSection] = useState(true);

  const presentUnassigned = unassignedMembers.filter((m) => m.status === 'present');
  const absentMembers = unassignedMembers.filter((m) => m.status === 'absent');

  return (
    <div
      id="unassigned-card"
      className="bg-[#112238] rounded-3xl p-4 border border-[#1E3A5F] shadow-lg space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 gold-glow-sm" />
          <h2 className="font-bold text-base md:text-lg text-white tracking-tight">
            Chưa xếp sân / Chờ chia
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {presentUnassigned.length} có mặt
          </span>
          {absentMembers.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {absentMembers.length} vắng
            </span>
          )}
        </div>
      </div>

      {/* Subtext / Instruction for Host */}
      {isHost && presentUnassigned.length > 0 && (
        <p className="text-xs text-slate-400 font-medium">
          Chọn học sinh bên dưới để xếp vào sân, hoặc dùng nút <span className="font-semibold text-amber-400">Xếp đều vào sân</span>.
        </p>
      )}

      {/* Present Unassigned Section */}
      <div>
        {presentUnassigned.length === 0 ? (
          <div className="py-4 px-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center flex flex-col items-center justify-center gap-1">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-sm font-bold text-sky-200">
              Tất cả học sinh có mặt đã được xếp vào sân!
            </span>
            <span className="text-xs text-sky-400 font-medium">
              Không còn học sinh chờ xếp sân.
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {presentUnassigned.map((member) => (
              <MemberRow
                key={member.id}
                participant={member}
                isHost={isHost}
                isRecentlyMoved={recentlyMovedId === member.id}
                onMoveClick={onMoveMember}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Absent Section (If any) */}
      {absentMembers.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowAbsentSection(!showAbsentSection)}
            className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              <span>Danh sách vắng mặt hôm nay ({absentMembers.length})</span>
            </div>
            {showAbsentSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAbsentSection && (
            <div className="space-y-1.5 mt-2">
              {absentMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  participant={member}
                  isHost={isHost}
                  isRecentlyMoved={recentlyMovedId === member.id}
                  onMoveClick={onMoveMember}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Host Quick Actions below list */}
      {isHost && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {onAddNewMember && (
              <button
                type="button"
                id="unassigned-add-person-btn"
                onClick={onAddNewMember}
                className="text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm học sinh</span>
              </button>
            )}

            {onOpenAttendance && (
              <button
                type="button"
                id="unassigned-open-attendance-btn"
                onClick={onOpenAttendance}
                className="text-xs font-bold text-sky-300 hover:text-sky-200 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Điểm danh</span>
              </button>
            )}
          </div>

          {presentUnassigned.length > 0 && onShuffle && (
            <button
              type="button"
              id="unassigned-distribute-btn"
              onClick={onShuffle}
              className="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 flex items-center gap-1.5 py-2 px-3.5 rounded-xl shadow-md transition-all ml-auto cursor-pointer gold-glow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Chia đều ({presentUnassigned.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

