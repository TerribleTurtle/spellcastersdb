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
    <div className="fixed bottom-safe left-0 right-0 z-5000 flex justify-center pointer-events-none pb-4 md:pb-6 px-4">
      {isOnline && showBackOnline && (
        <div className="bg-status-success-muted border border-status-success-border text-status-success-text px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom shrink-0">
          <Wifi className="w-4 h-4" />
          <span>Back online</span>
        </div>
      )}

      {!isOnline && (
        <div className="bg-status-warning-muted border border-status-warning-border text-status-warning-text px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom shrink-0">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>You are currently offline</span>
        </div>
      )}
    </div>
  );
}
