import type { Metadata } from "next";
import { roadmapService } from "@/services/roadmap-service";
import RoadmapClient from "./RoadmapClient";

export const metadata: Metadata = {
  title: "Roadmap | SpellcastersDB",
  description: "Track the development progress of SpellcastersDB. View active issues, bugs, and feature requests directly from GitHub.",
};

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function RoadmapPage() {
  const { issues, isLive } = await roadmapService.getIssues();

  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8 overflow-x-hidden w-full">
      {/* Client Component handles the UI and State */}
      <RoadmapClient initialIssues={issues} isLive={isLive} />
    </div>
  );
}
