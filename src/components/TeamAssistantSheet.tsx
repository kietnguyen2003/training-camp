import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, UserCheck, UserMinus, Users, X } from 'lucide-react';
import type { Participant, Team } from '../types';

interface TeamAssistantSheetProps {
  isOpen: boolean;
  team: Team | null;
  participants: Participant[];
  onClose: () => void;
  onSelectAssistant: (teamId: string, participant: Participant | null) => void;
}

export function TeamAssistantSheet({
  isOpen,
  team,
  participants,
  onClose,
  onSelectAssistant,
}: TeamAssistantSheetProps) {
  const [query, setQuery] = useState('');
  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return participants;
    return participants.filter((participant) => participant.name.toLowerCase().includes(normalizedQuery));
  }, [participants, query]);

  if (!isOpen || !team) return null;

  const chooseAssistant = (participant: Participant | null) => {
    onSelectAssistant(team.id, participant);
    setQuery('');
    onClose();
  };

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
        >
          <div className="mb-3 -mt-1 flex justify-center"><div className="h-1.5 w-12 rounded-full bg-slate-700" /></div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300"><UserCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Chọn trợ giảng</h2>
                <p className="text-xs text-slate-400">{team.name}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Đóng chọn trợ giảng"><X className="h-5 w-5" /></button>
          </div>

          <div className="relative my-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên participant"
              className="w-full rounded-2xl border border-slate-700 bg-[#112238] py-3 pl-10 pr-3 text-sm text-white outline-hidden focus:border-sky-400"
            />
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredParticipants.length > 0 ? filteredParticipants.map((participant) => {
              const isSelected = team.assistant?.participantId === participant.id;
              return (
                <button
                  type="button"
                  key={participant.id}
                  onClick={() => chooseAssistant(participant)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    isSelected ? 'border-sky-400 bg-sky-400/10' : 'border-slate-700 bg-[#112238] hover:border-slate-600'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-sky-200">{participant.name.charAt(0)}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{participant.name}</p></div>
                  {isSelected ? <UserCheck className="h-4 w-4 text-sky-300" /> : null}
                </button>
              );
            }) : <div className="py-10 text-center text-sm text-slate-500"><Users className="mx-auto mb-2 h-6 w-6" />Không tìm thấy participant phù hợp.</div>}
          </div>

          {team.assistant ? (
            <button type="button" onClick={() => chooseAssistant(null)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200 hover:bg-rose-500/20"><UserMinus className="h-4 w-4" />Bỏ trợ giảng khỏi sân</button>
          ) : null}
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
