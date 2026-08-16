import { useRef, useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UserCheck,
  Search,
  Plus,
  FileText,
  Users,
  CheckCheck,
  Sparkles,
  Circle,
  CircleCheckBig,
} from 'lucide-react';
import { Participant, Team } from '../types';
import { buildAttendanceGridRows } from './attendanceGrid';
import { getStatusLabel } from '../services/attendanceStatus';

interface AttendanceSheetProps {
  isOpen: boolean;
  participants: Participant[];
  teams: Team[];
  onClose: () => void;
  onToggleStatus: (participantId: string) => void;
  onSetStatus: (participantId: string, status: Participant['status']) => void;
  onMarkAllStatus: (status: 'present' | 'absent') => void;
  onAddStudent: (name: string, studentCode?: string, note?: string) => void;
  onBulkImport: (names: string[], replaceExisting: boolean) => void;
  onRemoveStudent: (participantId: string) => void;
  onUpdateNote: (participantId: string, note: string) => void;
}

export function AttendanceSheet({
  isOpen,
  participants,
  teams,
  onClose,
  onToggleStatus,
  onSetStatus,
  onMarkAllStatus,
  onAddStudent,
  onBulkImport,
  onRemoveStudent,
  onUpdateNote,
}: AttendanceSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'present' | 'absent' | 'retired'>('all');
  const [activeTabMode, setActiveTabMode] = useState<'list' | 'retired' | 'add' | 'import'>('list');

  // New student form state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newNote, setNewNote] = useState('');

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [longPressParticipant, setLongPressParticipant] = useState<Participant | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef<string | null>(null);

  // Calculate statistics
  const activeParticipants = participants.filter((p) => p.status !== 'retired');
  const retiredParticipants = participants.filter((p) => p.status === 'retired');
  const totalCount = activeParticipants.length;
  const presentCount = activeParticipants.filter((p) => p.status === 'present').length;
  const absentCount = activeParticipants.filter((p) => p.status === 'absent').length;
  const retiredCount = retiredParticipants.length;

  // Filtered list
  const filteredParticipants = useMemo(() => {
    const sourceParticipants = activeTabMode === 'retired' ? retiredParticipants : activeParticipants;

    return sourceParticipants.filter((p) => {
      // Tab filter
      if (activeTabMode !== 'retired') {
        if (filterTab === 'present' && p.status !== 'present') return false;
        if (filterTab === 'absent' && p.status !== 'absent') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCode = p.studentCode?.toLowerCase().includes(query) ?? false;
        const matchesNote = p.note?.toLowerCase().includes(query) ?? false;
        return matchesName || matchesCode || matchesNote;
      }
      return true;
    });
  }, [activeParticipants, retiredParticipants, activeTabMode, filterTab, searchQuery]);

  const attendanceRows = useMemo(
    () => buildAttendanceGridRows(filteredParticipants),
    [filteredParticipants]
  );

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStudent(newName.trim(), newCode.trim() || undefined, newNote.trim() || undefined);
    setNewName('');
    setNewCode('');
    setNewNote('');
    setActiveTabMode('list');
  };

  const handleBulkSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Parse lines or comma separated
    const parsed = bulkText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (parsed.length > 0) {
      onBulkImport(parsed, replaceExisting);
      setBulkText('');
      setActiveTabMode('list');
    }
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return 'Chưa chia nhóm';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.name : 'Chưa chia nhóm';
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLongPress = (participant: Participant) => {
    clearLongPressTimer();

    if (activeTabMode === 'retired') {
      return;
    }

    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = participant.id;
      setLongPressParticipant(participant);
      clearLongPressTimer();
    }, 450);
  };

  const handleParticipantTap = (participant: Participant) => {
    if (suppressClickRef.current === participant.id) {
      suppressClickRef.current = null;
      return;
    }

    onToggleStatus(participant.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="attendance-sheet-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Sheet Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90dvh] flex flex-col overflow-hidden pb-safe"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-[#112238] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold shadow-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base text-white leading-tight">
                    Điểm danh học viên
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {presentCount} có mặt • {absentCount} vắng • {retiredCount} đã nghỉ
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-attendance-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-navigation tabs: List vs Add vs Import */}
            <div className="flex items-center px-3.5 sm:px-4 pt-2.5 gap-1.5 border-b border-slate-800 shrink-0 pb-2 bg-[#0D1B2E]">
              <button
                type="button"
                onClick={() => setActiveTabMode('list')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'list'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Danh sách ({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabMode('retired')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'retired'
                    ? 'bg-slate-200 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Đã nghỉ ({retiredCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabMode('add')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'add'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm học viên</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabMode('import')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'import'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dán danh sách</span>
              </button>
            </div>

            {/* CONTENT VIEWS */}
            {(activeTabMode === 'list' || activeTabMode === 'retired') && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-3 px-4 space-y-3 border-b border-slate-800 bg-[#0D1B2E] shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã học viên"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#112238] border border-slate-700/80 pl-9 pr-8 py-2 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {activeTabMode === 'list' && (
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setFilterTab('all')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            filterTab === 'all'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Tất cả ({totalCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterTab('present')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            filterTab === 'present'
                              ? 'bg-sky-500 text-white'
                              : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
                          }`}
                        >
                          Có mặt ({presentCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterTab('absent')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            filterTab === 'absent'
                              ? 'bg-rose-500 text-white'
                              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          }`}
                        >
                          Vắng ({absentCount})
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => onMarkAllStatus('present')}
                          className="text-[11px] font-bold text-sky-300 hover:text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Đánh dấu tất cả có mặt"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>All co mat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkAllStatus('absent')}
                          className="text-[11px] font-bold text-rose-300 hover:text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/30 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Đánh dấu tất cả vắng"
                        >
                          <Circle className="w-3.5 h-3.5" />
                          <span>All vang</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 min-h-0">
                  {filteredParticipants.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-semibold">
                        {activeTabMode === 'retired' ? 'Chưa có học viên nào đã nghỉ' : 'Không tìm thấy học viên nào'}
                      </p>
                      <p className="text-[11px] mt-0.5">
                        {activeTabMode === 'retired' ? 'Những học viên đã nghỉ sẽ xuất hiện ở đây' : 'Thử đổi bộ lọc hoặc thêm học viên mới'}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-slate-700/80 bg-[#101725] p-3 sm:p-4 shadow-2xl">
                      <div className="grid gap-3">
                        {attendanceRows.map((row, rowIndex) => (
                          <div key={`attendance-row-${rowIndex}`} className="grid grid-cols-2 gap-3">
                            {row.map((participant, columnIndex) => {
                              if (!participant) {
                                return <div key={`attendance-empty-${rowIndex}-${columnIndex}`} className="h-[78px]" />;
                              }

                              const isPresent = participant.status === 'present';
                              const isRetired = participant.status === 'retired';

                              return (
                                <button
                                  key={participant.id}
                                  type="button"
                                  onClick={() => handleParticipantTap(participant)}
                                  onContextMenu={(event) => {
                                    event.preventDefault();
                                    if (activeTabMode !== 'retired') {
                                      setLongPressParticipant(participant);
                                    }
                                  }}
                                  onPointerDown={() => startLongPress(participant)}
                                  onPointerUp={clearLongPressTimer}
                                  onPointerLeave={clearLongPressTimer}
                                  onPointerCancel={clearLongPressTimer}
                                  className={`min-h-[78px] rounded-3xl border-2 px-3 py-3 text-left transition-all active:scale-[0.98] ${
                                    isPresent
                                      ? 'border-[#E7E0D5] bg-[#F8F5EE] text-[#17263A] shadow-md'
                                      : isRetired
                                      ? 'border-slate-500/80 bg-slate-800/60 text-slate-100 hover:border-slate-300 hover:bg-slate-700/70'
                                      : 'border-slate-500/80 bg-transparent text-slate-200 hover:border-rose-400/70 hover:bg-rose-500/10'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-sm font-black leading-tight">
                                        {participant.name}
                                      </div>
                                      <div className={`mt-1 text-[10px] font-semibold ${
                                        isPresent ? 'text-slate-500' : 'text-slate-400'
                                      }`}>
                                        {participant.studentCode || getTeamName(participant.teamId)}
                                      </div>
                                      {participant.note && (
                                        <div className={`mt-1 truncate text-[10px] ${
                                          isPresent ? 'text-amber-700' : 'text-amber-300'
                                        }`}>
                                          {participant.note}
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      className={`mt-0.5 shrink-0 rounded-full p-1 ${
                                        isPresent ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-700/40 text-slate-300'
                                      }`}
                                    >
                                      {isPresent ? (
                                        <CircleCheckBig className="h-4 w-4" />
                                      ) : (
                                        <Circle className="h-4 w-4" />
                                      )}
                                    </div>
                                  </div>
                                  <div className={`mt-2 text-[11px] font-bold ${
                                    isPresent ? 'text-emerald-600' : isRetired ? 'text-slate-200' : 'text-rose-300'
                                  }`}>
                                    {getStatusLabel(participant.status)}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Add Single Student */}
            {activeTabMode === 'add' && (
              <form onSubmit={handleAddSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Họ và tên học sinh / sinh viên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mã số học sinh / SV (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: SV25, HS01"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lớp trưởng, Đến muộn..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabMode('list')}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm shadow-indigo-200"
                  >
                    Lưu học sinh
                  </button>
                </div>
              </form>
            )}

            {/* TAB: Bulk Paste Roster */}
            {activeTabMode === 'import' && (
              <form onSubmit={handleBulkSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Dán danh sách lớp cố định:</span>
                    <span className="text-indigo-700">
                      Mỗi dòng một tên hoặc ngăn cách bằng dấu phẩy. Hệ thống sẽ tự động tạo danh sách học sinh.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Danh sách tên học sinh
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder={`Nguyễn Văn An\nTrần Minh Quân\nLê Thị Mai\nPhạm Hoàng Nam...`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="replace-existing-check"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="replace-existing-check" className="text-xs font-semibold text-gray-700 cursor-pointer">
                    Thay thế toàn bộ danh sách hiện tại (Xóa danh sách cũ)
                  </label>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabMode('list')}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm shadow-indigo-200"
                  >
                    Nhập danh sách
                  </button>
                </div>
              </form>
            )}

            {longPressParticipant && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 flex items-end sm:items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-[#112238] p-4 shadow-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white">Đổi trạng thái học viên</h4>
                      <p className="mt-1 text-xs text-slate-300">{longPressParticipant.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLongPressParticipant(null)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                      aria-label="Đóng chọn trạng thái"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSetStatus(longPressParticipant.id, 'retired');
                        setLongPressParticipant(null);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-600 bg-slate-800/70 px-4 py-3 text-left text-white hover:border-slate-400 hover:bg-slate-700"
                    >
                      <span className="text-sm font-bold">Đã nghỉ</span>
                      <span className="text-xs text-slate-300">Chuyển sang danh sách riêng</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Summary & Done Button */}
            <div className="p-4 border-t border-slate-800 bg-[#112238] flex justify-end shrink-0">
              <button
                type="button"
                id="done-attendance-btn"
                onClick={onClose}
                className="py-2.5 px-5 rounded-2xl font-bold text-sm text-[#1B2A3E] bg-[#D9B472] hover:bg-[#C9A461] active:scale-[0.98] transition-all shadow-xs"
              >
                Xong (Lưu điểm danh)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
