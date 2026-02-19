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
    <div className="flex flex-wrap gap-4 mt-4 text-sm text-text-muted font-mono">
      <div className="flex items-center gap-2 bg-surface-dim px-3 py-1.5 rounded-full border border-border-subtle">
        <Hash size={14} className="text-brand-primary" />
        <span>
          Schema: <span className="text-text-primary font-bold">{buildVersion}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-surface-dim px-3 py-1.5 rounded-full border border-border-subtle">
        <Globe size={14} className="text-status-info-text" />
        <span className="break-all" title={apiUrl}>
          Source: <span className="text-text-primary font-bold">{apiUrl}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-surface-dim px-3 py-1.5 rounded-full border border-border-subtle">
        <Clock size={14} className="text-status-warning-text" />
        <span>
          Build Date:{" "}
          <span className="text-text-primary">
            <LocalDate iso={generatedAt} showTime />
          </span>
        </span>
      </div>
    </div>
  );
}
