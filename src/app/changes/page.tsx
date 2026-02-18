import { ChangelogArchive } from "@/components/changelog/ChangelogArchive";
import { fetchChangelog } from "@/services/api/patch-history";
import { JsonLd } from "@/components/common/JsonLd";

export const metadata = {
  title: "Change Log | SpellcastersDB",
  description:
    "Browse every balance change, hotfix, and content update in Spellcasters Chronicles. Search, filter, and sort the complete patch history.",
  keywords: [
    "Spellcasters Chronicles",
    "Patch History",
    "Change Log",
    "Balance Changes",
    "Hotfix",
    "Content Update",
  ],
  openGraph: {
    title: "Change Log | SpellcastersDB",
    description:
      "Browse every balance change, hotfix, and content update in Spellcasters Chronicles.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Change Log | SpellcastersDB",
    description:
      "Search the complete patch history for Spellcasters Chronicles.",
  },
};

export default async function ChangesPage() {
  const patches = await fetchChangelog();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Change Log",
    "description":
      "Complete history of balance changes, hotfixes, and content updates for Spellcasters Chronicles.",
    "numberOfItems": patches.reduce((acc, p) => acc + p.changes.length, 0),
  };

  return (
    <>
      <JsonLd data={jsonLdData} id="json-ld-changelog-collection" />
      <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-accent mb-2">
              Change Log
            </h1>
            <p className="text-gray-400">
              Search and filter every balance change, hotfix, and content update.
            </p>
          </div>

          <ChangelogArchive patches={patches} />
        </div>
      </div>
    </>
  );
}
