"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, X } from "lucide-react";

const BANNER_DISMISSED_KEY = "sc_beta_banner_dismissed";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Legacy cleanup: Remove the permanent dismissal key so users get the new session behavior
    if (typeof window !== "undefined") {
      localStorage.removeItem(BANNER_DISMISSED_KEY);
    }

    const isDismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (!isDismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Safe: Client-side only initialization
      setIsVisible(true);
    }
    setIsHydrated(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  // Prevent flash or mismatch during hydration
  if (!isHydrated || !isVisible) return null;

  return (
    <>
      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2 bg-linear-to-r from-yellow-900/40 to-orange-900/40 backdrop-blur-md rounded-full border border-status-warning-border px-3 py-1.5 shadow-sm hover:bg-yellow-900/60 transition-colors">
          <AlertTriangle
            className="text-status-warning-text shrink-0"
            size={14}
          />
          <span className="text-xs font-bold text-yellow-100 whitespace-nowrap hidden sm:inline">
            Beta Data: Not Final
          </span>
          <span className="text-xs font-bold text-yellow-100 whitespace-nowrap sm:hidden">
            Beta
          </span>
          <button
            onClick={handleDismiss}
            className="text-status-warning-text/80 hover:text-yellow-100 transition-colors ml-1 p-2 -mr-2 rounded-full hover:bg-surface-card"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
