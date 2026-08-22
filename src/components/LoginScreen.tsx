import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, RefreshCw } from 'lucide-react';
import logoImg from '../../assets/image.png';
import { getAccessRoleFromCode } from '../utils/hostAuth';

interface LoginScreenProps {
  onHostSuccess: () => void;
  onViewerCodeLogin: (studentCode: string) => Promise<boolean>;
  onError?: (msg: string) => void;
}

export function LoginScreen({ onHostSuccess, onViewerCodeLogin, onError }: LoginScreenProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsConnecting(true);

    const accessRole = getAccessRoleFromCode(accessCode);

    if (accessRole === 'host') {
      onHostSuccess();
      setAccessCode('');
      setIsConnecting(false);
      return;
    }

    const isViewer = await onViewerCodeLogin(accessCode);
    if (!isViewer && onError) {
      onError('Không tìm thấy mã học viên trong lớp này');
    }

    if (isViewer) {
      setAccessCode('');
    }
    setIsConnecting(false);
  };

  return (
    <div
      id="login-screen"
      className="min-h-[100dvh] flex flex-col justify-between bg-[#F7F3E9] px-4 sm:px-6 py-6 sm:py-8 pt-safe pb-safe text-slate-800 relative overflow-hidden"
    >
      {/* Ambient Soft Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D9B472]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div />

      {/* Main Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto flex flex-col items-center text-center my-auto py-8 px-6 sm:px-8 bg-[#1B2A3E] text-white rounded-3xl shadow-2xl border border-slate-700/80 relative z-10"
      >
        {/* Brand Logo Header */}
        <div className="relative mb-5 group cursor-pointer">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#111C2B] border-2 border-[#D9B472]/60 p-2.5 shadow-xl gold-glow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <img
              src={logoImg}
              alt="TeamFlow Logo"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#D9B472] border-2 border-[#1B2A3E] flex items-center justify-center text-[#1B2A3E] shadow-lg">
            <Zap className="w-4.5 h-4.5 fill-current text-[#1B2A3E]" />
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2 justify-center">
          Team<span className="text-gold-gradient">Flow</span>
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed font-medium">
          Chào mừng đến với Neverland Training Camp
        </p>

        <form className="w-full space-y-3 mt-8" onSubmit={handleSubmit}>
          <label htmlFor="access-code" className="block text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Mã học viên hoặc mã host
            </span>
            <input
              id="access-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Ví dụ: SV01"
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-[#111C2B] px-4 py-3.5 text-center text-xl font-black tracking-[0.12em] uppercase text-white outline-hidden placeholder:text-slate-500 focus:border-[#D9B472]"
            />
          </label>

          <button
            id="host-sign-in-btn"
            type="submit"
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-[#D9B472] hover:bg-[#C9A461] text-[#1B2A3E] font-black text-base shadow-md active:scale-[0.98] transition-all min-h-[52px] cursor-pointer border border-[#E6C587]"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#1B2A3E]" />
                Đang xác thực...
              </span>
            ) : (
              'Vào TeamFlow'
            )}
          </button>
        </form>
      </motion.div>

      <div />
    </div>
  );
}
