import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, RefreshCw } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton';
import logoImg from '../../assets/image.png';
import { supabase } from '../supabaseClient';

interface LoginScreenProps {
  onError?: (msg: string) => void;
}

function resolveOAuthRedirectUrl() {
  const configuredUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    if (configuredUrl.includes('/auth/v1/callback')) {
      console.warn(
        'Ignoring VITE_PUBLIC_SITE_URL because it points to the Supabase callback URL. Use your app URL instead.'
      );
    } else {
      return configuredUrl;
    }
  }

  return new URL(window.location.pathname, window.location.origin).toString();
}

export function LoginScreen({ onError }: LoginScreenProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsConnecting(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: resolveOAuthRedirectUrl(),
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        setIsConnecting(false);
        if (onError) onError(error.message);
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      setIsConnecting(false);
      if (onError) onError(err.message || 'Đăng nhập bằng Google thất bại');
    }
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

        {/* Google Authentication Action */}
        <div className="w-full space-y-3 mt-8">
          <GoogleLoginButton
            onClick={handleGoogleLogin}
            isLoading={isConnecting}
            text={
              isConnecting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1B2A3E]" />
                  Đang đăng nhập bằng Google...
                </span>
              ) : (
                'Đăng nhập bằng Google'
              )
            }
          />
        </div>
      </motion.div>

      <div />
    </div>
  );
}
