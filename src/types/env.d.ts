/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AUTO_LOCK_MINUTES?: string;
  readonly VITE_LOW_STOCK_THRESHOLD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    supabase?: any;
    verifyPin?: (pin: string, hash: string, salt: string) => Promise<boolean>;
    generateSalt?: () => Promise<string>;
    hashPin?: (pin: string, salt: string) => Promise<string>;
    updateUserPin?: (userId: string, hash: string, salt: string) => Promise<void>;
    recordFailedPinAttempt?: (userId: string) => Promise<void>;
    resetPinAttempts?: (userId: string) => Promise<void>;
    supabaseAdmin?: any;
  }
}

export {};
