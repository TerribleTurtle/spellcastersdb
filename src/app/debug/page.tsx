import { fetchGameData } from "@/lib/api";

export default async function DebugPage() {
  let data;
  let error;

  try {
    data = await fetchGameData();
  } catch (e) {
    error = e;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-red-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-red-400">❌ API Error</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-xl mb-4">Failed to fetch game data</p>
            <pre className="bg-black/30 p-4 rounded-lg overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
          🧪 API Debug Panel
        </h1>

        {/* Build Info */}
        <div className="bg-surface-card backdrop-blur-md rounded-xl p-6 mb-6 border border-surface-highlight">
          <h2 className="text-2xl font-semibold mb-4 text-brand-primary">Build Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><span className="text-gray-400">Version:</span> {data.build_info.version}</p>
            <p><span className="text-gray-400">Generated:</span> {new Date(data.build_info.generated_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-surface-card backdrop-blur-md rounded-xl p-6 mb-6 border border-surface-highlight">
          <h2 className="text-2xl font-semibold mb-4 text-brand-primary">Data Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-primary/20 rounded-lg p-4">
              <p className="text-brand-primary text-sm font-bold uppercase">Units</p>
              <p className="text-3xl font-bold">{data.units.length}</p>
            </div>
            <div className="bg-brand-secondary/20 rounded-lg p-4">
              <p className="text-brand-secondary text-sm font-bold uppercase">Heroes</p>
              <p className="text-3xl font-bold">{data.heroes.length}</p>
            </div>
            <div className="bg-brand-accent/20 rounded-lg p-4">
              <p className="text-brand-accent text-sm font-bold uppercase">Consumables</p>
              <p className="text-3xl font-bold">{data.consumables.length}</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm font-bold uppercase">Upgrades</p>
              <p className="text-3xl font-bold">{data.upgrades.length}</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-surface-card backdrop-blur-md rounded-xl p-6 mb-6 border border-surface-highlight">
          <h2 className="text-2xl font-semibold mb-4 text-brand-primary">Unit Categories</h2>
          <div className="space-y-2">
            {Object.entries(
              data.units.reduce((acc: Record<string, number>, unit) => {
                acc[unit.category] = (acc[unit.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center bg-surface-hover rounded-lg px-4 py-2 border border-white/5">
                <span className="font-semibold text-gray-200">{category}</span>
                <span className="bg-brand-primary/30 text-brand-primary px-3 py-1 rounded-full text-sm font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Data */}
        <div className="bg-surface-card backdrop-blur-md rounded-xl p-6 border border-surface-highlight">
          <h2 className="text-2xl font-semibold mb-4 text-brand-primary">Sample Data</h2>
          <div className="space-y-4">
            {data.units.slice(0, 3).map((unit) => (
              <div key={unit.entity_id} className="bg-surface-hover rounded-lg p-4 border border-white/5">
                <h3 className="text-xl font-bold text-brand-secondary">{unit.name}</h3>
                <p className="text-gray-400 text-sm mb-2 font-mono">{unit.category} • {unit.magic_school} • Rank {unit.card_config.rank}</p>
                <p className="text-gray-300 text-sm">{unit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <p className="text-2xl font-bold text-green-400">✅ API Integration Successful!</p>
          <p className="text-gray-400 mt-2">All data fetching working correctly in production</p>
        </div>
      </div>
    </div>
  );
}
