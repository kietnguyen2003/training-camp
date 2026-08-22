import type { Key } from 'react';
import { ArrowRightLeft, UserCheck, UserX } from 'lucide-react';
import { Participant, TeamColorScheme } from '../types';

interface MemberRowProps {
  key?: Key;
  participant: Participant;
  isHost: boolean;
  colorScheme?: TeamColorScheme;
  isRecentlyMoved?: boolean;
  onMoveClick: (participant: Participant) => void;
  onToggleStatus?: (participantId: string) => void;
}

// Generate consistent dark mode avatar colors
function getAvatarColor(name: string) {
  const colors = [
    'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function MemberRow({
  participant,
  isHost,
  colorScheme,
  isRecentlyMoved,
  onMoveClick,
  onToggleStatus,
}: MemberRowProps) {
  const avatarClasses = getAvatarColor(participant.name);
  const isAbsent = participant.status === 'absent';

  return (
    <div
      id={`member-row-${participant.id}`}
      onClick={() => isHost && onMoveClick(participant)}
      className={`group flex items-center justify-between py-2 px-3 rounded-2xl transition-all duration-200 ${
        isHost
          ? 'cursor-pointer hover:bg-slate-800/60 active:scale-[0.99]'
          : 'hover:bg-slate-800/40'
      } ${
        isRecentlyMoved
          ? 'bg-amber-500/20 ring-2 ring-amber-400/80 border border-amber-400'
          : isAbsent
          ? 'bg-rose-500/10 border border-rose-500/30'
          : 'bg-[#0D1B2E] border border-slate-800 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar */}
        <div
          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
            isAbsent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : avatarClasses
          }`}
        >
          {participant.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Name & Badges */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className={`font-semibold text-xs sm:text-sm truncate ${
              isAbsent ? 'text-rose-300 line-through opacity-75' : 'text-slate-100'
            }`}
          >
            {participant.name}
          </span>


          {isAbsent && (
            <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-md shrink-0 border border-rose-500/30">
              Vắng {participant.note ? `(${participant.note})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex items-center gap-1 shrink-0">
          {onToggleStatus && (
            <button
              type="button"
              id={`btn-status-${participant.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(participant.id);
              }}
              className={`flex items-center justify-center w-7 h-7 rounded-xl transition-colors cursor-pointer ${
                isAbsent
                  ? 'text-rose-400 hover:bg-rose-500/20'
                  : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title={isAbsent ? 'Đánh dấu có mặt' : 'Đánh dấu vắng mặt'}
              aria-label={isAbsent ? 'Mark present' : 'Mark absent'}
            >
              {isAbsent ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            id={`btn-move-${participant.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onMoveClick(participant);
            }}
            className="flex items-center justify-center w-7.5 h-7.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Chuyển nhóm"
            aria-label={`Move ${participant.name}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
