import { ChangelogArchive } from "@/components/changelog/ChangelogArchive";
import { JsonLd } from "@/components/common/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { fetchChangelog } from "@/services/api/patch-history";

export const metadata = {
  title: "Change Log",
  description:
    "Detailed history of balance changes, bug fixes, and content updates for Spellcasters Chronicles.",
};

export default async function ChangesPage() {
  const patches = await fetchChangelog();
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Spellcasters Chronicles Change Log",
    description:
      "Detailed history of balance changes, bug fixes, and content updates for Spellcasters Chronicles.",
    url: "https://www.spellcastersdb.com/changes",
    hasPart: patches.slice(0, 5).map((p) => ({
      "@type": "CreativeWork",
      name: p.title,
      version: p.version,
      datePublished: p.date,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageShell
        title="Change Log"
        subtitle="Search and filter every balance change, hotfix, and content update in Spellcasters Chronicles history."
        maxWidth="page-grid"
        breadcrumbs={[{ label: "Change Log", href: "/changes" }]}
      >
        <ChangelogArchive patches={patches} />
      </PageShell>
    </>
  );
}
