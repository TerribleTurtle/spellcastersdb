import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl" | "page-grid";
  className?: string;
}

export function PageShell({
  children,
  title,
  subtitle,
  maxWidth = "4xl",
  className,
}: PageShellProps) {
  const maxWidthClass = {
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    "page-grid": "max-w-page-grid",
  }[maxWidth];

  return (
    <div
      className={cn(
        "py-8 md:py-12 px-4 md:px-8 mx-auto w-full",
        maxWidthClass,
        className
      )}
    >
      <div className="mb-8 md:mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary mb-3 md:mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
