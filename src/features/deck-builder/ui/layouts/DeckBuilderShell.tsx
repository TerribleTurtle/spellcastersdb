import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DeckBuilderShellProps {
  /** Mobile-only header content (hidden on xl screens) */
  mobileHeader?: ReactNode;
  /** Desktop-only header content (hidden on mobile) */
  desktopHeader?: ReactNode;
  /** Left column content (Browser/Vault) */
  browser: ReactNode;
  /** Right column content (Inspector + Drawer/Stack) */
  rightPanel: ReactNode;
  /** Mobile-only footer content (hidden on xl screens) */
  mobileFooter?: ReactNode;
  /** Overlays, modals, or absolute positioned elements */
  children?: ReactNode;
  className?: string;
}

export function DeckBuilderShell({
  mobileHeader,
  desktopHeader,
  browser,
  rightPanel,
  mobileFooter,
  children,
  className,
}: DeckBuilderShellProps) {
  return (
    <>
      <div
        className={cn(
          "h-full flex flex-col relative bg-surface-main overflow-hidden",
          "xl:grid xl:grid-cols-[1fr_640px] xl:grid-rows-[auto_1fr]",
          className
        )}
      >
        {/* Mobile Header (XL Hidden) */}
        {mobileHeader && (
          <div className="xl:hidden shrink-0">{mobileHeader}</div>
        )}

        {/* Desktop Header (Hidden on Mobile, spans 2 cols) */}
        {desktopHeader && (
          <div className="hidden xl:flex h-14 border-b border-border-default items-center justify-between px-4 shrink-0 bg-surface-main z-20 xl:col-span-2">
            {desktopHeader}
          </div>
        )}

        {/* Main Content: Browser / Vault (Left Col) */}
        {browser}

        {/* Right Panel: Inspector + Drawer (Right Col) */}
        {rightPanel}

        {/* Mobile Footer (Fixed Bottom) */}
        {mobileFooter}
      </div>

      {children}
    </>
  );
}
