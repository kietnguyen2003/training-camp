import { memo, useEffect, useMemo, useRef, useState, type DragEvent, type TouchEvent as ReactTouchEvent } from 'react';
import {
  Bell,
  Users,
  UserCheck,
  UserX,
  X,
  Sparkles,
} from 'lucide-react';
import { Team, Participant } from '../types';

interface TeamGrid2x2Props {
  teams: Team[];
  participantsByTeam: Record<string, Participant[]>;
  isHost: boolean;
  recentlyMovedId: string | null;
  draggingStudentId: string | null;
  onDragStartStudent: (studentId: string) => void;
  onDragEndStudent: () => void;
  onDropOnTeam: (teamId: string, studentId: string) => void;
  onMoveMember: (participant: Participant) => void;
  onOpenTeamNote: (teamId: string) => void;
  onSelectEmptyTeam: (teamId: string) => void;
  onToggleStatus: (participantId: string) => void;
  onRemoveFromTeam: (participantId: string) => void;
}

export const TeamGrid2x2 = memo(function TeamGrid2x2({
  teams,
  participantsByTeam,
  isHost,
  recentlyMovedId,
  draggingStudentId,
  onDragStartStudent,
  onDragEndStudent,
  onDropOnTeam,
  onMoveMember,
  onOpenTeamNote,
  onSelectEmptyTeam,
  onToggleStatus,
  onRemoveFromTeam,
}: TeamGrid2x2Props) {
  const [dragOverTeamId, setDragOverTeamId] = useState<string | null>(null);
  const [touchDraggingStudentId, setTouchDraggingStudentId] = useState<string | null>(null);
  const [touchDragOverTeamId, setTouchDragOverTeamId] = useState<string | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const touchMoveRafRef = useRef<number | null>(null);
  const latestTouchRef = useRef<{ x: number; y: number; studentId: string } | null>(null);
  const participantLookup = useMemo(
    () =>
      Object.fromEntries(
        Object.values(participantsByTeam)
          .flat()
          .map((participant) => [participant.id, participant])
      ) as Record<string, Participant>,
    [participantsByTeam]
  );

  useEffect(() => {
    return () => {
      if (touchMoveRafRef.current !== null) {
        window.cancelAnimationFrame(touchMoveRafRef.current);
      }
    };
  }, []);

  const handleDragOver = (e: DragEvent, teamId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTeamId !== teamId) {
      setDragOverTeamId(teamId);
    }
  };

  const handleDragLeave = (e: DragEvent, teamId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverTeamId === teamId) {
      setDragOverTeamId(null);
    }
  };

  const handleDrop = (e: DragEvent, teamId: string) => {
    e.preventDefault();
    setDragOverTeamId(null);
    const studentId = e.dataTransfer.getData('text/plain') || draggingStudentId;
    if (studentId) {
      onDropOnTeam(teamId, studentId);
      onDragEndStudent();
    }
  };

  const handleTouchMoveStudent = (e: ReactTouchEvent, studentId: string) => {
    const touch = e.touches[0];
    if (!touch) return;

    latestTouchRef.current = { x: touch.clientX, y: touch.clientY, studentId };

    if (touchMoveRafRef.current !== null) {
      return;
    }

    touchMoveRafRef.current = window.requestAnimationFrame(() => {
      touchMoveRafRef.current = null;

      if (!latestTouchRef.current) return;

      const { x, y, studentId: currentStudentId } = latestTouchRef.current;
      setTouchDraggingStudentId(currentStudentId);
      setTouchPosition({ x, y });

      const target = document.elementFromPoint(x, y);
      const dropZone = target instanceof Element ? target.closest('[data-drop-team-id]') : null;
      setTouchDragOverTeamId(dropZone?.getAttribute('data-drop-team-id') || null);
    });
  };

  const handleTouchEndStudent = (studentId: string) => {
    if (touchDragOverTeamId) {
      onDropOnTeam(touchDragOverTeamId, studentId);
    }

    setTouchDraggingStudentId(null);
    setTouchDragOverTeamId(null);
    setTouchPosition(null);
  };

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3.5 w-full h-full flex-1">
      {teams.slice(0, 4).map((team) => {
        const members = participantsByTeam[team.id] || [];
        const isDragOver = dragOverTeamId === team.id;
        const { colorScheme } = team;
        const courtLabel = team.name;
        const teamNote = team.note?.trim() ?? '';
        const hasTeamNote = teamNote.length > 0;

        return (
          <div
            key={team.id}
            id={`team-box-${team.id}`}
            data-drop-team-id={team.id}
            onDragOver={(e) => handleDragOver(e, team.id)}
            onDragLeave={(e) => handleDragLeave(e, team.id)}
            onDrop={(e) => handleDrop(e, team.id)}
            className={`bg-white rounded-2xl border transition-all flex flex-col h-full soft-card-shadow relative overflow-hidden ${
              isDragOver || touchDragOverTeamId === team.id
                ? `ring-4 ring-[#D9B472]/40 border-[#D9B472] scale-[1.01] ${colorScheme.accentBg}`
                : `${colorScheme.borderAccent} hover:border-[#D9B472]/50`
            }`}
          >
            {/* Top Color Accent Line */}
            <div className={`h-1.5 w-full ${colorScheme.leadBannerBg}`} />

            {/* Team Header: Name & Count */}
            <div
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 border-b ${colorScheme.headerBorder} ${colorScheme.headerBg} flex items-center justify-between gap-1 shrink-0`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorScheme.dotColor}`} />
                <h3
                  className={`text-sm sm:text-base font-extrabold tracking-tight leading-none truncate ${colorScheme.headerText}`}
                >
                  {courtLabel}
                </h3>
                {team.assistant ? (
                  <span className="truncate text-xs font-bold text-sky-700 sm:text-sm">{team.assistant.name}</span>
                ) : null}
              </div>

              {/* Header Right: Team Note */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id={`team-note-btn-${team.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTeamNote(team.id);
                  }}
                  className={`relative h-8 rounded-full border inline-flex items-center justify-center gap-1.5 px-2.5 text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
                    hasTeamNote
                      ? 'bg-[#FFF7E0] text-[#9A5800] border-[#F2C14E] hover:bg-[#FFF2CC] shadow-[0_8px_20px_-14px_rgba(154,88,0,0.55)]'
                      : 'bg-white/90 text-slate-600 border-[#E6DFD3] hover:border-slate-300 hover:bg-white hover:text-[#1B2A3E]'
                  }`}
                  title={hasTeamNote ? `Xem ghi chú sân ${courtLabel}` : `Thêm ghi chú sân ${courtLabel}`}
                >
                  <Bell className={`w-3.5 h-3.5 ${hasTeamNote ? 'text-[#B86A00]' : ''}`} />
                  {hasTeamNote ? (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF9F1C] border border-white" />
                  ) : null}
                </button>
              </div>
            </div>

            {/* Droppable Student List Area */}
            <div className="p-2 flex-1 flex flex-col space-y-1.5 overflow-y-auto min-h-0 bg-[#FAF7F2]/40">
              {/* Drop Target Prompt */}
              {isDragOver && (
                <div className="py-1.5 px-3 rounded-full border-2 border-dashed border-[#D9B472] bg-amber-100/80 text-center text-xs font-bold text-amber-900 animate-pulse flex items-center justify-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Thả vào sân {courtLabel}</span>
                </div>
              )}

              {members.length === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isHost) {
                      onSelectEmptyTeam(team.id);
                    }
                  }}
                  className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 border-dashed text-center transition-colors ${
                    isDragOver
                      ? 'border-[#D9B472] bg-amber-100/50 text-amber-900'
                      : 'border-[#E6DFD3] bg-white/70 text-slate-500'
                  } ${isHost ? 'cursor-pointer hover:border-[#D9B472] hover:bg-amber-50/50' : 'cursor-default'}`}
                >
                  <Users className="w-5 h-5 mb-1 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">Chưa có học viên</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isHost ? 'Bấm để chọn học viên có mặt' : 'Kéo học viên thả vào đây'}
                  </p>
                </button>
              ) : (
                members.map((member) => {
                  const isAbsent = member.status === 'absent';
                  const isRecentlyMoved = recentlyMovedId === member.id;
                  const isDraggingThis = draggingStudentId === member.id;

                  return (
                    <div
                      key={member.id}
                      id={`team-member-item-${member.id}`}
                      draggable={isHost}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', member.id);
                        e.dataTransfer.effectAllowed = 'move';
                        onDragStartStudent(member.id);
                      }}
                      onDragEnd={onDragEndStudent}
                      onTouchStart={() => {
                        setTouchDraggingStudentId(member.id);
                      }}
                      onTouchMove={(e) => handleTouchMoveStudent(e, member.id)}
                      onTouchEnd={() => handleTouchEndStudent(member.id)}
                      onTouchCancel={() => {
                        setTouchDraggingStudentId(null);
                        setTouchDragOverTeamId(null);
                        setTouchPosition(null);
                      }}
                      className={`group/item py-1.5 px-3 rounded-full border flex items-center justify-between gap-1.5 select-none transition-all touch-none ${
                        isDraggingThis
                          ? 'opacity-50 border-[#D9B472] bg-amber-100 scale-95'
                          : touchDraggingStudentId === member.id
                          ? 'bg-amber-100/90 border-[#D9B472] ring-2 ring-[#D9B472]/50 shadow-xs'
                          : isRecentlyMoved
                          ? 'bg-amber-100/90 border-[#D9B472] ring-2 ring-[#D9B472]/50 shadow-xs'
                          : isAbsent
                          ? 'bg-rose-50/90 border-rose-200 text-rose-800'
                          : 'bg-white hover:bg-[#FAF7F2] border-[#E6DFD3] shadow-xs text-slate-800'
                      } ${isHost ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      {/* Name Only */}
                      <span
                        className={`text-xs sm:text-sm font-bold truncate flex-1 ${
                          isAbsent ? 'line-through text-rose-700 opacity-75' : 'text-slate-800'
                        }`}
                      >
                        {member.name}
                      </span>

                      {/* Quick Attendance Toggle Indicator */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isHost && (
                          <button
                            type="button"
                            id={`toggle-team-status-${member.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(member.id);
                            }}
                            className={`w-5 h-5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              isAbsent
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                            }`}
                            title={isAbsent ? 'Đang vắng (bấm để điểm danh)' : 'Đang có mặt (bấm để báo vắng)'}
                          >
                            {isAbsent ? (
                              <UserX className="w-3 h-3 sm:w-3 sm:h-3" />
                            ) : (
                              <UserCheck className="w-3 h-3 sm:w-3 sm:h-3 text-sky-700" />
                            )}
                          </button>
                        )}

                        {isHost && (
                          <button
                            type="button"
                            id={`remove-team-member-${member.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromTeam(member.id);
                            }}
                            className="w-5 h-5 sm:w-5 sm:h-5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa học viên khỏi nhóm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {touchDraggingStudentId && touchPosition && (
        <div
          className="fixed z-[70] pointer-events-none -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-[#1B2A3E] text-white border border-[#D9B472] shadow-2xl text-xs font-bold"
          style={{ left: touchPosition.x, top: touchPosition.y }}
        >
          {participantLookup[touchDraggingStudentId]?.name || 'Đang kéo'}
        </div>
      )}
    </div>
  );
});
