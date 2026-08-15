export function RoomSkeleton() {
  return (
    <div id="room-skeleton" className="space-y-4 animate-pulse">
      {/* Header Summary Skeleton */}
      <div className="bg-[#112238] rounded-2xl p-4 border border-slate-800 h-28 flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-4 bg-slate-800 rounded-md w-1/2" />
      </div>

      {/* Unassigned Skeleton */}
      <div className="bg-[#112238] rounded-2xl p-4 border border-amber-500/20 h-36 flex flex-col gap-2">
        <div className="h-5 bg-slate-800 rounded-md w-1/3" />
        <div className="h-9 bg-[#0D1B2E] rounded-xl" />
        <div className="h-9 bg-[#0D1B2E] rounded-xl" />
      </div>

      {/* Team Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#112238] rounded-2xl p-4 border border-slate-800 h-44 flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-slate-800 rounded-md w-24" />
              <div className="h-5 bg-slate-800 rounded-full w-16" />
            </div>
            <div className="h-10 bg-[#0D1B2E] rounded-xl" />
            <div className="h-8 bg-[#0D1B2E] rounded-xl" />
            <div className="h-8 bg-[#0D1B2E] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

