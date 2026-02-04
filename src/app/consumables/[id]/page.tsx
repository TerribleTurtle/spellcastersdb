import { getConsumables } from "@/lib/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ConsumablePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const consumables = await getConsumables();
  return consumables.map((item) => ({
    id: item.consumable_id,
  }));
}

export async function generateMetadata({ params }: ConsumablePageProps): Promise<Metadata> {
  const { id } = await params;
  const consumables = await getConsumables();
  const item = consumables.find(c => c.consumable_id === id);

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
  const item = consumables.find(c => c.consumable_id === id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="text-purple-400 font-mono text-sm uppercase tracking-wider">
            Consumable Item
          </span>
          <h1 className="text-5xl font-bold mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            {item.name}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Effect Details */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4 text-blue-300">Effects</h3>
          <div className="grid grid-cols-2 gap-4">
            {item.effect_type && (
              <div className="p-4 bg-black/20 rounded-xl">
                <p className="text-gray-400 text-sm">Type</p>
                <p className="text-lg font-mono capitalize">{item.effect_type}</p>
              </div>
            )}
             {item.effect_value && (
              <div className="p-4 bg-black/20 rounded-xl">
                <p className="text-gray-400 text-sm">Value</p>
                <p className="text-2xl font-bold text-green-400">{item.effect_value}</p>
              </div>
            )}
             {item.duration && (
              <div className="p-4 bg-black/20 rounded-xl">
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-2xl font-bold text-yellow-400">{item.duration}s</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
