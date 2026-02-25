import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { roadmapService } from "@/services/roadmap-service";

import RoadmapClient from "./RoadmapClient";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "View the development roadmap for SpellcastersDB. Vote on features and track bugs.",
  openGraph: {
    title: "Roadmap",
    description:
      "View the development roadmap for SpellcastersDB. Vote on features and track bugs.",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap",
    description:
      "View the development roadmap for SpellcastersDB. Vote on features and track bugs.",
    images: ["/og-default.png"],
  },
};

// Revalidate every hour (roadmap data doesn't change frequently)
export const revalidate = 3600;

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
