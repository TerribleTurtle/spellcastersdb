"use client";


import { Ghost } from "lucide-react";
import { Spawner } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatEntityName } from "@/services/utils/formatting";

interface SpawnerListProps {
  spawners?: Spawner[];
  isCompact?: boolean;
}

export function SpawnerList({ spawners, isCompact }: SpawnerListProps) {
  if (!spawners || spawners.length === 0) return null;

  return (
    <>
      {spawners.map((spawn, i) => (
        <div
          key={`spawn-${i}`}
          className={cn(
            "flex items-center gap-2 rounded",
            isCompact
              ? "bg-purple-500/10 border border-purple-500/20 p-2"
              : "bg-purple-500/10 border border-purple-500/20 p-3 gap-3 transition-colors hover:bg-purple-500/20"
          )}
        >
          <Ghost size={isCompact ? 14 : 16} className="text-purple-400 shrink-0" />
          <div className="flex flex-col">
            <span className={cn("text-purple-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
              Spawns {spawn.count}x {formatEntityName(spawn.unit_id)}
            </span>
            <span className={cn("text-purple-300/70", isCompact ? "text-[10px] leading-tight" : "text-xs")}>
              Trigger: {spawn.trigger} {spawn.interval ? (isCompact ? `@ ${spawn.interval}s` : `every ${spawn.interval}s`) : ""}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
