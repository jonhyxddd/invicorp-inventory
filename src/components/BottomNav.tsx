import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Plus,
  Truck,
  Bell,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
  { icon: Package, label: "Productos", path: "/productos" },
  { icon: Plus, label: "Entradas", path: "/movimientos/entrada" },
  { icon: Truck, label: "Salidas", path: "/movimientos/salida" },
  { icon: Bell, label: "Alertas", path: "/notificaciones" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const [activePath, setActivePath] = React.useState("/dashboard");

  // Simple active detection
  const updateActive = () => {
    const current = window.location.pathname;
    const match = NAV_ITEMS.find((item) => current.startsWith(item.path));
    setActivePath(match ? match.path : "/dashboard");
  };

  React.useEffect(() => {
    updateActive();
    window.addEventListener("popstate", updateActive);
    return () => window.removeEventListener("popstate", updateActive);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-invicorp-dark/95 backdrop-blur-md border-t border-invicorp-line safe-area-bottom px-4 py-3"
      aria-label="Navegación principal"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-around gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path || activePath.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl min-w-[60px] ${
                isActive
                  ? "bg-invicorp-accent/10 text-invicorp-accent border border-invicorp-accent/20"
                  : "text-invicorp-muted hover:text-invicorp-text hover:bg-invicorp-panel2/50"
              } transition-colors`}
              aria-label={item.label}
              aria-pressed={isActive}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-invicorp-accent" : "text-invicorp-muted"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-invicorp-accent" : "text-invicorp-muted"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
