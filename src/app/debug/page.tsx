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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          🧪 API Debug Panel
        </h1>

        {/* Build Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-500/20">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Build Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><span className="text-gray-400">Version:</span> {data.build_info.version}</p>
            <p><span className="text-gray-400">Generated:</span> {new Date(data.build_info.generated_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-500/20">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Data Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Units</p>
              <p className="text-3xl font-bold">{data.units.length}</p>
            </div>
            <div className="bg-pink-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Heroes</p>
              <p className="text-3xl font-bold">{data.heroes.length}</p>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Consumables</p>
              <p className="text-3xl font-bold">{data.consumables.length}</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Upgrades</p>
              <p className="text-3xl font-bold">{data.upgrades.length}</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-500/20">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Unit Categories</h2>
          <div className="space-y-2">
            {Object.entries(
              data.units.reduce((acc: Record<string, number>, unit) => {
                acc[unit.category] = (acc[unit.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2">
                <span className="font-semibold">{category}</span>
                <span className="bg-purple-500/30 px-3 py-1 rounded-full text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Data */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Sample Data</h2>
          <div className="space-y-4">
            {data.units.slice(0, 3).map((unit) => (
              <div key={unit.entity_id} className="bg-white/5 rounded-lg p-4">
                <h3 className="text-xl font-bold text-pink-400">{unit.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{unit.category} • {unit.magic_school} • Rank {unit.card_config.rank}</p>
                <p className="text-gray-300 text-sm">{unit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-500/20 border border-green-500/40 rounded-xl p-6 text-center">
          <p className="text-2xl font-bold text-green-400">✅ API Integration Successful!</p>
          <p className="text-gray-300 mt-2">All data fetching working correctly in production</p>
        </div>
      </div>
    </div>
  );
}
