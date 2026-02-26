import { Crown, Shield, Trophy } from "lucide-react";

import { JsonLd } from "@/components/common/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { getGameSystems } from "@/services/api/api";

export const metadata = {
  title: "Ranked Mode — Game Guide",
  description:
    "Climb the competitive ladder in Spellcasters Chronicles. Ranks, RP gains, and tier breakdowns from Novice to Grand Master.",
  keywords: [
    "Spellcasters Chronicles",
    "Ranked",
    "Competitive",
    "RP",
    "Grand Master",
    "Ladder",
  ],
};

// Color palette for ranked tiers
const TIER_COLORS: Record<
  string,
  { bg: string; border: string; text: string; glow: string }
> = {
  Novice: {
    bg: "from-stone-500/15 to-stone-600/15",
    border: "border-stone-500/30",
    text: "text-stone-400",
    glow: "shadow-stone-500/10",
  },
  Initiate: {
    bg: "from-green-500/15 to-emerald-500/15",
    border: "border-green-500/30",
    text: "text-green-400",
    glow: "shadow-green-500/10",
  },
  Adept: {
    bg: "from-blue-500/15 to-cyan-500/15",
    border: "border-blue-500/30",
    text: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  Mage: {
    bg: "from-purple-500/15 to-violet-500/15",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/10",
  },
  Archmage: {
    bg: "from-fuchsia-500/15 to-pink-500/15",
    border: "border-fuchsia-500/30",
    text: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/10",
  },
  Master: {
    bg: "from-amber-500/15 to-yellow-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  "Grand Master": {
    bg: "from-red-500/15 to-orange-500/15",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/10",
  },
};

const DEFAULT_TIER = {
  bg: "from-brand-primary/15 to-brand-secondary/15",
  border: "border-brand-primary/30",
  text: "text-brand-primary",
  glow: "shadow-brand-primary/10",
};

export default async function RankedPage() {
  const systems = await getGameSystems();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.description,
    author: { "@type": "Organization", name: "SpellcastersDB" },
    publisher: {
      "@type": "Organization",
      name: "SpellcastersDB",
      logo: {
        "@type": "ImageObject",
        url: "https://www.spellcastersdb.com/favicon.svg",
      },
    },
  };

  return (
    <PageShell
      title="Ranked Mode"
      subtitle="Climb the competitive ladder and prove your mastery."
      maxWidth="6xl"
      breadcrumbs={[
        { label: "Guide", href: "/guide" },
        { label: "Ranked", href: "/guide/ranked" },
      ]}
    >
      <JsonLd data={jsonLdData} id="json-ld-article" />
      <div className="space-y-8 max-w-4xl mx-auto">
        {systems?.ranked ? (
          <>
            {/* Overview Card */}
            <section className="bg-surface-card border border-border-default rounded-xl p-5 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                  <Trophy size={22} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-brand-accent">
                  How Ranked Works
                </h2>
              </div>
              <p className="text-text-secondary leading-relaxed mb-6">
                Ranked mode is a competitive ladder where you earn Rating Points
                (RP) by winning matches. Progress through ranks and tiers to
                reach the pinnacle: Grand Master.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-dim border border-border-default rounded-lg p-4 text-center">
                  <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-1">
                    RP Per Win
                  </p>
                  <p className="text-3xl font-bold text-emerald-400">
                    +{systems.ranked.rp_gain_per_win}
                  </p>
                </div>
                <div className="bg-surface-dim border border-border-default rounded-lg p-4 text-center">
                  <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-1">
                    Tiers Per Rank
                  </p>
                  <p className="text-3xl font-bold text-brand-primary">
                    {systems.ranked.tiers_per_rank}
                  </p>
                </div>
              </div>
            </section>

            {/* Rank Ladder */}
            <section className="bg-surface-card border border-border-default rounded-xl p-5 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <Crown size={22} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-brand-accent">
                  Rank Ladder
                </h2>
              </div>

              <div className="space-y-3">
                {systems.ranked.ranks.map((rank, idx) => {
                  const colors = TIER_COLORS[rank.name] || DEFAULT_TIER;
                  const isTop = idx === systems.ranked.ranks.length - 1;

                  return (
                    <div
                      key={rank.name}
                      className={`relative bg-linear-to-r ${colors.bg} border ${colors.border} rounded-xl p-4 md:p-5 transition-all hover:shadow-lg ${colors.glow} ${isTop ? "ring-1 ring-red-500/30" : ""}`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-surface-card border ${colors.border} flex items-center justify-center`}
                          >
                            <Shield size={16} className={colors.text} />
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold ${colors.text}`}>
                              {rank.name}
                              {isTop && (
                                <span className="ml-2 text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                                  HIGHEST
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-text-muted">
                              {rank.rp_threshold_min.toLocaleString()} RP
                              minimum
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-text-muted mb-0.5">
                              RP Loss
                            </p>
                            <p className="font-bold text-red-400">
                              -{rank.rp_loss_per_loss}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* WIP Disclaimer */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 md:p-6">
              <p className="text-sm text-amber-500 leading-relaxed text-center font-medium">
                Note: Ranked mode is currently a work-in-progress. Adjustments
                to the ranking system and RP mechanics may occur during Early
                Access.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-surface-card border border-border-default rounded-xl p-8 text-center">
            <p className="text-text-muted text-lg">
              Ranked data is currently unavailable. Check back soon!
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
