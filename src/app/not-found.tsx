import Link from "next/link";

import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 rounded-full bg-white/5 p-8 ring-1 ring-white/10">
        <Ghost size={64} className="text-brand-primary animate-pulse" />
      </div>

      <h2 className="mb-2 text-4xl font-bold tracking-tight text-white">
        Lost in the Void?
      </h2>
      <p className="mb-8 max-w-md text-gray-400">
        The page you are looking for has been banished to another dimension (or
        never existed in this one).
      </p>

      <Link
        href="/"
        className="rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-transform hover:scale-105 hover:bg-brand-primary/90"
      >
        Return to Safety
      </Link>
    </div>
  );
}
