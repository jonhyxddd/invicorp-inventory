import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { Bell, Check, Package, AlertCircle, ArrowRight, Clock } from "lucide-react";
import notificationService from "@/services/notificationService";

export function Notifications() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list({ page: 1, pageSize: 50 }),
  });

  const notifications = data?.data || [];

  const typeIcons: Record<string, React.ElementType> = {
    stock_bajo: AlertCircle,
    stock_agotado: Package,
    entrada: Package,
    salida: Package,
    ajuste: Clock,
    administrativo: Bell,
  };

  const typeColors: Record<string, string> = {
    stock_bajo: "text-invicorp-warn",
    stock_agotado: "text-invicorp-danger",
    entrada: "text-invicorp-success",
    salida: "text-invicorp-danger",
    ajuste: "text-invicorp-warn",
    administrativo: "text-invicorp-accent",
  };

  if (isLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-invicorp-accent/30 border-t-full rounded-full animate-spin mb-4" />
        <p className="text-invicorp-muted">Cargando notificaciones...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Notificaciones</h1>
          <p className="text-invicorp-muted">{unreadCount} sin leer</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => notificationService.markAllAsRead()}
            className="text-xs text-invicorp-accent hover:text-invicorp-accent/80 font-medium"
          >
            Marcar todo como leído
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n: any) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div
                key={n.id}
                className={`glass-panel-2 p-4 rounded-xl flex items-center justify-between transition-all ${
                  !n.is_read ? "border-l-4 border-invicorp-accent bg-invicorp-panel/50" : "opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[n.type] || "text-invicorp-text"}/10 ${typeColors[n.type] || "text-invicorp-text"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-invicorp-text">{n.title}</p>
                    <p className="text-xs text-invicorp-muted">{n.message}</p>
                    <p className="text-xs text-invicorp-muted/60 mt-1">
                      {new Date(n.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => notificationService.markAsRead(n.id)}
                    className="text-invicorp-muted hover:text-invicorp-accent p-2"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <ArrowRight className="w-4 h-4 text-invicorp-muted/50" />
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-8 rounded-xl text-center">
            <Bell className="w-12 h-12 text-invicorp-muted/30 mx-auto mb-4" />
            <p className="text-invicorp-text font-semibold">No hay notificaciones</p>
            <p className="text-invicorp-muted text-sm">Mantente al tanto de las alertas de stock y movimientos</p>
          </div>
        )}
      </div>
    </div>
  );
}
