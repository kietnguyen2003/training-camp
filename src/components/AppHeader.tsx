import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { User, Room, ToastMessage } from '../types';
import { LiveIndicator } from './LiveIndicator';
import brandLogoImg from '../../assets/image.png';
import rightLogoImg from '/logo_right.png';

interface AppHeaderProps {
  room: Room;
  user: User;
  toasts?: ToastMessage[];
  onDismissToast?: (id: string) => void;
  onOpenUserMenu: () => void;
  isHost: boolean;
}

export function AppHeader({
  room,
  user,
  toasts = [],
  onDismissToast,
  onOpenUserMenu,
  isHost,
}: AppHeaderProps) {
  const activeToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-[#1B2A3E] border-b border-slate-700/80 pt-safe shrink-0 text-slate-100 shadow-md"
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand / Room Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#111C2B] border border-amber-500/40 p-1 flex items-center justify-center shadow-sm gold-glow-sm shrink-0">
            <img src={brandLogoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate leading-tight">
                {room.name}
              </h1>
              <LiveIndicator />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium leading-none mt-1">
              <span>Mã:</span>
              <span className="font-mono text-[#D9B472] font-bold bg-[#27384E] px-2 py-0.5 rounded-full text-[10px]">
                {room.code}
              </span>
              <span className="text-slate-400">•</span>
              <span className="truncate text-slate-300">{room.activity}</span>
            </div>
          </div>
        </div>

        {/* Right Slot: Toast Notifications / Mode Indicator + Avatar trigger */}
        <div className="flex items-center gap-2.5 shrink-0 relative">
          {/* Toast Notification Floating Pill (Full Text, No Truncation) */}
          <AnimatePresence mode="wait">
            {activeToast && (
              <motion.div
                key={activeToast.id}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={`absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xl border backdrop-blur-md whitespace-nowrap z-50 ${
                  activeToast.type === 'warning'
                    ? 'bg-[#1E170E]/98 text-amber-200 border-amber-500/80 shadow-amber-950/40'
                    : 'bg-[#0D1624]/98 text-white border-[#D9B472]/80 ring-1 ring-[#D9B472]/40 shadow-slate-950/60'
                }`}
              >
                {activeToast.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : activeToast.type === 'success' || !activeToast.type ? (
                  <CheckCircle2 className="w-4 h-4 text-[#D9B472] shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span className="text-xs leading-none whitespace-nowrap">{activeToast.message}</span>
                {onDismissToast && (
                  <button
                    type="button"
                    onClick={() => onDismissToast(activeToast.id)}
                    className="p-0.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer shrink-0 ml-1"
                    aria-label="Tắt thông báo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode Pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              isHost
                ? 'bg-[#D9B472]/15 text-[#E6C587] border-[#D9B472]/40'
                : 'bg-sky-500/10 text-sky-200 border-sky-400/30'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${isHost ? 'text-[#D9B472]' : 'text-sky-300'}`} />
            <span>{isHost ? 'QUẢN TRỊ (HOST)' : 'XEM (VIEWER)'}</span>
          </div>

          {/* User Avatar Button */}
          <button
            id="header-user-avatar-btn"
            onClick={onOpenUserMenu}
            className="flex items-center gap-1 p-0.5 rounded-full hover:bg-slate-800 active:scale-95 transition-all border border-slate-600 bg-[#25354A] shadow-sm focus:outline-hidden cursor-pointer shrink-0"
            aria-label="Open user settings menu"
          >
            <div className="relative">
              <img
                src={rightLogoImg}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1B2A3E] bg-[#D9B472]"
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
