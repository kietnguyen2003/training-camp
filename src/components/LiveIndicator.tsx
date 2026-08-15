interface LiveIndicatorProps {
  label?: string;
  className?: string;
}

export function LiveIndicator({ label = 'Live', className = '' }: LiveIndicatorProps) {
  return (
    <div
      id="live-indicator"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold tracking-wide ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
      </span>
      <span>{label}</span>
    </div>
  );
}

