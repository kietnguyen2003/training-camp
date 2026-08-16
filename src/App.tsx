import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Room,
  Team,
  Participant,
  ToastMessage,
} from './types';
import {
  INITIAL_ROOM,
  INITIAL_TEAMS,
  INITIAL_PARTICIPANTS,
  INITIAL_USER,
} from './mockData';
import { AppHeader } from './components/AppHeader';
import { TeamGrid2x2 } from './components/TeamGrid2x2';
import { LevelGrid2x2 } from './components/LevelGrid2x2';
import { HostActionBar } from './components/HostActionBar';
import { MoveMemberSheet } from './components/MoveMemberSheet';
import { ResetConfirmationSheet } from './components/ResetConfirmationSheet';
import { AddParticipantSheet } from './components/AddParticipantSheet';
import { AttendanceSheet } from './components/AttendanceSheet';
import { PresentParticipantPickerSheet } from './components/PresentParticipantPickerSheet';
import { UserMenuModal } from './components/UserMenuModal';
import { LoginScreen } from './components/LoginScreen';
import { ToastContainer } from './components/Toast';
import { RoomSkeleton } from './components/RoomSkeleton';
import { supabase } from './supabaseClient';
import {
  fetchInitialRoomData,
  updateParticipantTeamInDB,
  updateParticipantStatusInDB,
  addParticipantToDB,
  resetRoomTeamsInDB,
  deleteAllParticipantsInDB,
  deleteParticipantFromDB,
  batchUpdateParticipantTeamsInDB,
  updateParticipantLevelInDB,
  subscribeToRoomChanges,
} from './services/roomService';
import { getTapToggleStatus } from './services/attendanceStatus';
import { assignPresentParticipantsToTeams } from './services/levelAssignment';
import {
  clearHostSession,
  getStoredHostSession,
  persistHostSession,
} from './utils/hostAuth';

