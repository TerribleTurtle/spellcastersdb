"use client";

import { useEffect } from "react";

import Link from "next/link";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { monitoring } from "@/services/monitoring";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    monitoring.captureException(error, {
      operation: "rootError",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 rounded-full bg-status-danger-muted p-8 ring-1 ring-red-500/20">
        <AlertTriangle size={64} className="text-status-danger" />
      </div>

      <h2 className="mb-2 text-3xl font-bold tracking-tight text-text-primary">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-text-muted">
        A critical error occurred while rendering this page. The spell fizzled.
      </p>

      <div className="flex gap-4">
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="flex items-center gap-2 rounded-lg bg-surface-hover px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-surface-hover"
        >
          <RefreshCcw size={18} />
          Try again
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-brand-primary/90"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
