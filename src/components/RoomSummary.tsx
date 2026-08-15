import { Users, LayoutGrid, Clock, UserCheck, HelpCircle, UserX } from 'lucide-react';

interface RoomSummaryProps {
  totalParticipants: number;
  presentCount: number;
  absentCount: number;
  teamsCount: number;
  unassignedCount: number;
  lastUpdated: string;
  onOpenAttendance?: () => void;
}

export function RoomSummary({
  totalParticipants,
  presentCount,
  absentCount,
  teamsCount,
  unassignedCount,
  lastUpdated,
  onOpenAttendance,
}: RoomSummaryProps) {
  const assignedCount = totalParticipants - unassignedCount;

  return (
    <div
      id="room-summary-card"
      className="bg-white rounded-3xl p-4.5 border border-gray-100 shadow-sm"
    >
      <div className="grid grid-cols-4 gap-1 divide-x divide-gray-100">
        {/* Sĩ số lớp */}
        <div className="flex flex-col items-center justify-center text-center px-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span>Sĩ số</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {totalParticipants}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">học sinh</span>
        </div>

        {/* Có mặt */}
        <div className="flex flex-col items-center justify-center text-center px-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <UserCheck className="w-3 h-3 text-emerald-500" />
            <span>Có mặt</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
            {presentCount}
          </div>
          <span className="text-[10px] text-emerald-600/80 font-medium">đi học</span>
        </div>

        {/* Vắng mặt */}
        <div className="flex flex-col items-center justify-center text-center px-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
            <UserX className="w-3 h-3 text-rose-500" />
            <span>Vắng</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              absentCount > 0 ? 'text-rose-600' : 'text-gray-400'
            }`}
          >
            {absentCount}
          </div>
          <span className="text-[10px] text-rose-500/80 font-medium">nghỉ</span>
        </div>

        {/* Số nhóm & Đã chia */}
        <div className="flex flex-col items-center justify-center text-center px-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <LayoutGrid className="w-3 h-3 text-indigo-500" />
            <span>{teamsCount} Nhóm</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {assignedCount}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">đã vào nhóm</span>
        </div>
      </div>

      {/* Footer info: Last updated & Quick Attendance Button */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>Cập nhật:</span>
          <span className="font-semibold text-gray-700">{lastUpdated}</span>
        </div>

        {onOpenAttendance && (
          <button
            type="button"
            onClick={onOpenAttendance}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mở bảng điểm danh</span>
          </button>
        )}
      </div>
    </div>
  );
}
