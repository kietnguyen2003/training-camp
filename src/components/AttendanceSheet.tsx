import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UserCheck,
  UserX,
  Search,
  Check,
  Plus,
  FileText,
  Trash2,
  AlertCircle,
  Users,
  CheckCheck,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Participant, Team } from '../types';

interface AttendanceSheetProps {
  isOpen: boolean;
  participants: Participant[];
  teams: Team[];
  onClose: () => void;
  onToggleStatus: (participantId: string) => void;
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
  onMarkAllStatus,
  onAddStudent,
  onBulkImport,
  onRemoveStudent,
  onUpdateNote,
}: AttendanceSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'present' | 'absent'>('all');
  const [activeTabMode, setActiveTabMode] = useState<'list' | 'add' | 'import'>('list');

  // New student form state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newNote, setNewNote] = useState('');

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Edit note modal/inline state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Calculate statistics
  const totalCount = participants.length;
  const presentCount = participants.filter((p) => p.status === 'present').length;
  const absentCount = participants.filter((p) => p.status === 'absent').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Filtered list
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Tab filter
      if (filterTab === 'present' && p.status !== 'present') return false;
      if (filterTab === 'absent' && p.status !== 'absent') return false;

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
  }, [participants, filterTab, searchQuery]);

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
                    {presentCount} có mặt • {absentCount} vắng • Tổng {totalCount} học viên
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
            {activeTabMode === 'list' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Search & Quick Action Controls */}
                <div className="p-3 px-4 space-y-2 border-b border-slate-800 bg-[#0D1B2E] shrink-0">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên học sinh, mã số..."
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

                  {/* Filter chips & Batch Attendance Buttons */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                    {/* Status filter chips */}
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

                    {/* Batch All Present / Absent */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => onMarkAllStatus('present')}
                        className="text-[11px] font-bold text-sky-300 hover:text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Đánh dấu tất cả có mặt"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Tất cả có mặt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onMarkAllStatus('absent')}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                        title="Đánh dấu tất cả vắng"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Tất cả vắng</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student Roster List */}
                <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-2 space-y-1.5 min-h-0">
                  {filteredParticipants.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-semibold">Không tìm thấy học viên nào</p>
                      <p className="text-[11px] mt-0.5">Thử đổi bộ lọc hoặc thêm học viên mới</p>
                    </div>
                  ) : (
                    filteredParticipants.map((p) => {
                      const isPresent = p.status === 'present';
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between gap-2 p-2.5 rounded-xl transition-all border ${
                            isPresent
                              ? 'bg-white hover:bg-gray-50 border-gray-100 shadow-2xs'
                              : 'bg-rose-50/50 border-rose-100/90'
                          }`}
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isPresent
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {p.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-bold text-xs sm:text-sm truncate ${
                                    isPresent ? 'text-gray-900' : 'text-rose-950 line-through opacity-75'
                                  }`}
                                >
                                  {p.name}
                                </span>
                                {p.studentCode && (
                                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-gray-100 text-gray-500 font-bold shrink-0">
                                    {p.studentCode}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mt-0.5">
                                <span>{getTeamName(p.teamId)}</span>
                                {p.note && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-700 font-semibold truncate bg-amber-50 px-1 rounded">
                                      {p.note}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Toggle Button & Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Note button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(p.id);
                                setEditingNoteText(p.note || '');
                              }}
                              title="Thêm ghi chú/lý do vắng"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* 1-Tap Toggle Presence Button */}
                            <button
                              type="button"
                              onClick={() => onToggleStatus(p.id)}
                              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs ${
                                isPresent
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isPresent ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Có mặt</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Vắng mặt</span>
                                </>
                              )}
                            </button>

                            {/* Delete student from class */}
                            <button
                              type="button"
                              onClick={() => onRemoveStudent(p.id)}
                              title="Xóa khỏi danh sách"
                              className="p-1.5 rounded-lg text-gray-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
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

            {/* Note Edit Modal Overlay */}
            {editingNoteId && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-xs z-30 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900">Ghi chú điểm danh</h4>
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Học sinh: <span className="font-bold text-gray-800">{participants.find(p => p.id === editingNoteId)?.name}</span>
                  </p>

                  <input
                    type="text"
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    placeholder="Ví dụ: Có phép, Bị sốt, Đến trễ 15p..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    autoFocus
                  />

                  <div className="flex items-center gap-1.5 pt-1">
                    {['Có phép', 'Không phép', 'Đến muộn', 'Nghỉ ốm'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEditingNoteText(tag)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateNote(editingNoteId, editingNoteText.trim());
                        setEditingNoteId(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Lưu ghi chú
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Summary & Done Button */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-gray-500">
                <span className="font-bold text-emerald-600">{presentCount}</span> có mặt •{' '}
                <span className="font-bold text-rose-600">{absentCount}</span> vắng mặt
              </div>
              <button
                type="button"
                id="done-attendance-btn"
                onClick={onClose}
                className="py-2.5 px-5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs"
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
