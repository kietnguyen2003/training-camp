import { CalendarDays, Clock3, ListRestart, Plus } from 'lucide-react';
import type { TeamHistorySnapshot } from '../types';

interface TeamHistorySidebarProps {
  snapshots: TeamHistorySnapshot[];
  selectedHistoryDate: string | null;
  isHost: boolean;
  onShowCurrent: () => void;
  onSelectSnapshot: (snapshot: TeamHistorySnapshot) => void;
  onOpenHistory: () => void;
}

export function TeamHistorySidebar({
  snapshots,
  selectedHistoryDate,
  isHost,
  onShowCurrent,
  onSelectSnapshot,
  onOpenHistory,
}: TeamHistorySidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden lg:w-56 lg:rounded-3xl lg:border lg:border-[#E5D3B0] lg:bg-[#FFFDF8] lg:shadow-[0_8px_24px_rgba(27,42,62,0.06)]">
      <div className="hidden lg:block lg:border-b lg:border-[#E8DECC] lg:bg-[#F2E6CF] lg:px-4 lg:py-4">
        <div className="flex items-center gap-2 text-[#1B2A3E]">
          <Clock3 className="h-4 w-4 text-[#B88A38]" />
          <h2 className="text-sm font-extrabold">Lịch sử buổi tập</h2>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">Chọn ngày để xem lại cách chia sân.</p>
      </div>

      <div className="flex min-w-0 gap-1 overflow-x-auto py-0.5 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:overflow-x-hidden lg:p-2.5">
        <button
          type="button"
          onClick={onShowCurrent}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors lg:mb-2 lg:w-full lg:rounded-2xl lg:py-3 lg:text-sm ${
            selectedHistoryDate === null
              ? 'bg-[#1B2A3E] text-white shadow-sm'
              : 'text-[#1B2A3E] hover:bg-[#F7F1E6]'
          }`}
        >
          <ListRestart className="h-4 w-4 shrink-0" />
          <span>Hiện tại</span>
        </button>

        <p className="hidden lg:block lg:px-3 lg:pb-2 lg:pt-2 lg:text-[10px] lg:font-extrabold lg:uppercase lg:tracking-[0.14em] lg:text-slate-400">
          Các buổi đã lưu
        </p>

        {snapshots.length > 0 ? (
          <div className="flex gap-1 lg:block lg:space-y-1">
            {snapshots.map((snapshot) => (
              <button
                type="button"
                key={snapshot.id}
                onClick={() => onSelectSnapshot(snapshot)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors lg:w-full lg:rounded-2xl lg:py-2.5 ${
                  selectedHistoryDate === snapshot.historyDate
                    ? 'bg-[#D9B472] text-[#1B2A3E]'
                    : 'text-slate-600 hover:bg-[#F7F1E6]'
                }`}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold lg:text-sm">{formatDate(snapshot.historyDate)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="shrink-0 px-2 py-2 text-xs leading-relaxed text-slate-400 lg:px-3 lg:py-4">Chưa có buổi nào được lưu.</p>
        )}
      </div>

      {isHost ? (
        <div className="hidden border-t border-[#E8DECC] p-2.5 lg:block">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D9B472] px-3 py-2.5 text-xs font-extrabold text-[#1B2A3E] transition-colors hover:bg-[#C9A461]"
          >
            <Plus className="h-4 w-4" />
            <span>Lưu buổi mới</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${date}T00:00:00`)
  );
}
