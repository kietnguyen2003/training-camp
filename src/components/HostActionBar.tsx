import { Shuffle, RotateCcw, Share2, UserPlus, UserCheck } from 'lucide-react';

interface HostActionBarProps {
  unassignedCount: number;
  presentCount: number;
  absentCount: number;
  onShuffle: () => void;
  onOpenAttendance: () => void;
  onOpenReset: () => void;
  onOpenShare: () => void;
  onOpenAddMember: () => void;
}

export function HostActionBar({
  unassignedCount,
  presentCount,
  absentCount,
  onShuffle,
  onOpenAttendance,
  onOpenReset,
  onOpenShare,
  onOpenAddMember,
}: HostActionBarProps) {
  return (
    <div
      id="host-action-bar"
      className="fixed bottom-3 sm:bottom-4 inset-x-0 z-40 flex justify-center px-3 pointer-events-none"
    >
      <div className="bg-[#1B2A3E] text-white p-1.5 sm:p-2 rounded-full border border-slate-700/90 shadow-2xl flex items-center justify-between gap-1.5 sm:gap-2 max-w-xl w-full pointer-events-auto backdrop-blur-md">
        {/* Shuffle / Main Action Button - Floating Warm Gold Capsule */}
        <button
          type="button"
          id="host-action-shuffle-btn"
          onClick={onShuffle}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-black text-xs sm:text-sm transition-all active:scale-[0.98] bg-[#D9B472] hover:bg-[#C9A461] text-[#1B2A3E] shadow-md cursor-pointer"
          aria-label="Xếp đều học sinh vào các nhóm"
        >
          <Shuffle className="w-4 h-4 text-[#1B2A3E]" />
          <span>+ CHIA ĐỀU VÀO NHÓM</span>
        </button>

        {/* Attendance (Điểm danh) Button */}
        <button
          type="button"
          id="host-action-attendance-btn"
          onClick={onOpenAttendance}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-full font-extrabold text-xs text-slate-100 bg-[#27384E] hover:bg-[#324763] transition-all shrink-0 cursor-pointer active:scale-95 border border-slate-600/50"
          aria-label="Điểm danh học sinh"
          title="Bảng điểm danh cả lớp"
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden xs:inline">Điểm danh</span>
          {absentCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
              {absentCount}
            </span>
          )}
        </button>

        {/* Add Person Button */}
        <button
          type="button"
          id="host-action-add-btn"
          onClick={onOpenAddMember}
          className="w-10 h-10 rounded-full bg-[#27384E] hover:bg-[#324763] text-slate-200 border border-slate-600/50 flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95"
          title="Thêm học viên mới"
          aria-label="Thêm học viên mới"
        >
          <UserPlus className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          type="button"
          id="host-action-share-btn"
          onClick={onOpenShare}
          className="w-10 h-10 rounded-full bg-[#27384E] hover:bg-[#324763] text-slate-200 border border-slate-600/50 flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95"
          title="Chia sẻ mã phòng"
          aria-label="Chia sẻ mã phòng"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Reset Button */}
        <button
          type="button"
          id="host-action-reset-btn"
          onClick={onOpenReset}
          className="w-10 h-10 rounded-full bg-[#27384E] hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 border border-slate-600/50 flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95"
          title="Đặt lại nhóm"
          aria-label="Đặt lại nhóm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

