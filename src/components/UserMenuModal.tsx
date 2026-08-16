import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, UserCheck } from 'lucide-react';
import { User } from '../types';

interface UserMenuModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSignOut: () => void;
}

export function UserMenuModal({
  isOpen,
  user,
  onClose,
  onSignOut,
}: UserMenuModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="user-menu-modal-wrapper" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          id="user-menu-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal / Sheet Container */}
        <motion.div
          id="user-menu-modal"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 z-10 pb-safe sm:pb-5 max-h-[90dvh] flex flex-col"
        >
          {/* Mobile drag handle */}
          <div className="flex justify-center sm:hidden -mt-1 mb-3">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Header & User Profile */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/30"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-extrabold text-base">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {user.name}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="close-user-menu-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Host access note */}
            <div className="p-3 rounded-2xl bg-[#112238] border border-slate-700/80 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Đang ở chế độ host</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Phiên đăng nhập này được mở bằng mã truy cập host và chỉ lưu cục bộ trên thiết bị hiện tại.
              </p>
            </div>

            {/* Sign out */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                id="sign-out-btn"
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 active:scale-[0.98] transition-all min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
