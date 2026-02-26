"use client";

import { Gamepad2, Sparkles } from "lucide-react";

import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

/**
 * Pre-configured EA Launch announcement.
 * Drop this into any layout — it handles its own dismissal state.
 */
export function EALaunchAnnouncement() {
  return (
    <AnnouncementBanner
      dismissKey="sc_ea_launch_dismissed"
      variant="launch"
      badge="EARLY ACCESS IS LIVE"
      badgeIcon={<Sparkles size={10} />}
      headline="Spellcasters Chronicles launched today — play FREE!"
      subtext="Grab it now on Steam and join the community."
      links={[
        {
          label: "Get on Steam",
          href: "https://store.steampowered.com/app/2458470/Spellcasters_Chronicles/",
          icon: <Gamepad2 size={12} />,
          variant: "steam",
        },
      ]}
    />
  );
}
