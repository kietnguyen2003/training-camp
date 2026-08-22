import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, UserCheck, Users, X } from 'lucide-react';
import { Participant, Team } from '../types';

interface PresentParticipantPickerSheetProps {
  isOpen: boolean;
  team: Team | null;
  participants: Participant[];
  onClose: () => void;
  onSelectParticipant: (participantId: string) => void;
}

export function PresentParticipantPickerSheet({
  isOpen,
  team,
  participants,
  onClose,
  onSelectParticipant,
}: PresentParticipantPickerSheetProps) {
  if (!isOpen || !team) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-5 z-10 pb-safe max-h-[85dvh] flex flex-col"
        >
          <div className="flex justify-center -mt-1 mb-3">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Chọn học viên có mặt
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  Bấm để thêm nhanh vào {team.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto py-3 space-y-2 flex-1">
            {participants.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-slate-300">
                  Không có học viên có mặt nào đang chờ
                </p>
                <p className="text-xs mt-1">
                  Hãy thêm học viên mới hoặc chuyển học viên về hàng chờ trước.
                </p>
              </div>
            ) : (
              participants.map((participant) => (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() => {
                    onSelectParticipant(participant.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] min-h-[56px] cursor-pointer bg-[#112238] hover:bg-slate-800 border-slate-700/80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      {participant.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white truncate">
                        {participant.name}
                      </div>
                      <div className="text-xs text-slate-400">Đang ở hàng chờ</div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
