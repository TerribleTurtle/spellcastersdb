import { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getConsumables } from "@/lib/api";

interface ConsumablePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const consumables = await getConsumables();
  return consumables.map((item) => ({
    id: item.entity_id,
  }));
}

export async function generateMetadata({
  params,
}: ConsumablePageProps): Promise<Metadata> {
  const { id } = await params;
  const consumables = await getConsumables();
  const item = consumables.find((c) => c.entity_id === id);

  if (!item) {
    return { title: "Item Not Found" };
  }

  return {
    title: item.name,
    description: item.description,
    openGraph: {
      title: item.name,
      description: item.description,
    },
  };
}

export default async function ConsumablePage({ params }: ConsumablePageProps) {
  const { id } = await params;
  const consumables = await getConsumables();
  const item = consumables.find((c) => c.entity_id === id);

  if (!item) {
    notFound();
  }

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": item.name,
    "description": item.description,
    "category": "Consumable",
    "image": `https://spellcastersdb.com/api/og/consumable?id=${item.entity_id}`,
    "additionalProperty": [
        item.effect_type ? { "@type": "PropertyValue", "name": "Effect Type", "value": item.effect_type } : null,
        item.effect_value ? { "@type": "PropertyValue", "name": "Effect Value", "value": item.effect_value } : null,
        item.duration ? { "@type": "PropertyValue", "name": "Duration", "value": `${item.duration}s` } : null,
    ].filter(Boolean)
  };

  return (
    <>
    <JsonLd data={jsonLdData as Record<string, unknown>} id={`json-ld-consumable-${item.entity_id}`} />
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="text-brand-accent font-mono text-sm uppercase tracking-wider">
            Consumable Item
          </span>
          <h1 className="text-5xl font-bold mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-green-400">
            {item.name}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Effect Details */}
        <div className="bg-surface-card rounded-2xl p-6 border border-surface-highlight">
          <h3 className="text-xl font-bold mb-4 text-brand-accent">Effects</h3>
          <div className="grid grid-cols-2 gap-4">
            {item.effect_type && (
              <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
                  Type
                </p>
                <p className="text-lg font-mono capitalize text-white">
                  {item.effect_type.replace("_", " ")}
                </p>
              </div>
            )}
            {item.effect_value && (
              <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
                  Value
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {item.effect_value}
                </p>
              </div>
            )}
            {item.duration && (
              <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
                  Duration
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {item.duration}s
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
