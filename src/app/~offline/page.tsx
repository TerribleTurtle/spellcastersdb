"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-surface-main/50 p-8 rounded-2xl border border-brand-primary/20 flex flex-col items-center max-w-md w-full backdrop-blur-sm">
        <div className="bg-brand-primary/10 p-4 rounded-full mb-6">
          <WifiOff className="w-12 h-12 text-brand-primary animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2 font-heading tracking-wide">
          You are offline
        </h1>

        <p className="text-text-secondary mb-8">
          This page hasn&apos;t been cached yet. Please check your network
          connection and try again to view this content.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/50 transition-colors px-6 py-2 rounded-lg font-medium tracking-wide w-full"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
