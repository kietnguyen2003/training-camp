import { Crown, Sparkles } from 'lucide-react';
import { TeamLead as TeamLeadType, TeamColorScheme } from '../types';

interface TeamLeadProps {
  lead: TeamLeadType;
  colorScheme: TeamColorScheme;
}

export function TeamLead({ lead, colorScheme }: TeamLeadProps) {
  return (
    <div
      id={`team-lead-${lead.id}`}
      className={`flex items-center justify-between p-3.5 rounded-2xl ${colorScheme.leadBannerBg} text-white shadow-xs transition-all`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          {lead.avatar ? (
            <img
              src={lead.avatar}
              alt={lead.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/90 shadow-2xs"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full ${colorScheme.leadAvatarBg} flex items-center justify-center font-black text-xs ring-2 ring-white/90 shadow-2xs`}
            >
              {lead.name.charAt(0)}
            </div>
          )}
          <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-0.5 rounded-full shadow-xs">
            <Crown className="w-2.5 h-2.5" />
          </div>
        </div>

        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 block leading-tight">
            {lead.badgeTitle || 'Team Captain'}
          </span>
          <span className="font-bold text-sm text-white truncate block">
            {lead.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/20 backdrop-blur-xs shrink-0">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>Lead</span>
      </div>
    </div>
  );
}
