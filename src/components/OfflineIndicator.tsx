import React from "react";
import { WifiOff, Wifi, AlertCircle } from "lucide-react";
import { isNetworkOnline, onNetworkChange } from "@/lib/network";

export function OfflineIndicator() {
  const [online, setOnline] = React.useState(isNetworkOnline());

  React.useEffect(() => {
    const unsub = onNetworkChange(setOnline);
    return unsub;
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-60 bg-invicorp-danger text-white px-4 py-2 text-center text-xs font-medium shadow-panel animate-pulse-fast">
      <div className="flex items-center justify-center gap-1">
        <WifiOff className="w-3 h-3" />
        <span>Sin conexión - Algunos cambios se sincronizarán al recuperar la conexión</span>
      </div>
    </div>
  );
}
