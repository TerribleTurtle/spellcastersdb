"use client";

import { useEffect, useState } from "react";

import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Avoid synchronous setState within effect by using setTimeout
    const initTimer = setTimeout(() => {
      setHasMounted(true);
      if (typeof window !== "undefined") {
        setIsOnline(navigator.onLine);
      }
    }, 0);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!hasMounted) return null;

  if (isOnline && !showBackOnline) return null;

  return (
    <div className="flex items-center" data-testid="offline-indicator">
      {isOnline && showBackOnline && (
        <div className="bg-status-success-muted border border-status-success-border text-status-success-text px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1.5 text-xs font-medium animate-in fade-in slide-in-from-left-2 shrink-0">
          <Wifi className="w-3.5 h-3.5" />
          <span>Back online</span>
        </div>
      )}

      {!isOnline && (
        <div className="bg-status-warning-muted border border-status-warning-border text-status-warning-text px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1.5 text-xs font-medium animate-in fade-in slide-in-from-left-2 shrink-0">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline mode</span>
        </div>
      )}
    </div>
  );
}
