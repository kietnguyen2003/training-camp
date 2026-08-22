import { motion, AnimatePresence } from 'motion/react';
import { X, Users, UserPlus, UserCheck, UserX, ArrowRight, Shield } from 'lucide-react';
import { Team, Participant } from '../types';

interface TeamDetailModalProps {
  isOpen: boolean;
  team: Team | null;
  participants: Participant[];
  isHost: boolean;
  onClose: () => void;
  onQuickAddMember: (teamId: string) => void;
  onMoveMember: (participant: Participant) => void;
  onToggleStatus: (participantId: string) => void;
}

export function TeamDetailModal({
  isOpen,
  team,
  participants,
  isHost,
  onClose,
  onQuickAddMember,
  onMoveMember,
  onToggleStatus,
}: TeamDetailModalProps) {
  if (!isOpen || !team) return null;

  const members = participants.filter((p) => p.teamId === team.id);
  const presentMembers = members.filter((m) => m.status === 'present');
  const absentMembers = members.filter((m) => m.status === 'absent');
  const { colorScheme, lead } = team;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className={`${colorScheme.headerBg} border-b ${colorScheme.headerBorder} p-5 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${colorScheme.leadBannerBg} text-white flex items-center justify-center font-black text-lg shadow-sm`}>
                {team.lead.name?.slice(0, 2).toUpperCase() || team.name.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-xl font-black ${colorScheme.headerText} tracking-tight`}>
                    Nhóm {team.lead.name || team.name}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorScheme.badgeBg}`}>
                    {members.length} học viên
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-semibold mt-0.5">
                  Trưởng nhóm: <span className="font-black text-gray-900">{lead.name}</span> • {presentMembers.length} có mặt
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Thành viên trong nhóm ({members.length})
              </h4>
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onQuickAddMember(team.id);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 py-1 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm học viên</span>
                </button>
              )}
            </div>

            {members.length === 0 ? (
              <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">Nhóm chưa có thành viên nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const isAbsent = member.status === 'absent';
                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isAbsent
                          ? 'bg-rose-50/50 border-rose-100 text-gray-600'
                          : 'bg-white border-gray-100 shadow-2xs hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAbsent
                              ? 'bg-rose-100 text-rose-700'
                              : colorScheme.avatarBg
                          }`}
                        >
                          {member.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-bold truncate ${isAbsent ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {member.name}
                            </span>
                          </div>
                          <span className={`text-[11px] font-bold ${isAbsent ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isAbsent ? 'Vắng mặt' : 'Có mặt'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(member.id)}
                          className={`p-1.5 rounded-xl text-xs font-bold ${
                            isAbsent ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                          }`}
                          title="Điểm danh"
                        >
                          {isAbsent ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        {isHost && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onMoveMember(member);
                            }}
                            className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1"
                            title="Chuyển nhóm"
                          >
                            <span>Chuyển</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
