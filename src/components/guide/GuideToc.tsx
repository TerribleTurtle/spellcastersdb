"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronDown, ChevronRight, List } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  label: string;
  href: string;
}

const GUIDE_SECTIONS: TocItem[] = [
  { id: "hub", label: "Guide Hub", href: "/guide" },
  { id: "basics", label: "Basics & Deck Building", href: routes.guideBasics() },
  {
    id: "mechanics",
    label: "Mechanics & Progression",
    href: routes.guideMechanics(),
  },
  { id: "ranked", label: "Ranked Mode", href: routes.guideRanked() },
  { id: "upgrades", label: "Class Upgrades", href: routes.guideUpgrades() },
  { id: "infusions", label: "Infusions Database", href: routes.infusions() },
];

/**
 * Desktop sidebar TOC — sticky, highlights active route.
 */
export function GuideToc() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden lg:block shrink-0 w-56"
      aria-label="Table of Contents"
    >
      <div className="sticky top-24">
        <div
          className="flex items-center gap-2 font-bold mb-4 text-text-primary px-3 text-sm"
          role="presentation"
        >
          <List size={16} className="text-brand-primary" />
          Guide Sections
        </div>
        <ul className="space-y-1 border-l-2 border-border-subtle ml-3">
          {GUIDE_SECTIONS.map(({ id, label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={id}>
                <Link
                  href={href}
                  className={cn(
                    "block px-4 py-2 text-sm transition-colors border-l-2 -ml-[2px] rounded-r-md",
                    isActive
                      ? "border-brand-primary text-text-primary font-bold bg-brand-primary/5"
                      : "border-transparent text-text-muted hover:text-text-primary hover:border-border-strong hover:bg-surface-dim"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/**
 * Mobile TOC — collapsible accordion with smooth open/close transition.
 */
export function MobileGuideToc() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const activeSection =
    GUIDE_SECTIONS.find((s) => s.href === pathname)?.label ||
    "Guide Navigation";

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-surface-card border border-border-default rounded-lg px-4 py-3 text-left transition-colors hover:border-border-strong"
        aria-expanded={isOpen}
        aria-controls="mobile-toc-content"
      >
        <span className="flex items-center gap-2 font-bold text-text-primary text-sm">
          <List size={16} className="text-brand-primary" />
          {activeSection}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        id="mobile-toc-content"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-surface-card border border-border-default rounded-lg px-4 py-3 shadow-lg">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {GUIDE_SECTIONS.map(({ id, label, href }) => {
              const isActive = pathname === href;
              return (
                <li key={id}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 text-sm transition-colors py-2 rounded-md px-2",
                      isActive
                        ? "text-brand-primary font-bold bg-brand-primary/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-dim"
                    )}
                  >
                    <ChevronRight
                      size={12}
                      className={cn(
                        "shrink-0",
                        isActive
                          ? "text-brand-primary"
                          : "text-brand-primary/40"
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
