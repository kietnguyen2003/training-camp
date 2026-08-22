import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus } from 'lucide-react';
import { Team } from '../types';

interface AddParticipantSheetProps {
  isOpen: boolean;
  teams: Team[];
  targetTeamId?: string | null;
  onClose: () => void;
  onAddParticipant: (name: string, studentCode: string, teamId: string | null) => void;
}

export function AddParticipantSheet({
  isOpen,
  teams,
  targetTeamId = null,
  onClose,
  onAddParticipant,
}: AddParticipantSheetProps) {
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(targetTeamId);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentCode.trim()) return;
    onAddParticipant(name.trim(), studentCode.trim(), selectedTeamId);
    setName('');
    setStudentCode('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div id="add-participant-modal-wrapper" className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          id="add-participant-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Sheet Container */}
        <motion.div
          id="add-participant-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-5 z-10 pb-safe max-h-[85dvh] flex flex-col"
        >
          {/* Drag handle */}
          <div className="flex justify-center -mt-1 mb-3">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Thêm học viên mới
              </h3>
            </div>

            <button
              type="button"
              id="close-add-participant-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="participant-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Họ và tên học viên
              </label>
              <input
                id="participant-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên học viên..."
                autoFocus
                className="w-full px-4 py-3 text-base rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-[#112238] text-white placeholder-slate-400 transition-all min-h-[48px]"
              />
            </div>

            <div>
              <label htmlFor="participant-student-code-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mã học viên
              </label>
              <input
                id="participant-student-code-input"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: SV25"
                autoCapitalize="characters"
                className="w-full px-4 py-3 text-base font-bold tracking-wide uppercase rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-[#112238] text-white placeholder-slate-400 transition-all min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Xếp vào nhóm ban đầu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="add-placement-unassigned"
                  onClick={() => setSelectedTeamId(null)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                    selectedTeamId === null
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-[#112238] text-slate-300 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold">Hàng chờ (Chưa chia)</div>
                  <div className="text-[11px] text-slate-400">Thêm vào danh sách chờ</div>
                </button>

                {teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    id={`add-placement-${team.id}`}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      selectedTeamId === team.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-[#112238] text-slate-300 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${team.colorScheme.dotColor}`} />
                      {team.name}
                    </div>
                    <div className="text-[11px] text-slate-400">Lead: {team.lead.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="submit-add-participant-btn"
                disabled={!name.trim() || !studentCode.trim()}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all min-h-[48px] shadow-md cursor-pointer gold-glow-sm"
              >
                Thêm vào {selectedTeamId ? teams.find(t => t.id === selectedTeamId)?.name : 'Danh sách chờ'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
