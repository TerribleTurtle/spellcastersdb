"use client";

import { useEffect } from "react";

import Link from "next/link";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 rounded-full bg-red-500/10 p-8 ring-1 ring-red-500/20">
        <AlertTriangle size={64} className="text-red-500" />
      </div>

      <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-gray-400">
        A critical error occurred while rendering this page. The spell fizzled.
      </p>

      <div className="flex gap-4">
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
        >
          <RefreshCcw size={18} />
          Try again
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
