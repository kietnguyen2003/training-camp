/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SUPABASE_URL: string;
  readonly VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_PUBLIC_SUPABASE_ANON_KEY: string;
  readonly VITE_PUBLIC_SUPABASE_GOOGLE_CALLBACK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const value: string;
  export default value;
}
