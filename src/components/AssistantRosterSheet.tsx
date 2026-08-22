import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, UserMinus, UserPlus, X } from 'lucide-react';
import type { Participant } from '../types';

interface AssistantRosterSheetProps {
  isOpen: boolean;
  participants: Participant[];
  assistantParticipantIds: Set<string>;
  onClose: () => void;
  onSetAssistant: (participant: Participant, isAssistant: boolean) => void;
}

export function AssistantRosterSheet({
  isOpen,
  participants,
  assistantParticipantIds,
  onClose,
  onSetAssistant,
}: AssistantRosterSheetProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.section
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-3xl border border-slate-800 bg-[#0D1B2E] p-5 pb-safe text-slate-100 shadow-2xl"
          aria-label="Quản lý danh sách trợ giảng"
        >
          <div className="mb-3 -mt-1 flex justify-center"><div className="h-1.5 w-12 rounded-full bg-slate-700" /></div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="text-lg font-bold text-white">Danh sách trợ giảng</h2><p className="text-xs text-slate-400">Chọn participant được phép làm trợ giảng</p></div></div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Đóng danh sách trợ giảng"><X className="h-5 w-5" /></button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-4 pr-1">
            {participants.map((participant) => {
              const isAssistant = assistantParticipantIds.has(participant.id);
              return (
                <div key={participant.id} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-[#112238] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-sky-200">{participant.name.charAt(0)}</div>
                  <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">{participant.name}</p>
                  <button
                    type="button"
                    onClick={() => onSetAssistant(participant, !isAssistant)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${isAssistant ? 'bg-rose-500/10 text-rose-200 hover:bg-rose-500/20' : 'bg-sky-400/15 text-sky-200 hover:bg-sky-400/25'}`}
                  >
                    {isAssistant ? <UserMinus className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                    <span>{isAssistant ? 'Bỏ khỏi danh sách' : 'Thêm trợ giảng'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
