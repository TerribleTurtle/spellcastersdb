import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Map } from "lucide-react";

import { MapChestTable } from "@/components/guide/MapChestTable";
import { MapImage } from "@/components/guide/MapImage";
import { PageShell } from "@/components/layout/PageShell";
import { CONFIG } from "@/lib/config";
import { routes } from "@/lib/routes";
import { getMapChests } from "@/services/api/map-chests";

import { KNOWN_MAPS } from "../known-maps";

type Props = {
  params: Promise<{ mapId: string }>;
};

// Static generation
export async function generateStaticParams() {
  return KNOWN_MAPS.map((map) => ({
    mapId: map.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mapId } = await params;

  try {
    const data = await getMapChests(mapId);
    return {
      title: `${data.name} Map Chests - SC Guide`,
      description: data.description,
      openGraph: {
        title: `${data.name} Map Chests - SC Guide`,
        description: data.description,
      },
      twitter: {
        title: `${data.name} Map Chests - SC Guide`,
        description: data.description,
      },
    };
  } catch (error) {
    return { title: "Map Not Found" };
  }
}

export default async function MapChestsDetailPage({ params }: Props) {
  const { mapId } = await params;

  let mapData;
  try {
    mapData = await getMapChests(mapId);
  } catch (error) {
    notFound();
  }

  return (
    <PageShell
      title={`${mapData.name} Chests`}
      maxWidth="4xl"
      breadcrumbs={[
        { label: "Guide", href: routes.guide() },
        { label: "Map Chests", href: routes.guideMapChests() },
        { label: mapData.name, href: routes.guideMapChestsDetail(mapId) },
      ]}
    >
      <div className="space-y-8">
        <section className="bg-surface-card border border-border-default rounded-lg p-6 lg:p-8 flex items-start gap-6">
          <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent shrink-0 hidden sm:block">
            <Map size={48} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-text-primary">
                {mapData.name}
              </h1>
              <span className="px-3 py-1 bg-surface-inset border border-border-subtle rounded-full text-xs font-bold text-text-muted uppercase tracking-wider">
                Arena Map
              </span>
            </div>
            <p className="text-lg text-text-secondary leading-relaxed mt-4">
              {mapData.description}
            </p>
          </div>
        </section>

        {mapData.image_urls?.map && (
          <MapImage
            src={`${CONFIG.API.BASE_URL.replace(/\/api\/v2$/, "")}${mapData.image_urls.map}`}
            alt={`${mapData.name} arena map`}
          />
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-brand-primary">
            Chest Spawns &amp; Rewards
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            The table below breaks down every potential chest spawn on this map
            by tier, including its exact location, possible reward, and rarity.
          </p>

          <div className="mt-6">
            <MapChestTable chests={mapData.chests} />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