export default function App() {
  // App State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'courts' | 'levels'>('courts');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [room, setRoom] = useState<Room>(INITIAL_ROOM);
  const [teams] = useState<Team[]>(INITIAL_TEAMS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);

  // Load Room & Participants from Supabase
  const reloadRoomData = useCallback(async () => {
    const data = await fetchInitialRoomData(room.id);
    if (data) {
      setRoom(data.room);
      setParticipants(data.participants);
    }
  }, [room.id]);

  // Initial Room Load & Supabase Realtime Listener
  useEffect(() => {
    reloadRoomData();

    // Subscribe to Realtime Postgres changes
    const unsubscribe = subscribeToRoomChanges(room.id, () => {
      reloadRoomData();
    });

    return () => {
      unsubscribe();
    };
  }, [room.id, reloadRoomData]);

  // Local host access session
  useEffect(() => {
    const hasSession = getStoredHostSession();

    if (hasSession) {
      setUser(INITIAL_USER);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    setIsLoading(false);
    setIsCheckingAuth(false);
  }, []);

  const handleHostLogin = () => {
    persistHostSession();
    setUser(INITIAL_USER);
    setIsLoggedIn(true);
    setIsCheckingAuth(false);
    showToast('Đã vào chế độ host', 'success');
  };

  const handleSignOut = async () => {
    clearHostSession();
    setActiveSheet(null);
    setIsLoggedIn(false);
    setUser(INITIAL_USER);
    showToast('Đã đăng xuất', 'info');
  };

  // Interaction State
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<
    'move' | 'reset' | 'user' | 'add' | 'attendance' | 'assignPresent' | null
  >(null);
  const [selectedParticipantForMove, setSelectedParticipantForMove] =
    useState<Participant | null>(null);
  const [targetTeamForAdd, setTargetTeamForAdd] = useState<string | null>(null);
  const [targetTeamForPresentAssign, setTargetTeamForPresentAssign] = useState<Team | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper counts
  const unassignedParticipants = participants.filter((p) => p.teamId === null);
  const presentParticipants = participants.filter((p) => p.status === 'present');
  const absentParticipants = participants.filter((p) => p.status === 'absent');
  const retiredParticipants = participants.filter((p) => p.status === 'retired');
  const presentUnassigned = unassignedParticipants.filter((p) => p.status === 'present');

  const getTeamMemberCount = (teamId: string) =>
    participants.filter((p) => p.teamId === teamId).length;

  if (isCheckingAuth) {
    return (
      <div className="h-[100dvh] bg-[rgb(203,180,139)] flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-md">
          <RoomSkeleton />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onSuccess={handleHostLogin} onError={(msg) => showToast(msg, 'warning')} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const isHost = true;

  // Move Participant handler
  const handleSelectDestination = (
    participantId: string,
    targetTeamId: string | null
  ) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;

    if (participant.teamId === targetTeamId) return;

    // Optimistic UI update
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, teamId: targetTeamId, updatedAt: Date.now() } : p
      )
    );

    // Sync to Supabase DB
    updateParticipantTeamInDB(participantId, targetTeamId);

    setRecentlyMovedId(participantId);
    setTimeout(() => {
      setRecentlyMovedId(null);
    }, 1800);

    setRoom((prev) => ({ ...prev, lastUpdated: 'vừa xong' }));

    const destName = targetTeamId
      ? teams.find((t) => t.id === targetTeamId)?.name || 'Nhóm'
      : 'Chưa chia nhóm';

    showToast(`Đã chuyển ${participant.name} vào ${destName}`, 'success');
  };

  // Drag and Drop Handlers
  const handleDragStartStudent = (studentId: string) => {
    setDraggingStudentId(studentId);
  };

  const handleDragEndStudent = () => {
    setDraggingStudentId(null);
  };

  const handleDropOnTeam = (teamId: string, studentId: string) => {
    handleSelectDestination(studentId, teamId);
    setDraggingStudentId(null);
  };

  const handleRemoveFromTeam = (studentId: string) => {
    handleSelectDestination(studentId, null);
  };

  const handleAssignLevel = (level: number, participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;
    if (participant.level === level) return;

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, level, updatedAt: Date.now() } : p
      )
    );

    updateParticipantLevelInDB(participantId, level);

    setRecentlyMovedId(participantId);
    setTimeout(() => {
      setRecentlyMovedId(null);
    }, 1800);

    const targetTeam = teams[level];
    showToast(
      `Đã xếp ${participant.name} vào ${targetTeam?.name || `Level ${level}`}`,
      'success'
    );
  };

  // Open Move Sheet
  const handleOpenMoveSheet = (participant: Participant) => {
    setSelectedParticipantForMove(participant);
    setActiveSheet('move');
  };

  // Toggle Attendance Status (Có mặt <-> Vắng mặt)
  const handleToggleAttendance = (participantId: string) => {
    const student = participants.find((p) => p.id === participantId);
    if (!student) return;

    const nextStatus = getTapToggleStatus(student.status);

    // Optimistic update
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: nextStatus, updatedAt: Date.now() } : p))
    );

    // Sync to Supabase DB
    updateParticipantStatusInDB(participantId, nextStatus);

    showToast(
      nextStatus === 'present'
        ? `${student.name}: Đã ghi nhận CÓ MẶT`
        : nextStatus === 'absent'
        ? `${student.name}: Đã ghi nhận VẮNG MẶT`
        : `${student.name}: Đã chuyển sang ĐÃ NGHỈ`,
      nextStatus === 'present' ? 'success' : 'warning'
    );
  };

  const handleSetAttendanceStatus = (participantId: string, status: Participant['status']) => {
    const student = participants.find((p) => p.id === participantId);
    if (!student || student.status === status) return;

    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status, updatedAt: Date.now() } : p))
    );

    updateParticipantStatusInDB(participantId, status);

    showToast(
      status === 'present'
        ? `${student.name}: Đã quay lại CÓ MẶT`
        : status === 'absent'
        ? `${student.name}: Đã ghi nhận VẮNG MẶT`
        : `${student.name}: Đã chuyển sang ĐÃ NGHỈ`,
      status === 'present' ? 'success' : 'warning'
    );
  };

  // Mark all present or all absent
  const handleMarkAllAttendance = (status: 'present' | 'absent') => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, status, updatedAt: Date.now() }))
    );
    participants.forEach((p) => updateParticipantStatusInDB(p.id, status));

    showToast(
      status === 'present'
        ? 'Đã điểm danh TẤT CẢ CÓ MẶT'
        : 'Đã đánh dấu TẤT CẢ VẮNG MẶT',
      status === 'present' ? 'success' : 'warning'
    );
  };

  // Add single student to roster
  const handleAddStudentToRoster = async (name: string, studentCode?: string, note?: string) => {
    await addParticipantToDB(room.id, name, null);
    await reloadRoomData();
    showToast(`Đã thêm học sinh ${name} vào danh sách lớp`, 'success');
  };

  // Bulk import roster
  const handleBulkImportRoster = async (names: string[], replaceExisting: boolean) => {
    if (replaceExisting) {
      await deleteAllParticipantsInDB(room.id);
    }
    for (const name of names) {
      await addParticipantToDB(room.id, name.trim(), null);
    }
    await reloadRoomData();
    showToast(`Đã nhập danh sách ${names.length} học sinh mới`, 'success');
  };

  // Remove student from roster
  const handleRemoveStudentFromRoster = async (participantId: string) => {
    const student = participants.find((p) => p.id === participantId);
    const previousParticipants = participants;

    setParticipants((prev) => prev.filter((p) => p.id !== participantId));

    const deleted = await deleteParticipantFromDB(participantId);

    if (!deleted) {
      setParticipants(previousParticipants);
      showToast('Không thể xóa học sinh. Vui lòng thử lại.', 'warning');
      return;
    }

    await reloadRoomData();

    if (student) {
      showToast(`Đã xóa ${student.name} khỏi danh sách lớp`, 'info');
    }
  };

  // Update student note
  const handleUpdateStudentNote = (participantId: string, note: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, note, updatedAt: Date.now() } : p))
    );
    supabase.from('participants').update({ note }).eq('id', participantId);
    showToast('Đã lưu ghi chú học sinh', 'success');
  };

  // Shuffle Action (Only shuffles PRESENT unassigned members!)
  const handleShuffle = async () => {
    const updates = assignPresentParticipantsToTeams(participants, teams);

    if (updates.length === 0) {
      showToast('Không có học sinh có mặt nào đang chờ chia nhóm', 'warning');
      return;
    }

    // Optimistic UI Update
    setParticipants((prev) =>
      prev.map((p) => {
        const found = updates.find((u) => u.id === p.id);
        return found ? { ...p, teamId: found.teamId, updatedAt: Date.now() } : p;
      })
    );

    // Sync to Supabase DB
    await batchUpdateParticipantTeamsInDB(updates);

    setRoom((prev) => ({ ...prev, lastUpdated: 'vừa xong' }));
    showToast(`Đã xếp ${updates.length} học sinh có mặt vào sân theo level`, 'success');
  };

  // Reset Action
  const handleResetTeams = async () => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, teamId: null, updatedAt: Date.now() }))
    );
    await resetRoomTeamsInDB(room.id);
    setRoom((prev) => ({ ...prev, lastUpdated: 'vừa xong' }));
    showToast('Đã chuyển tất cả học sinh về hàng chờ (Chưa chia nhóm)', 'warning');
  };

  // Add Participant Action from AddSheet
  const handleAddParticipant = async (name: string, teamId: string | null) => {
    await addParticipantToDB(room.id, name, teamId);
    await reloadRoomData();
    showToast(`Đã thêm ${name}`, 'success');
  };

  // Quick Add Member to specific team
  const handleQuickAddTeamMember = (teamId: string) => {
    setTargetTeamForAdd(teamId);
    setActiveSheet('add');
  };

  const handleOpenPresentPickerForTeam = (teamId: string) => {
    const targetTeam = teams.find((team) => team.id === teamId) || null;
    if (!targetTeam) return;

    if (presentUnassigned.length === 0) {
      showToast('Không có học viên có mặt nào đang chờ xếp sân', 'warning');
      return;
    }

    setTargetTeamForPresentAssign(targetTeam);
    setActiveSheet('assignPresent');
  };

  const handleAssignPresentParticipantToTeam = (participantId: string) => {
    if (!targetTeamForPresentAssign) return;
    handleSelectDestination(participantId, targetTeamForPresentAssign.id);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#F7F3E9] text-slate-100 flex flex-col selection:bg-amber-500/20 overflow-hidden">
      {/* Top App Header with Header-Slot Toasts */}
      <AppHeader
        room={room}
        user={user}
        toasts={toasts}
        onDismissToast={dismissToast}
        onOpenUserMenu={() => setActiveSheet('user')}
      />

      {/* Main Content Area */}
      <main
        id="main-room-content"
        className="flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 pt-1.5 sm:pt-2 flex flex-col min-h-0 overflow-hidden pb-16 sm:pb-18"
      >
        {isLoading ? (
          <RoomSkeleton />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
            {/* 4 Groups Grid 2x2 */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 px-1 pb-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView('courts')}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                    activeView === 'courts'
                      ? 'bg-[#D9B472] text-[#1B2A3E]'
                      : 'bg-[#112238] text-slate-300 border border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  Xếp sân
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('levels')}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                    activeView === 'levels'
                      ? 'bg-[#D9B472] text-[#1B2A3E]'
                      : 'bg-[#112238] text-slate-300 border border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  Xếp level
                </button>
              </div>

              {activeView === 'courts' ? (
                <TeamGrid2x2
                  teams={teams}
                  participants={participants}
                  isHost={isHost}
                  recentlyMovedId={recentlyMovedId}
                  draggingStudentId={draggingStudentId}
                  onDragStartStudent={handleDragStartStudent}
                  onDragEndStudent={handleDragEndStudent}
                  onDropOnTeam={handleDropOnTeam}
                  onMoveMember={handleOpenMoveSheet}
                  onQuickAddMember={handleQuickAddTeamMember}
                  onSelectEmptyTeam={handleOpenPresentPickerForTeam}
                  onToggleStatus={handleToggleAttendance}
                  onRemoveFromTeam={handleRemoveFromTeam}
                />
              ) : (
                <LevelGrid2x2
                  teams={teams}
                  participants={participants}
                  isHost={isHost}
                  recentlyMovedId={recentlyMovedId}
                  draggingStudentId={draggingStudentId}
                  onDragStartStudent={handleDragStartStudent}
                  onDragEndStudent={handleDragEndStudent}
                  onDropOnLevel={handleAssignLevel}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar (Host Mode Only) */}
      {isHost && (
        <HostActionBar
          unassignedCount={presentUnassigned.length}
          presentCount={presentParticipants.length}
          absentCount={absentParticipants.length + retiredParticipants.length}
          onShuffle={handleShuffle}
          onOpenAttendance={() => setActiveSheet('attendance')}
          onOpenReset={() => setActiveSheet('reset')}
          onOpenAddMember={() => {
            setTargetTeamForAdd(null);
            setActiveSheet('add');
          }}
        />
      )}

      {/* Bottom Sheet: Attendance */}
      <AttendanceSheet
        isOpen={activeSheet === 'attendance'}
        participants={participants}
        teams={teams}
        onClose={() => setActiveSheet(null)}
        onToggleStatus={handleToggleAttendance}
        onSetStatus={handleSetAttendanceStatus}
        onMarkAllStatus={handleMarkAllAttendance}
        onAddStudent={handleAddStudentToRoster}
        onBulkImport={handleBulkImportRoster}
        onRemoveStudent={handleRemoveStudentFromRoster}
        onUpdateNote={handleUpdateStudentNote}
      />

      {/* Bottom Sheet: Move Member */}
      <MoveMemberSheet
        isOpen={activeSheet === 'move'}
        participant={selectedParticipantForMove}
        teams={teams}
        getTeamMemberCount={getTeamMemberCount}
        onClose={() => {
          setActiveSheet(null);
          setSelectedParticipantForMove(null);
        }}
        onSelectDestination={handleSelectDestination}
        onToggleStatus={handleToggleAttendance}
      />

      {/* Bottom Sheet: Reset Confirmation */}
      <ResetConfirmationSheet
        isOpen={activeSheet === 'reset'}
        onClose={() => setActiveSheet(null)}
        onConfirmReset={handleResetTeams}
      />

      {/* Bottom Sheet: Add Participant */}
      <AddParticipantSheet
        isOpen={activeSheet === 'add'}
        teams={teams}
        targetTeamId={targetTeamForAdd}
        onClose={() => {
          setActiveSheet(null);
          setTargetTeamForAdd(null);
        }}
        onAddParticipant={handleAddParticipant}
      />

      <PresentParticipantPickerSheet
        isOpen={activeSheet === 'assignPresent'}
        team={targetTeamForPresentAssign}
        participants={presentUnassigned}
        onClose={() => {
          setActiveSheet(null);
          setTargetTeamForPresentAssign(null);
        }}
        onSelectParticipant={handleAssignPresentParticipantToTeam}
      />

      {/* Modal / Sheet: User Profile */}
      <UserMenuModal
        isOpen={activeSheet === 'user'}
        user={user}
        onClose={() => setActiveSheet(null)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
