import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, UserCheck, UsersRound, X } from 'lucide-react';
import type { Participant, Team } from '../types';

interface AssistantBoardSheetProps {
  isOpen: boolean;
  teams: Team[];
  assistantParticipants: Participant[];
  onClose: () => void;
  onSelectAssistant: (teamId: string, participant: Participant | null) => void;
  onOpenAssistantRoster: () => void;
}

export function AssistantBoardSheet({
  isOpen,
  teams,
  assistantParticipants,
  onClose,
  onSelectAssistant,
  onOpenAssistantRoster,
}: AssistantBoardSheetProps) {
  if (!isOpen) return null;

  const participantsById = new Map(assistantParticipants.map((participant) => [participant.id, participant]));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.section
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-3xl border border-slate-800 bg-[#0D1B2E] p-5 pb-safe text-slate-100 shadow-2xl"
          aria-label="Bảng chọn trợ giảng"
        >
          <div className="mb-3 -mt-1 flex justify-center"><div className="h-1.5 w-12 rounded-full bg-slate-700" /></div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Bảng chọn trợ giảng</h2>
                <p className="text-xs text-slate-400">Chỉ hiển thị participant có role trợ giảng</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onOpenAssistantRoster} className="rounded-full p-2 text-sky-300 hover:bg-slate-800" title="Quản lý danh sách trợ giảng" aria-label="Quản lý danh sách trợ giảng"><UsersRound className="h-5 w-5" /></button>
              <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Đóng bảng trợ giảng"><X className="h-5 w-5" /></button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4 pr-1">
            {teams.map((team) => {
              const selectedParticipantId = team.assistant?.participantId ?? '';
              const selectedParticipant = selectedParticipantId ? participantsById.get(selectedParticipantId) : null;

              return (
                <article key={team.id} className="rounded-2xl border border-slate-700 bg-[#112238] p-3.5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{team.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{selectedParticipant ? `Đang chọn: ${selectedParticipant.name}` : 'Chưa phân công trợ giảng'}</p>
                    </div>
                    <UserCheck className={`h-5 w-5 shrink-0 ${selectedParticipant ? 'text-sky-300' : 'text-slate-600'}`} />
                  </div>
                  <select
                    value={selectedParticipantId}
                    onChange={(event) => onSelectAssistant(team.id, participantsById.get(event.target.value) ?? null)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0D1B2E] px-3 py-2.5 text-sm font-semibold text-white outline-hidden focus:border-sky-400"
                    aria-label={`Chọn trợ giảng cho ${team.name}`}
                  >
                    <option value="">Chưa chọn trợ giảng</option>
                    {assistantParticipants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </article>
              );
            })}
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
