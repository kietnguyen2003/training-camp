import { motion, AnimatePresence } from 'motion/react';
import { X, Check, HelpCircle, ArrowRight, UserCheck, UserX } from 'lucide-react';
import { Participant, Team } from '../types';

interface MoveMemberSheetProps {
  isOpen: boolean;
  participant: Participant | null;
  teams: Team[];
  getTeamMemberCount: (teamId: string) => number;
  onClose: () => void;
  onSelectDestination: (participantId: string, targetTeamId: string | null) => void;
  onToggleStatus?: (participantId: string) => void;
}

export function MoveMemberSheet({
  isOpen,
  participant,
  teams,
  getTeamMemberCount,
  onClose,
  onSelectDestination,
  onToggleStatus,
}: MoveMemberSheetProps) {
  if (!isOpen || !participant) return null;
  const isAbsent = participant.status === 'absent';

  return (
    <AnimatePresence>
      <div id="move-member-modal-wrapper" className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          id="move-member-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Sheet Container */}
        <motion.div
          id="move-member-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-5 z-10 pb-safe max-h-[85dvh] flex flex-col"
        >
          {/* iOS-style drag handle */}
          <div className="flex justify-center -mt-1 mb-3">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                  isAbsent
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                {participant.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white leading-none">
                    {participant.name}
                  </h3>
                  {participant.studentCode && (
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                      {participant.studentCode}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isAbsent
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {isAbsent ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    <span>{isAbsent ? 'Vắng mặt' : 'Có mặt'}</span>
                  </span>

                  {onToggleStatus && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(participant.id)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      {isAbsent ? 'Đổi thành có mặt' : 'Đổi thành vắng'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              id="close-move-sheet-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Destination Choices List */}
          <div className="overflow-y-auto py-3 space-y-2 flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Chọn sân tập xếp vào
            </span>

            {/* Teams */}
            {teams.map((team) => {
              const isCurrent = participant.teamId === team.id;
              const count = getTeamMemberCount(team.id);

              return (
                <button
                  key={team.id}
                  type="button"
                  id={`select-team-${team.id}`}
                  onClick={() => {
                    onSelectDestination(participant.id, team.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] min-h-[56px] cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-[#112238] hover:bg-slate-800 border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${team.colorScheme.dotColor}`} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <span>{team.name}</span>
                        <span className="text-slate-500 font-normal">•</span>
                        <span className="text-slate-300 font-medium text-xs">
                          {team.lead.badgeTitle || 'Trợ giảng'}: {team.lead.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-normal">
                        Đang có {count} học viên
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isCurrent ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Sân hiện tại</span>
                      </span>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Unassigned Option */}
            <div className="pt-2">
              <button
                type="button"
                id="select-team-unassigned"
                onClick={() => {
                  onSelectDestination(participant.id, null);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] min-h-[56px] cursor-pointer ${
                  participant.teamId === null
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-[#112238] hover:bg-slate-800 border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-white">
                      Chưa xếp sân (Hàng chờ)
                    </div>
                    <span className="text-xs text-slate-400 font-normal">
                      Chuyển học viên về danh sách chờ xếp sân
                    </span>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {participant.teamId === null ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Hiện tại</span>
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

