import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Save, StickyNote, X } from 'lucide-react';
import { Team } from '../types';
import { normalizeTeamNoteDraft } from '../services/teamNotes';

interface TeamNoteSheetProps {
  isOpen: boolean;
  team: Team | null;
  isHost: boolean;
  onClose: () => void;
  onSave: (teamId: string, note: string | null) => void;
}

export function TeamNoteSheet({
  isOpen,
  team,
  isHost,
  onClose,
  onSave,
}: TeamNoteSheetProps) {
  const [draftNote, setDraftNote] = useState('');

  useEffect(() => {
    setDraftNote(team?.note ?? '');
  }, [team]);

  if (!isOpen || !team) return null;

  const normalizedNote = normalizeTeamNoteDraft(draftNote);

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
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <StickyNote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Ghi chú {team.lead.name}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {isHost ? 'Host có thể cập nhật ghi chú cho sân này' : 'Viewer chỉ có thể xem ghi chú'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Đóng ghi chú sân"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-3 flex-1 min-h-0">
            <div className="rounded-2xl bg-[#112238] border border-slate-700/80 p-3 flex items-center gap-2 text-sm text-slate-200">
              <FileText className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-semibold">{team.name}</span>
            </div>

            {isHost ? (
              <textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="Viết ghi chú cho sân này..."
                className="w-full flex-1 min-h-40 rounded-2xl border border-slate-700/80 bg-[#112238] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-hidden focus:border-amber-400"
              />
            ) : (
              <div className="flex-1 min-h-40 rounded-2xl border border-slate-700/80 bg-[#112238] px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap overflow-y-auto">
                {team.note?.trim() ? team.note : 'Host chưa để lại ghi chú cho sân này.'}
              </div>
            )}
          </div>

          {isHost ? (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onSave(team.id, normalizedNote);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-[#1B2A3E] bg-[#D9B472] hover:bg-[#C9A461] border border-[#E6C587] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu ghi chú</span>
              </button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
