"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

/* ─── Types ──────────────────────────────────────────── */

export interface AnnouncementLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "primary" | "discord" | "steam" | "default";
}

export interface AnnouncementBannerProps {
  dismissKey: string;
  headline: string;
  subtext?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  links?: AnnouncementLink[];
  variant?: "launch" | "info" | "warning";
}

/* ─── Variant Styles ─────────────────────────────────── */

const VARIANT_CLASSES: Record<string, string> = {
  launch: "announcement-banner--launch",
  info: "announcement-banner--info",
  warning: "announcement-banner--warning",
};

const LINK_VARIANT_CLASSES: Record<string, string> = {
  default: "bg-white/15 text-white border border-white/20 hover:bg-white/25",
  primary:
    "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-lg",
  steam:
    "bg-gradient-to-r from-[#1b2838] to-[#2a475e] text-[#c7d5e0] border border-[#c7d5e0]/25 hover:text-white hover:shadow-lg",
  discord: "bg-discord text-white hover:shadow-lg hover:shadow-discord/30",
};

/* ─── Component ──────────────────────────────────────── */

export function AnnouncementBanner({
  dismissKey,
  headline,
  subtext,
  badge,
  badgeIcon,
  links = [],
  variant = "info",
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(dismissKey);
    if (!isDismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Safe: Client-side only initialization
      setIsVisible(true);
    }
    setIsHydrated(true);
  }, [dismissKey]);

  const handleDismiss = () => {
    sessionStorage.setItem(dismissKey, "true");
    setIsVisible(false);
  };

  if (!isHydrated || !isVisible) return null;

  return (
    <div
      className={`announcement-banner ${VARIANT_CLASSES[variant] ?? ""} bg-[var(--sp-surface-deck)] fixed z-60 overflow-hidden bottom-0 left-0 right-0 border-t border-white/10 pb-[env(safe-area-inset-bottom)] sm:pb-0 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-max sm:rounded-full sm:border sm:shadow-2xl sm:shadow-brand-primary/20`}
      role="banner"
      aria-label={headline}
      data-testid="announcement-banner"
    >
      {/* Shimmer overlay */}
      <div
        className="announcement-banner__shimmer absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-3 sm:gap-4 max-w-site-shell mx-auto px-4 pr-20 py-2 sm:px-8 sm:pr-24 sm:py-3">
        {/* Badge */}
        {badge && (
          <span
            className="announcement-banner__badge inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[0.5625rem] sm:text-[0.625rem] font-extrabold uppercase tracking-wider whitespace-nowrap text-white"
            data-testid="announcement-badge"
          >
            {badgeIcon && (
              <span
                className="announcement-banner__badge-icon inline-flex"
                aria-hidden="true"
              >
                {badgeIcon}
              </span>
            )}
            {badge}
          </span>
        )}

        {/* Headline */}
        <span className="hidden sm:inline text-[0.8125rem] font-bold text-white whitespace-nowrap">
          {headline}
        </span>

        {/* Subtext — desktop only */}
        {subtext && (
          <span className="hidden sm:inline text-[0.6875rem] text-white/90 whitespace-nowrap">
            {subtext}
          </span>
        )}

        {/* Link pills */}
        {links.length > 0 && (
          <span className="inline-flex items-center gap-2 sm:gap-3 shrink-0">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[0.5625rem] sm:text-[0.6875rem] font-bold whitespace-nowrap no-underline transition-all duration-150 hover:-translate-y-px hover:scale-[1.04] active:translate-y-0 active:scale-[0.98] ${LINK_VARIANT_CLASSES[link.variant ?? "default"]}`}
                data-testid={`announcement-link-${link.variant ?? "default"}`}
              >
                {link.icon && (
                  <span className="inline-flex shrink-0" aria-hidden="true">
                    {link.icon}
                  </span>
                )}
                {link.label}
              </a>
            ))}
          </span>
        )}
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-none bg-transparent text-white/50 hover:text-white hover:bg-white/15 cursor-pointer transition-colors"
          aria-label="Dismiss announcement"
          data-testid="announcement-banner-dismiss"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
