"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry with strict PII filters applied automatically
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="antialiased min-h-screen bg-brand-surface text-brand-neutral flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-md">
          <h2 className="text-2xl font-bold font-heading text-brand-error">
            Something went wrong!
          </h2>
          <p className="text-brand-neutral-light">
            An unexpected error occurred. This has been reported without
            exposing any of your personal data.
          </p>
          <button
            className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
