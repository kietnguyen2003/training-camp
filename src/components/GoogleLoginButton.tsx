interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  text?: string;
}

export function GoogleLoginButton({
  onClick,
  isLoading = false,
  text = 'Continue with Google',
}: GoogleLoginButtonProps) {
  return (
    <button
      id="google-sign-in-btn"
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-[#D9B472] hover:bg-[#C9A461] text-[#1B2A3E] font-black text-base shadow-md active:scale-[0.98] transition-all min-h-[52px] cursor-pointer border border-[#E6C587]"
    >
      {/* Official Google 'G' icon */}
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span>{isLoading ? 'Đang kết nối...' : text}</span>
    </button>
  );
}

