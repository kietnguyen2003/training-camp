import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      id="toast-container"
      className="fixed top-2.5 right-14 sm:right-16 z-50 flex flex-col items-end pointer-events-none space-y-1.5 pt-safe max-w-[280px] sm:max-w-xs"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success' || !toast.type;
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              id={`toast-${toast.id}`}
              initial={{ opacity: 0, x: 25, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full shadow-xl border backdrop-blur-md text-xs font-bold ${
                isWarning
                  ? 'bg-[#1D160C]/95 text-amber-200 border-amber-500/70'
                  : isSuccess
                  ? 'bg-[#111C2B]/95 text-white border-[#D9B472]/70 ring-1 ring-[#D9B472]/30'
                  : 'bg-[#111C2B]/95 text-white border-slate-700'
              }`}
            >
              {isWarning ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D9B472] shrink-0" />
              ) : (
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
              <span className="flex-1 truncate max-w-[200px] sm:max-w-[240px]">{toast.message}</span>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => onDismiss(toast.id)}
                className="p-0.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss toast"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
