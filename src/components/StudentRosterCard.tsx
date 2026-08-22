import { useState, useMemo, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shuffle,
  UserPlus,
  ArrowRightLeft,
  ChevronDown,
  CheckCircle2,
  FileText,
  GripVertical,
  Sparkles,
  ArrowDownToLine,
} from 'lucide-react';
import { Participant, Team } from '../types';

interface StudentRosterCardProps {
  participants: Participant[];
  teams: Team[];
  isHost: boolean;
  recentlyMovedId: string | null;
  draggingStudentId: string | null;
  onDragStartStudent: (studentId: string) => void;
  onDragEndStudent: () => void;
  onDropOnRoster: (studentId: string) => void;
  onToggleStatus: (participantId: string) => void;
  onMoveMember: (participant: Participant) => void;
  onDirectAssignTeam: (participantId: string, targetTeamId: string | null) => void;
  onShuffle: () => void;
  onOpenAddMember: () => void;
  onOpenAttendanceSheet: () => void;
}

export function StudentRosterCard({
  participants,
  teams,
  isHost,
  recentlyMovedId,
  draggingStudentId,
  onDragStartStudent,
  onDragEndStudent,
  onDropOnRoster,
  onToggleStatus,
  onMoveMember,
  onDirectAssignTeam,
  onShuffle,
  onOpenAddMember,
  onOpenAttendanceSheet,
}: StudentRosterCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'unassigned' | 'all' | 'present' | 'absent'>('unassigned');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isDragOverRoster, setIsDragOverRoster] = useState(false);

  // Statistics
  const totalCount = participants.length;
  const presentCount = participants.filter((p) => p.status === 'present').length;
  const absentCount = participants.filter((p) => p.status === 'absent').length;
  const unassignedParticipants = participants.filter((p) => p.teamId === null);
  const unassignedCount = unassignedParticipants.length;
  const presentUnassignedCount = unassignedParticipants.filter((p) => p.status === 'present').length;

  // Filtered List
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'unassigned') return p.teamId === null;
      if (filterMode === 'present') return p.status === 'present';
      if (filterMode === 'absent') return p.status === 'absent';
      return true;
    });
  }, [participants, searchQuery, filterMode]);

  const getTeamById = (teamId: string | null) => {
    if (!teamId) return null;
    return teams.find((t) => t.id === teamId) || null;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOverRoster) setIsDragOverRoster(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverRoster(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOverRoster(false);
    const studentId = e.dataTransfer.getData('text/plain') || draggingStudentId;
    if (studentId) {
      onDropOnRoster(studentId);
      onDragEndStudent();
    }
  };

  return (
    <div
      id="student-roster-card"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border transition-all flex flex-col soft-card-shadow overflow-hidden ${
        isDragOverRoster
          ? 'border-[#D9B472] ring-4 ring-[#D9B472]/20 bg-amber-50/30'
          : 'border-[#E6DFD3]'
      }`}
    >
      {/* Header with Title matching wireframe: "danh sách học viên" */}
      <div className="bg-[#FAF7F2] border-b border-[#E6DFD3] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1B2A3E] animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-[#1B2A3E] tracking-tight">
                Danh sách học viên
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Kéo thả học viên trực tiếp vào 4 nhóm ở trên hoặc phân chia tự động
            </p>
          </div>

          {/* Sĩ số & Trạng thái badges */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs font-extrabold">
            <span className="px-3 py-1 rounded-full bg-[#EFE7D8] text-slate-800">
              Tổng: {totalCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Có mặt: {presentCount}
            </span>
            {absentCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 flex items-center gap-1">
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                Vắng: {absentCount}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200/80">
              Chờ xếp: {unassignedCount}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        {isHost && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E6DFD3] overflow-x-auto pb-1 scrollbar-none">
            {/* Chia đội vào 4 nhóm (Shuffle) */}
            <button
              type="button"
              id="roster-shuffle-btn"
              onClick={onShuffle}
              disabled={presentUnassignedCount === 0}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all shadow-xs whitespace-nowrap cursor-pointer ${
                presentUnassignedCount > 0
                  ? 'bg-[#1B2A3E] text-white hover:bg-slate-800 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Tự động chia đều học sinh có mặt vào 4 nhóm"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#D9B472]" />
              <span>Chia đều vào 4 nhóm</span>
              {presentUnassignedCount > 0 && (
                <span className="bg-[#D9B472] text-[#1B2A3E] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {presentUnassignedCount}
                </span>
              )}
            </button>

            {/* Attendance Sheet Dialog Button */}
            <button
              type="button"
              id="roster-open-attendance-btn"
              onClick={onOpenAttendanceSheet}
              className="px-4 py-2 rounded-full text-xs font-extrabold text-[#1B2A3E] bg-[#EFE7D8] hover:bg-[#E6DFD3] border border-[#E6DFD3] flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bảng điểm danh cả lớp</span>
            </button>

            {/* Add Student Button */}
            <button
              type="button"
              id="roster-add-student-btn"
              onClick={onOpenAddMember}
              className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-800 bg-white hover:bg-[#FAF7F2] border border-[#E6DFD3] flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Thêm học viên</span>
            </button>
          </div>
        )}

        {/* Search & Mode Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="roster-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm học viên theo tên hoặc mã..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E6DFD3] rounded-full text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9B472]/30 focus:border-[#D9B472] transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#EFE7D8]/60 p-1 border border-[#E6DFD3] rounded-full overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode('unassigned')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterMode === 'unassigned'
                  ? 'bg-[#D9B472] text-[#1B2A3E] font-black shadow-xs'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Chờ xếp ({unassignedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-[#1B2A3E] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('present')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterMode === 'present'
                  ? 'bg-emerald-700 text-white font-black shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              Có mặt ({presentCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('absent')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterMode === 'absent'
                  ? 'bg-rose-700 text-white font-black shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              Vắng ({absentCount})
            </button>
          </div>
        </div>
      </div>

      {/* Droppable Student List */}
      <div className="p-3 sm:p-4 space-y-2 max-h-[380px] overflow-y-auto bg-[#FAF7F2]/40">
        {/* Drop indicator if dragging back to roster */}
        {isDragOverRoster && (
          <div className="py-3 px-4 rounded-full border-2 border-dashed border-[#D9B472] bg-amber-100/90 text-center text-xs font-black text-amber-900 flex items-center justify-center gap-2 animate-pulse">
            <ArrowDownToLine className="w-4 h-4 text-amber-700" />
            <span>Thả vào đây để đưa học viên về danh sách chờ xếp</span>
          </div>
        )}

        {filteredParticipants.length === 0 ? (
          <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-[#E6DFD3]">
            <Users className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-400" />
            <p className="text-xs font-bold text-slate-600">
              {filterMode === 'unassigned'
                ? 'Tất cả học viên đã được xếp vào các nhóm!'
                : 'Không tìm thấy học viên nào'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filterMode === 'unassigned'
                ? 'Kéo học viên từ 4 nhóm ở trên thả vào đây để hoàn lại hàng chờ'
                : 'Thử tìm kiếm hoặc đổi bộ lọc'}
            </p>
          </div>
        ) : (
          filteredParticipants.map((student) => {
            const isAbsent = student.status === 'absent';
            const currentTeam = getTeamById(student.teamId);
            const isMoved = recentlyMovedId === student.id;
            const isDraggingThis = draggingStudentId === student.id;

            return (
              <div
                key={student.id}
                id={`roster-student-item-${student.id}`}
                draggable={isHost}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', student.id);
                  e.dataTransfer.effectAllowed = 'move';
                  onDragStartStudent(student.id);
                }}
                onDragEnd={onDragEndStudent}
                className={`py-2 px-3.5 rounded-full border flex items-center justify-between gap-3 select-none transition-all group ${
                  isDraggingThis
                    ? 'opacity-50 border-[#D9B472] bg-amber-100 scale-95'
                    : isMoved
                    ? 'bg-amber-100/90 ring-2 ring-[#D9B472]/60 border-[#D9B472]'
                    : isAbsent
                    ? 'bg-rose-50/80 border-rose-200'
                    : 'bg-white border-[#E6DFD3] hover:border-slate-300 shadow-2xs'
                } ${isHost ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {/* Left: Drag Handle, Avatar, Student Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isHost && (
                    <div className="text-slate-300 group-hover:text-slate-500 shrink-0 touch-none">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      isAbsent
                        ? 'bg-rose-100 text-rose-800'
                        : currentTeam
                        ? currentTeam.colorScheme.avatarBg
                        : 'bg-[#1B2A3E] text-white'
                    }`}
                  >
                    {student.name.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isAbsent ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {student.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      {currentTeam ? (
                        <span
                          className={`font-black px-2 py-0.5 rounded-full text-[10px] ${currentTeam.colorScheme.badgeBg}`}
                        >
                          Nhóm {currentTeam.lead.name || currentTeam.name}
                        </span>
                      ) : (
                        <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
                          Chưa xếp nhóm
                        </span>
                      )}

                      {student.note && (
                        <span className="text-slate-400 italic text-[10px] truncate max-w-[130px]">
                          • {student.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick Attendance Toggle */}
                  <button
                    type="button"
                    id={`roster-status-toggle-${student.id}`}
                    onClick={() => onToggleStatus(student.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                      isAbsent
                        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                    title={isAbsent ? 'Nhấn để chuyển thành Có mặt' : 'Nhấn để đánh dấu Vắng'}
                  >
                    {isAbsent ? (
                      <>
                        <UserX className="w-3.5 h-3.5 text-rose-700" />
                        <span className="hidden xs:inline">Vắng</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="hidden xs:inline">Có mặt</span>
                      </>
                    )}
                  </button>

                  {/* Quick Group Assignment Selector */}
                  {isHost && (
                    <div className="relative">
                      <button
                        type="button"
                        id={`roster-assign-dropdown-${student.id}`}
                        onClick={() =>
                          setActiveDropdownId(
                            activeDropdownId === student.id ? null : student.id
                          )
                        }
                        className="p-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#EFE7D8] text-slate-700 border border-[#E6DFD3] transition-colors flex items-center gap-0.5 text-xs font-bold cursor-pointer"
                        title="Xếp vào nhóm khác"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>

                      {/* Dropdown Menu for 4 teams */}
                      <AnimatePresence>
                        {activeDropdownId === student.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveDropdownId(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 5 }}
                              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-[#E6DFD3] p-1.5 z-50 space-y-1 text-xs font-bold"
                            >
                              <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                                Xếp vào nhóm:
                              </div>
                              {teams.slice(0, 4).map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    onDirectAssignTeam(student.id, t.id);
                                    setActiveDropdownId(null);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full transition-all ${
                                    student.teamId === t.id
                                      ? 'bg-[#1B2A3E] text-white font-extrabold'
                                      : 'hover:bg-[#FAF7F2] text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${t.colorScheme.dotColor}`}
                                    />
                                    <span>{t.lead.name || t.name}</span>
                                  </div>
                                  {student.teamId === t.id && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D9B472]" />
                                  )}
                                </button>
                              ))}

                              <div className="border-t border-[#E6DFD3] my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  onDirectAssignTeam(student.id, null);
                                  setActiveDropdownId(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full transition-all ${
                                  student.teamId === null
                                    ? 'bg-amber-100 text-amber-900 font-extrabold'
                                    : 'hover:bg-[#FAF7F2] text-amber-800'
                                }`}
                              >
                                <span>Hàng chờ (Chưa xếp)</span>
                                {student.teamId === null && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                                )}
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
