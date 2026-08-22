import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, Clock3, Save, Users, X } from 'lucide-react';
import type { TeamHistorySnapshot } from '../types';

interface TeamHistorySheetProps {
  isOpen: boolean;
  isHost: boolean;
  snapshots: TeamHistorySnapshot[];
  onClose: () => void;
  onSave: (historyDate: string) => Promise<void>;
  onViewHistory?: (snapshot: TeamHistorySnapshot) => void;
}

export function TeamHistorySheet({
  isOpen,
  isHost,
  snapshots,
  onClose,
  onSave,
  onViewHistory,
}: TeamHistorySheetProps) {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isSaving, setIsSaving] = useState(false);

  const selectedSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.historyDate === selectedDate) ?? null,
    [selectedDate, snapshots]
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getToday());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSnapshot = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedDate);
    } finally {
      setIsSaving(false);
    }
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
          className="relative z-10 flex w-full max-w-lg max-h-[88dvh] flex-col rounded-t-3xl border border-slate-800 bg-[#0D1B2E] p-5 pb-safe text-slate-100 shadow-2xl"
          aria-label="Lịch sử chia team"
        >
          <div className="mb-3 -mt-1 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-300">
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight text-white">Lịch sử chia team</h2>
                <p className="text-xs text-slate-400">Mỗi ngày lưu một bản phân chia sân</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Đóng lịch sử chia team"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 py-4">
            <CalendarDays className="h-4 w-4 shrink-0 text-amber-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#112238] px-3 py-2 text-sm font-semibold text-white outline-hidden focus:border-amber-400"
              aria-label="Chọn ngày lịch sử"
            />
          </div>

          {snapshots.length > 0 ? (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {snapshots.map((snapshot) => (
                <button
                  type="button"
                  key={snapshot.id}
                  onClick={() => {
                    if (onViewHistory) {
                      onViewHistory(snapshot);
                      onClose();
                      return;
                    }
                    setSelectedDate(snapshot.historyDate);
                  }}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    snapshot.historyDate === selectedDate
                      ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                      : 'border-slate-700 bg-[#112238] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {formatDate(snapshot.historyDate)}
                </button>
              ))}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {selectedSnapshot ? (
              <div className="space-y-3 pb-2">
                {selectedSnapshot.teams.map((team) => (
                  <article key={team.teamId} className="rounded-2xl border border-slate-700/80 bg-[#112238] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white">{team.teamName}</h3>
                        {team.note ? <p className="mt-0.5 text-xs text-amber-200/80">{team.note}</p> : null}
                        {team.assistant ? <p className="mt-1 text-xs text-sky-200">Trợ giảng: {team.assistant.name}</p> : null}
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-300">
                        {team.members.length} người
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {team.members.length > 0 ? team.members.map((member) => (
                        <span key={member.participantId} className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-200">
                          {member.name} · L{member.level}
                        </span>
                      )) : <span className="text-xs italic text-slate-500">Chưa có thành viên</span>}
                    </div>
                  </article>
                ))}
                {selectedSnapshot.unassignedMembers.length > 0 ? (
                  <article className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Chưa xếp sân</p>
                    <p className="mt-1 text-sm text-slate-200">
                      {selectedSnapshot.unassignedMembers.map((member) => member.name).join(', ')}
                    </p>
                  </article>
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#112238]/60 px-6 text-center">
                <Users className="mb-3 h-7 w-7 text-slate-500" />
                <p className="font-semibold text-slate-300">Chưa có bản chia team cho ngày này</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {isHost ? 'Chọn ngày rồi lưu đội hình hiện tại để xem lại sau.' : 'Host chưa lưu lịch sử cho ngày này.'}
                </p>
              </div>
            )}
          </div>

          {isHost ? (
            <div className="mt-4 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={saveSnapshot}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E6C587] bg-[#D9B472] px-4 py-3 text-sm font-bold text-[#1B2A3E] transition-all hover:bg-[#C9A461] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Đang lưu...' : selectedSnapshot ? 'Cập nhật bản lưu ngày này' : 'Lưu đội hình hiện tại'}</span>
              </button>
            </div>
          ) : null}
        </motion.section>
      </div>
    </AnimatePresence>
  );
}

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${date}T00:00:00`)
  );
}
