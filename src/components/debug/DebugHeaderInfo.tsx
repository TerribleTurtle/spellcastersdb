"use client";

import { LocalDate } from "@/components/ui/LocalDate";
import { Clock, Globe, Hash } from "lucide-react";

interface DebugHeaderInfoProps {
  buildVersion: string;
  generatedAt: string;
  apiUrl: string;
}

export function DebugHeaderInfo({
  buildVersion,
  generatedAt,
  apiUrl,
}: DebugHeaderInfoProps) {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400 font-mono">
      <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
        <Hash size={14} className="text-brand-primary" />
        <span>
          Schema: <span className="text-white font-bold">{buildVersion}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
        <Globe size={14} className="text-blue-400" />
        <span className="break-all" title={apiUrl}>
          Source: <span className="text-white font-bold">{apiUrl}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
        <Clock size={14} className="text-yellow-400" />
        <span>
          Build Date:{" "}
          <span className="text-white">
            <LocalDate iso={generatedAt} showTime />
          </span>
        </span>
      </div>
    </div>
  );
}
