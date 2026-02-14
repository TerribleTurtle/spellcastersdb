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
    <div className="min-h-screen bg-transparent">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

      {/* Client Component handles the UI and State */}
      <RoadmapClient initialIssues={issues} isLive={isLive} />
    </div>
  );
}
