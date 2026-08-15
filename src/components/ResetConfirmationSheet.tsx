import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ResetConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export function ResetConfirmationSheet({
  isOpen,
  onClose,
  onConfirmReset,
}: ResetConfirmationSheetProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="reset-confirm-modal-wrapper" className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          id="reset-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Sheet Container */}
        <motion.div
          id="reset-confirm-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-5 z-10 pb-safe"
        >
          {/* Drag handle */}
          <div className="flex justify-center -mt-1 mb-3">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3 ring-8 ring-rose-500/10">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              Đặt lại danh sách xếp sân?
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              Tất cả các học sinh sẽ được đưa trở lại danh sách Chờ xếp sân. Danh sách các Sân tập & Trợ giảng vẫn giữ nguyên.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              id="confirm-reset-teams-btn"
              onClick={() => {
                onConfirmReset();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.98] transition-all min-h-[48px] shadow-md cursor-pointer"
            >
              Bỏ xếp sân tất cả học sinh
            </button>

            <button
              type="button"
              id="cancel-reset-teams-btn"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 active:bg-slate-600 transition-all min-h-[48px] cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

