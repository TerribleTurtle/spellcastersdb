import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { roadmapService } from "@/services/roadmap-service";

import RoadmapClient from "./RoadmapClient";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "View the development roadmap for SpellcastersDB. Vote on features and track bugs.",
};

// Revalidate every minute (60 seconds)
export const revalidate = 60;

export default async function RoadmapPage() {
  const { issues, isLive } = await roadmapService.getIssues();

  return (
    <PageShell
      title="Development Roadmap"
      subtitle="Transparency is key. Vote on issues by adding reactions on GitHub."
      maxWidth="page-grid"
      breadcrumbs={[{ label: "Roadmap", href: "/roadmap" }]}
    >
      <RoadmapClient initialIssues={issues} isLive={isLive} />
    </PageShell>
  );
}
