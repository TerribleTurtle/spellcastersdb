"use client";

import { useState } from "react";

export function SentryCrashTest() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("Sentry Debug Test: Intentional Application Crash");
  }

  return (
    <button
      onClick={() => setShouldCrash(true)}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-red-900/20"
    >
      Fire Sentry Test Error
    </button>
  );
}
