import React from "react";
import { Library } from "lucide-react";
import { cn } from "@/lib/utils";

interface LibraryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  collapsed?: boolean;
}

export function LibraryButton({ className, collapsed, ...props }: LibraryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary border border-brand-primary hover:bg-brand-primary/90 text-white transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/20",
        className
      )}
      title="Open Library"
      {...props}
    >
      <Library size={14} />
      {!collapsed && <span>Library</span>}
    </button>
  );
}
