import { memo, useEffect, useRef, useState, type DragEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { Sparkles, Users } from 'lucide-react';
import { Participant, Team } from '../types';

interface LevelGrid2x2Props {
  teams: Team[];
  participantsByLevel: Record<number, Participant[]>;
  participantLookup: Record<string, Participant>;
  isHost: boolean;
  draggingStudentId: string | null;
  recentlyMovedId: string | null;
  onDragStartStudent: (studentId: string) => void;
  onDragEndStudent: () => void;
  onDropOnLevel: (level: number, studentId: string) => void;
}

export const LevelGrid2x2 = memo(function LevelGrid2x2({
  teams,
  participantsByLevel,
  participantLookup,
  isHost,
  draggingStudentId,
  recentlyMovedId,
  onDragStartStudent,
  onDragEndStudent,
  onDropOnLevel,
}: LevelGrid2x2Props) {
  const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);
  const [touchDraggingParticipantId, setTouchDraggingParticipantId] = useState<string | null>(null);
  const [touchDragOverLevel, setTouchDragOverLevel] = useState<number | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const touchMoveRafRef = useRef<number | null>(null);
  const latestTouchRef = useRef<{ x: number; y: number; participantId: string } | null>(null);

  useEffect(() => {
    return () => {
      if (touchMoveRafRef.current !== null) {
        window.cancelAnimationFrame(touchMoveRafRef.current);
      }
    };
  }, []);

  const handleDragOver = (e: DragEvent, level: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLevel !== level) {
      setDragOverLevel(level);
    }
  };

  const handleDragLeave = (e: DragEvent, level: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverLevel === level) {
      setDragOverLevel(null);
    }
  };

  const handleDrop = (e: DragEvent, level: number) => {
    e.preventDefault();
    setDragOverLevel(null);
    const studentId = e.dataTransfer.getData('text/plain') || draggingStudentId;
    if (studentId) {
      onDropOnLevel(level, studentId);
      onDragEndStudent();
    }
  };

  const handleTouchMoveParticipant = (e: ReactTouchEvent, participantId: string) => {
    const touch = e.touches[0];
    if (!touch) return;

    latestTouchRef.current = { x: touch.clientX, y: touch.clientY, participantId };

    if (touchMoveRafRef.current !== null) {
      return;
    }

    touchMoveRafRef.current = window.requestAnimationFrame(() => {
      touchMoveRafRef.current = null;

      if (!latestTouchRef.current) return;

      const { x, y, participantId: currentParticipantId } = latestTouchRef.current;
      setTouchDraggingParticipantId(currentParticipantId);
      setTouchPosition({ x, y });

      const target = document.elementFromPoint(x, y);
      const dropZone = target instanceof Element ? target.closest('[data-drop-level]') : null;
      const level = dropZone?.getAttribute('data-drop-level');
      setTouchDragOverLevel(level === null || level === undefined ? null : Number(level));
    });
  };

  const handleTouchEndParticipant = (participantId: string) => {
    if (touchDragOverLevel !== null) {
      onDropOnLevel(touchDragOverLevel, participantId);
    }

    setTouchDraggingParticipantId(null);
    setTouchDragOverLevel(null);
    setTouchPosition(null);
  };

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 w-full h-full flex-1">
      {teams.slice(0, 4).map((team, index) => {
        const members = participantsByLevel[index] || [];
        const isDragOver = dragOverLevel === index;
        const { colorScheme } = team;
        const levelLabel = `Level ${index}`;

        return (
          <div
            key={`level-grid-${team.id}`}
            data-drop-level={index}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={(e) => handleDragLeave(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`bg-[#112238] rounded-2xl border-2 transition-all flex flex-col h-full shadow-lg relative overflow-hidden ${
              isDragOver || touchDragOverLevel === index
                ? 'ring-4 ring-amber-400/40 border-amber-400 scale-[1.01]'
                : `${colorScheme.borderAccent} hover:border-slate-600`
            }`}
          >
            <div className={`h-1.5 w-full ${colorScheme.leadBannerBg}`} />

            <div
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 border-b ${colorScheme.headerBorder} ${colorScheme.headerBg} flex items-center justify-between gap-1 shrink-0`}
            >
              <div className="min-w-0">
                <h3 className={`text-sm sm:text-base font-extrabold tracking-tight leading-none truncate ${colorScheme.headerText}`}>
                  {levelLabel}
                </h3>
              </div>

              <span
                className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${colorScheme.badgeBg}`}
              >
                {members.length} HV
              </span>
            </div>

            <div className="p-2 flex-1 flex flex-col space-y-1.5 overflow-y-auto min-h-0 bg-[#FAF7F2]/40">
              {isDragOver && (
                <div className="py-1.5 px-3 rounded-full border-2 border-dashed border-[#D9B472] bg-amber-100/80 text-center text-xs font-bold text-amber-900 animate-pulse flex items-center justify-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Thả vào {levelLabel}</span>
                </div>
              )}

              {members.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 border-dashed border-[#E6DFD3] bg-white/70 text-center text-slate-500">
                  <Users className="w-5 h-5 mb-1 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">Chưa có học viên</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Kéo học viên vào level này</p>
                </div>
              ) : (
                members.map((member) => {
                  const isDraggingThis = draggingStudentId === member.id;
                  const isRecentlyMoved = recentlyMovedId === member.id;

                  return (
                    <div
                      key={`level-member-${member.id}`}
                      draggable={isHost}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', member.id);
                        e.dataTransfer.effectAllowed = 'move';
                        onDragStartStudent(member.id);
                      }}
                      onDragEnd={onDragEndStudent}
                      onTouchStart={() => {
                        setTouchDraggingParticipantId(member.id);
                      }}
                      onTouchMove={(e) => handleTouchMoveParticipant(e, member.id)}
                      onTouchEnd={() => handleTouchEndParticipant(member.id)}
                      onTouchCancel={() => {
                        setTouchDraggingParticipantId(null);
                        setTouchDragOverLevel(null);
                        setTouchPosition(null);
                      }}
                      className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between gap-2 select-none transition-all touch-none ${
                        isDraggingThis
                          ? 'opacity-40 border-amber-400 bg-amber-500/20 scale-95'
                          : touchDraggingParticipantId === member.id
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                          : isRecentlyMoved
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                          : 'bg-[#0D1B2E] hover:bg-slate-800 border-slate-800 shadow-xs text-slate-100'
                      } ${isHost ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      <span className="text-xs sm:text-sm font-semibold truncate flex-1 text-slate-100">
                        {member.name}
                      </span>

                      {member.studentCode && (
                        <span className="text-[10px] font-mono text-slate-400 font-semibold px-1 py-0.5 bg-slate-800 rounded shrink-0">
                          {member.studentCode}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {touchDraggingParticipantId && touchPosition && (
        <div
          className="fixed z-[70] pointer-events-none -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-[#1B2A3E] text-white border border-[#D9B472] shadow-2xl text-xs font-bold"
          style={{ left: touchPosition.x, top: touchPosition.y }}
        >
          {participantLookup[touchDraggingParticipantId]?.name || 'Đang kéo'}
        </div>
      )}
    </div>
  );
});
