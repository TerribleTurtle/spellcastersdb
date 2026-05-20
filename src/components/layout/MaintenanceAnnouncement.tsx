"use client";

import { AlertTriangle, Gamepad2, Github } from "lucide-react";

import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

/**
 * Pre-configured Maintenance / End of Life announcement.
 * Drop this into any layout — it handles its own dismissal state.
 */
export function MaintenanceAnnouncement() {
  return (
    <AnnouncementBanner
      dismissKey="sc_maintenance_dismissed"
      variant="warning"
      badge="MAINTENANCE"
      badgeIcon={<AlertTriangle size={10} />}
      headline="This site is no longer under active maintenance."
      subtext="The original developer is no longer updating data, but the project is open source—feel free to contribute updates!"
      links={[
        {
          label: "Contribute on GitHub",
          href: "https://github.com/TerribleTurtle/spellcastersdb",
          icon: <Github size={12} />,
          variant: "default",
        },
        {
          label: "Play on Steam",
          href: "https://store.steampowered.com/app/2458470/Spellcasters_Chronicles/",
          icon: <Gamepad2 size={12} />,
          variant: "steam",
        },
      ]}
    />
  );
}
