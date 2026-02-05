"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

const BANNER_DISMISSED_KEY = "sc_beta_banner_dismissed";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
    setIsHydrated(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  // Prevent flash or mismatch during hydration
  if (!isHydrated || !isVisible) return null;

  return (
    <div className="relative w-full z-40 bg-linear-to-r from-yellow-900/90 to-orange-900/90 backdrop-blur-sm border-b border-yellow-500/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
            <div className="text-sm">
              <span className="font-bold text-yellow-100">Beta Data Warning:</span>{" "}
              <span className="text-yellow-200">
                This database contains Beta 2 and stub data. We&apos;ll update with accurate Early Access data on{" "}
                <strong className="text-yellow-100">February 26th</strong>.
              </span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-400 hover:text-yellow-200 transition-colors shrink-0"
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
