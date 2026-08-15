import { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
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
import { ShareRoomSheet } from './components/ShareRoomSheet';
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
  getUserProfile,
  upsertUserProfile,
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

  // Supabase Auth listener + user_roles Database lookup
  useEffect(() => {
    const handleSession = async (session: any) => {
      if (session?.user) {
        setIsLoading(true);
        const userId = session.user.id;
        const userEmail = session.user.email || '';
        const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0] || 'User';
        const avatarUrl = session.user.user_metadata?.avatar_url;

        // 1. Fetch user role from user_roles table
        let profile = await getUserProfile(userId);

        // 2. If profile does not exist yet in DB, create it with selected role
        if (!profile) {
          profile = await upsertUserProfile({
            id: userId,
            email: userEmail,
            full_name: fullName,
            avatar_url: avatarUrl,
            role: 'viewer',
          });
        }

        const activeRole = profile?.role || 'viewer';

        setUser({
          id: userId,
          name: profile?.full_name || fullName,
          email: userEmail,
          avatar: profile?.avatar_url || avatarUrl,
          role: activeRole,
        });

        setIsLoggedIn(true);
        setIsLoading(false);
      } else {
        setIsLoggedIn(false);
      }
      setIsCheckingAuth(false);
    };

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen to Auth State changes (Google Callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Interaction State
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<
    'move' | 'share' | 'reset' | 'user' | 'add' | 'attendance' | 'assignPresent' | null
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
  const presentUnassigned = unassignedParticipants.filter((p) => p.status === 'present');

  const getTeamMemberCount = (teamId: string) =>
    participants.filter((p) => p.teamId === teamId).length;

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
    if (user.role !== 'host') return;
    setSelectedParticipantForMove(participant);
    setActiveSheet('move');
  };

  // Toggle Attendance Status (Có mặt <-> Vắng mặt)
  const handleToggleAttendance = (participantId: string) => {
    const student = participants.find((p) => p.id === participantId);
    if (!student) return;

    const nextStatus = student.status === 'present' ? 'absent' : 'present';

    // Optimistic update
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: nextStatus, updatedAt: Date.now() } : p))
    );

    // Sync to Supabase DB
    updateParticipantStatusInDB(participantId, nextStatus);

    showToast(
      nextStatus === 'absent'
        ? `${student.name}: Đã ghi nhận VẮNG MẶT`
        : `${student.name}: Đã ghi nhận CÓ MẶT`,
      nextStatus === 'absent' ? 'warning' : 'success'
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
    if (presentUnassigned.length === 0) {
      showToast('Không có học sinh có mặt nào đang chờ chia nhóm', 'warning');
      return;
    }

    const updates: { id: string; teamId: string | null }[] = presentUnassigned.map((participant) => {
      const targetTeam = teams[participant.level] || null;

      return {
        id: participant.id,
        teamId: targetTeam?.id || null,
      };
    });

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
    showToast(`Đã xếp ${presentUnassigned.length} học sinh vào sân theo level`, 'success');
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
    if (user.role !== 'host') return;
    setTargetTeamForAdd(teamId);
    setActiveSheet('add');
  };

  const handleOpenPresentPickerForTeam = (teamId: string) => {
    if (user.role !== 'host') return;

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

  // Sign out handler
  const handleSignOut = async () => {
    setActiveSheet(null);
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    showToast('Đã đăng xuất', 'info');
  };

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
    return <LoginScreen onError={(msg) => showToast(msg, 'warning')} />;
  }

  const isHost = user.role === 'host';

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
        className={`flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 pt-1.5 sm:pt-2 flex flex-col min-h-0 overflow-hidden ${
          isHost ? 'pb-16 sm:pb-18' : 'pb-4'
        }`}
      >
        {isLoading ? (
          <RoomSkeleton />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
            {/* Viewer Mode Banner */}
            {!isHost && (
              <div
                id="viewer-mode-banner"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#112238] border border-slate-700/80 shadow-md text-xs text-slate-300 shrink-0"
              >
                <div className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <span className="font-bold text-white">Chế độ Người xem: </span>
                  <span>Đang theo dõi cập nhật thời gian thực từ Supabase</span>
                </div>
              </div>
            )}

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
          absentCount={absentParticipants.length}
          onShuffle={handleShuffle}
          onOpenAttendance={() => setActiveSheet('attendance')}
          onOpenReset={() => setActiveSheet('reset')}
          onOpenShare={() => setActiveSheet('share')}
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

      {/* Bottom Sheet: Share Room */}
      <ShareRoomSheet
        isOpen={activeSheet === 'share'}
        room={room}
        onClose={() => setActiveSheet(null)}
        onShowToast={showToast}
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
