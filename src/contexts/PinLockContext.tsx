import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface PinLockContextType {
  isLocked: boolean;
  lock: () => void;
}

const PinLockContext = createContext<PinLockContextType | null>(null);

export function PinLockProvider({ children }: { children: React.ReactNode }) {
  const { isLocked, setLocked, clearSession } = useAuthStore();

  const lock = useCallback(() => {
    setLocked(true);
    clearSession();
  }, [setLocked, clearSession]);

  return (
    <PinLockContext.Provider value={{ isLocked, lock }}>
      {children}
    </PinLockContext.Provider>
  );
}

export function usePinLock() {
  const ctx = useContext(PinLockContext);
  if (!ctx) throw new Error("usePinLock debe usarse dentro de PinLockProvider");
  return ctx;
}
