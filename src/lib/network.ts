let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
const listeners = new Set<(online: boolean) => void>();

export function isNetworkOnline(): boolean {
  return isOnline;
}

export function onNetworkChange(cb: (online: boolean) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("online", () => {
    isOnline = true;
    listeners.forEach((cb) => cb(true));
  });
  window.addEventListener("offline", () => {
    isOnline = false;
    listeners.forEach((cb) => cb(false));
  });
}

export function waitForOnline(timeoutMs = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline) {
      resolve();
      return;
    }
    const timer = setTimeout(() => reject(new Error("Tiempo de espera agotado sin conexión")), timeoutMs);
    const unsub = onNetworkChange((online) => {
      if (online) {
        clearTimeout(timer);
        unsub();
        resolve();
      }
    });
  });
}
