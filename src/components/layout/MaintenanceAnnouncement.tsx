"use client";

import { Github, Heart } from "lucide-react";

import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

/**
 * Pre-configured Maintenance / Sunset announcement.
 * Handles dynamic server status message based on whether the current date
 * is before or after the June 19, 2026 shutdown date.
 */
export function MaintenanceAnnouncement() {
  const shutdownDate = new Date("2026-06-19T00:00:00Z");
  const isShutdown = new Date() >= shutdownDate;

  const subtext = isShutdown
    ? "Game servers went offline on June 19, 2026. While the official game has sunset, our community-built database lives on as an open-source monument to the good times we shared."
    : "Game servers will go offline on June 19, 2026. While the official game is sunsetting, our community-built database lives on as an open-source monument to the good times we shared.";

  return (
    <AnnouncementBanner
      dismissKey="sc_sunset_announcement_dismissed"
      variant="warning"
      badge="SUNSET"
      badgeIcon={<Heart size={10} className="fill-white" />}
      headline="Spellcasters Chronicles has come to an end."
      subtext={subtext}
      links={[
        {
          label: "Contribute on GitHub",
          href: "https://github.com/TerribleTurtle/spellcastersdb",
          icon: <Github size={12} />,
          variant: "default",
        },
      ]}
    />
  );
}
