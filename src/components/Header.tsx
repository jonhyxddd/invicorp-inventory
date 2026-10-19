import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { usePinLock } from "@/contexts/PinLockContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, business, clearSession } = useAuthStore();
  const { lock } = usePinLock();

  return (
    <header className="sticky top-0 z-40 bg-invicorp-dark/90 backdrop-blur-md border-b border-invicorp-line safe-area-top">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-invicorp-muted hover:text-invicorp-text hover:bg-invicorp-line/50 transition-colors lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-invicorp-accent/20 rounded-lg flex items-center justify-center text-invicorp-accent font-bold text-xs shadow-glow">
                I
              </div>
              <span className="font-bold text-xl tracking-tight text-invicorp-text">INVICORP<span className="text-invicorp-accent">INVENTORY</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-invicorp-muted" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="pl-9 pr-4 py-2 bg-invicorp-panel2 border border-invicorp-line rounded-full text-sm text-invicorp-text placeholder-invicorp-muted/60 focus:outline-none focus:border-invicorp-accent w-64"
              />
            </div>

            <button className="p-2 rounded-full text-invicorp-muted hover:text-invicorp-accent hover:bg-invicorp-line/50 transition-colors relative" aria-label="Notificaciones">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-invicorp-danger rounded-full border-2 border-invicorp-dark" />
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-invicorp-line/50">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-medium text-invicorp-text">{user?.full_name || "Usuario"}</p>
                <p className="text-xs text-invicorp-muted">{user?.role || ""}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-invicorp-accent to-invicorp-accent2 rounded-full flex items-center justify-center text-invicorp-dark text-sm font-bold shadow-glow">
                {(user?.full_name || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => lock()}
              className="p-2 text-invicorp-muted hover:text-invicorp-danger hover:bg-invicorp-danger/10 rounded-lg transition-colors"
              aria-label="Bloquear aplicación"
              title="Bloquear aplicación"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
