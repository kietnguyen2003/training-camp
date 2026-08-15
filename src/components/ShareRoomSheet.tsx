import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Link2, Share2, Users } from 'lucide-react';
import { Room } from '../types';

interface ShareRoomSheetProps {
  isOpen: boolean;
  room: Room;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export function ShareRoomSheet({
  isOpen,
  room,
  onClose,
  onShowToast,
}: ShareRoomSheetProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const viewerLink = `${window.location.origin}/join/${room.code.toLowerCase()}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      onShowToast(`Room code ${room.code} copied!`, 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      onShowToast(`Code: ${room.code}`, 'info');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(viewerLink);
      setCopiedLink(true);
      onShowToast('Viewer link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onShowToast('Link copied!', 'info');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${room.name} on TeamFlow`,
          text: `Watch live team assignments for ${room.name}. Room code: ${room.code}`,
          url: viewerLink,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <div id="share-room-modal-wrapper" className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          id="share-room-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Sheet Container */}
        <motion.div
          id="share-room-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#0D1B2E] border border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-5 z-10 pb-safe max-h-[90dvh] flex flex-col"
        >
          {/* Drag handle */}
          <div className="flex justify-center -mt-1 mb-3">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Share with Viewers
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Allow participants to watch team assignments live
                </span>
              </div>
            </div>

            <button
              type="button"
              id="close-share-sheet-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close share sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 overflow-y-auto">
            {/* Room Code Display Box */}
            <div className="bg-[#112238] rounded-2xl p-5 border border-slate-700/80 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                Room Code
              </span>
              <div className="font-mono text-3xl font-extrabold text-amber-400 tracking-wider my-1 select-all gold-glow-sm">
                {room.code}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Share this code with viewers on mobile or desktop
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Copy Code */}
              <button
                type="button"
                id="share-copy-code-btn"
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all min-h-[48px] shadow-md cursor-pointer gold-glow-sm"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Code Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              {/* Copy Link */}
              <button
                type="button"
                id="share-copy-link-btn"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 active:scale-[0.98] transition-all min-h-[48px] border border-sky-500/30 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-sky-400 stroke-[3]" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Copy Viewer Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Native Share button if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                id="native-share-btn"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Open Native Share Sheet</span>
              </button>
            )}

            {/* Live Viewer info */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Viewers will see updates with live status and instant assignment animations.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

