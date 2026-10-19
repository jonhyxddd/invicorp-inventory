import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { User, Lock, Shield, Bell, Globe, Palette, RotateCcw, Save } from "lucide-react";

export function Settings() {
  const { user } = useAuthStore();
  const [autoLock, setAutoLock] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("es");

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Configuración</h1>
          <p className="text-invicorp-muted">Preferencias de la aplicación</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl">
        <div className="p-6 border-b border-invicorp-line">
          <h2 className="text-lg font-bold text-invicorp-text flex items-center gap-2">
            <User className="w-5 h-5" /> Perfil de usuario
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-invicorp-text">{user?.full_name || "Usuario"}</p>
            <p className="text-xs text-invicorp-muted">{user?.email || "—"}</p>
            <p className="text-xs text-invicorp-muted">{user?.role || "—"}</p>
          </div>

          <div className="pt-4 border-t border-invicorp-line">
            <p className="text-sm font-medium text-invicorp-text mb-4">Cambiar PIN</p>
            <button className="flex items-center gap-2 text-invicorp-accent hover:text-invicorp-accent/80 font-medium">
              <Lock className="w-4 h-4" /> Configurar nuevo PIN
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 glass-panel rounded-xl">
        <div className="p-6 border-b border-invicorp-line">
          <h2 className="text-lg font-bold text-invicorp-text flex items-center gap-2">
            <Shield className="w-5 h-5" /> Seguridad
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-invicorp-text">Bloqueo automático</p>
              <p className="text-xs text-invicorp-muted">Bloquear la app tras {autoLock} minutos de inactividad</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoLock((p) => Math.max(5, p - 5))}
                className="w-8 h-8 rounded-lg bg-invicorp-panel2 border border-invicorp-line flex items-center justify-center text-invicorp-text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-invicorp-text w-8 text-center">{autoLock} min</span>
              <button
                onClick={() => setAutoLock((p) => p + 5)}
                className="w-8 h-8 rounded-lg bg-invicorp-panel2 border border-invicorp-line flex items-center justify-center text-invicorp-text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-invicorp-text">Notificaciones push</p>
              <p className="text-xs text-invicorp-muted">Recibir alertas de stock y movimientos</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 rounded border-invicorp-line text-invicorp-accent focus:ring-invicorp-accent bg-invicorp-panel2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 glass-panel rounded-xl">
        <div className="p-6 border-b border-invicorp-line">
          <h2 className="text-lg font-bold text-invicorp-text flex items-center gap-2">
            <Globe className="w-5 h-5" /> Idioma y región
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-invicorp-text">Idioma</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="ml-4 input-field w-48"
            >
              <option value="es">Español (Latinoamérica)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="btn-primary"
          onClick={() => {
            // Guardar configuración
          }}
        >
          <Save className="w-4 h-4 mr-2" /> Guardar cambios
        </button>
      </div>
    </div>
  );
}
