import type { Metadata } from "next";

import {
  Activity,
  Crown,
  Database,
  FlaskConical,
  Scroll,
  Shield,
  Sparkles,
  Swords,
  Users,
  Zap,
} from "lucide-react";

import { DebugFeatures } from "@/components/debug/DebugFeatures";
import { DebugHeaderInfo } from "@/components/debug/DebugHeaderInfo";
import { SentryCrashTest } from "@/components/debug/SentryCrashTest";
import { fetchGameData } from "@/services/api/api";

export const metadata: Metadata = {
  title: "Debug",
  robots: { index: false, follow: false },
};

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
      <div className="min-h-screen bg-surface-main text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-status-danger-text">
            ❌ API Error
          </h1>
          <div className="bg-surface-card rounded-xl p-6 border border-status-danger-border">
            <p className="text-xl mb-4 text-red-200">
              Failed to fetch game data
            </p>
            <pre className="bg-surface-dim p-4 rounded-lg overflow-auto text-red-300 font-mono text-sm">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // --- Aggregation Logic ---

  const grandTotal =
    data.units.length +
    data.spellcasters.length +
    data.spells.length +
    data.titans.length +
    data.consumables.length +
    data.upgrades.length;

  // Helper to count by key
  const countBy = <T,>(items: T[], keyFn: (item: T) => string) => {
    return items.reduce(
      (acc, item) => {
        const key = keyFn(item) || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  };

  // 1. Magic Schools (Units + Spells + Titans)
  const allMagicalEntities = [...data.units, ...data.spells, ...data.titans];
  const schools = countBy(allMagicalEntities, (item) => item.magic_school);

  // 2. Ranks (Units + Titans)
  // Spells usually don't have ranks in the same way, or are treated differently.
  // We'll focus on Units and Titans for Rank distribution as that's most relevant for deck building balance.
  const rankedEntities = [...data.units, ...data.titans];
  const ranks = countBy(rankedEntities, (item) =>
    "rank" in item ? item.rank || "Unknown" : "Unknown"
  );

  // 3. Spellcaster Classes
  const classes = countBy(
    data.spellcasters,
    (spellcaster) => spellcaster.class
  );

  // 4. Unit Categories (Existing)
  const categories = countBy(data.units, (unit) => unit.category);

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-border-default pb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary flex items-center gap-3">
            <Activity className="text-brand-primary" size={32} />
            System Status & Data
          </h1>

          <DebugHeaderInfo
            buildVersion={data.build_info.version}
            generatedAt={data.build_info.generated_at}
            apiUrl={
              data._source ||
              process.env.NEXT_PUBLIC_API_URL ||
              "Local / Unknown"
            }
          />
        </header>

        {/* Sentry Integration Test */}
        <div className="mb-8 p-6 bg-surface-card rounded-xl border border-status-danger-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-status-danger-text">
              <Activity size={20} />
              Sentry Integration Test
            </h2>
            <p className="text-text-muted text-sm mt-1 max-w-lg">
              Click this button to intentionally crash the React render tree.
              This exercises the `global-error.tsx` boundary and forces an event
              to be sent to your live Sentry dashboard.
            </p>
          </div>
          <SentryCrashTest />
        </div>

        {/* Top Row: High Level Counts */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <SummaryCard
            label="Grand Total"
            value={grandTotal}
            icon={<Database size={18} />}
            color="text-text-primary"
            bg="bg-surface-hover"
          />
          <SummaryCard
            label="Spellcasters"
            value={data.spellcasters.length}
            icon={<Users size={18} />}
            color="text-brand-secondary"
            bg="bg-brand-secondary/20"
          />
          <SummaryCard
            label="Units"
            value={data.units.length}
            icon={<Swords size={18} />}
            color="text-brand-primary"
            bg="bg-brand-primary/20"
          />
          <SummaryCard
            label="Spells"
            value={data.spells.length}
            icon={<Scroll size={18} />}
            color="text-pink-400"
            bg="bg-pink-500/20"
          />
          <SummaryCard
            label="Titans"
            value={data.titans.length}
            icon={<Crown size={18} />}
            color="text-status-warning-text"
            bg="bg-status-warning-border"
          />
          <SummaryCard
            label="Consumables"
            value={data.consumables.length}
            icon={<FlaskConical size={18} />}
            color="text-brand-accent"
            bg="bg-brand-accent/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Breakdowns */}
          <div className="space-y-8">
            {/* Magic Schools */}
            <Section title="Magic Schools" icon={<Sparkles size={20} />}>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(schools)
                  .sort(([, a], [, b]) => b - a)
                  .map(([school, count]) => (
                    <BarRow
                      key={school}
                      label={school}
                      value={count}
                      total={allMagicalEntities.length}
                      color="bg-brand-primary"
                    />
                  ))}
              </div>
            </Section>

            {/* Spellcaster Classes */}
            <Section title="Spellcaster Classes" icon={<Shield size={20} />}>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(classes)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cls, count]) => (
                    <BarRow
                      key={cls}
                      label={cls}
                      value={count}
                      total={data.spellcasters.length}
                      color="bg-brand-secondary"
                    />
                  ))}
              </div>
            </Section>
          </div>

          {/* Right Column: More Breakdowns & Sample */}
          <div className="space-y-8">
            {/* Ranks */}
            <Section title="Unit Ranks" icon={<Zap size={20} />}>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(ranks)
                  // Sort I, II, III, IV, V/Titan
                  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                  .map(([rank, count]) => (
                    <BarRow
                      key={rank}
                      label={`Rank ${rank}`}
                      value={count}
                      total={rankedEntities.length}
                      color="bg-yellow-500"
                    />
                  ))}
              </div>
            </Section>

            {/* Unit Categories */}
            <Section title="Unit Types" icon={<Swords size={20} />}>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <BarRow
                      key={cat}
                      label={cat}
                      value={count}
                      total={data.units.length}
                      color="bg-green-500"
                    />
                  ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Advanced Tools */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
            <Database className="text-brand-accent" />
            Advanced Tools
          </h2>
          <DebugFeatures
            units={data.units}
            spells={data.spells}
            titans={data.titans}
            spellcasters={data.spellcasters}
            consumables={data.consumables}
            upgrades={data.upgrades}
          />
        </div>

        {/* Sample Data */}
        <div className="bg-surface-card backdrop-blur-md rounded-xl p-6 border border-surface-highlight">
          <h2 className="text-xl font-bold mb-4 text-brand-primary flex items-center gap-2">
            <Database size={20} />
            Sample Data Payload
          </h2>
          <div className="space-y-4">
            {data.units.slice(0, 3).map((unit) => (
              <div
                key={unit.entity_id}
                className="bg-surface-inset rounded-lg p-4 border border-border-subtle flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-border-default transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-accent transition-colors">
                    {unit.name}
                  </h3>
                  <p className="text-text-dimmed text-xs font-mono uppercase tracking-wider mt-1">
                    {unit.category} • {unit.magic_school} • Rank{" "}
                    {unit.rank || "-"}
                  </p>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-text-faint font-mono">
                    ID: {unit.entity_id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-4 flex items-center gap-4 hover:border-border-default transition-all">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${color}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-text-primary leading-none">
          {value}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-text-dimmed mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-border-subtle pb-4">
        <span className="text-text-muted">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = Math.round((value / total) * 100);

  return (
    <div className="relative group">
      <div className="flex justify-between items-end mb-1 text-xs">
        <span className="font-bold text-text-secondary uppercase tracking-wide">
          {label}
        </span>
        <span className="font-mono text-text-muted">
          {value} <span className="text-text-faint">({percentage}%)</span>
        </span>
      </div>
      <div className="h-2 w-full bg-surface-inset rounded-full overflow-hidden">
        <div
          className={`h-full ${color} opacity-80 group-hover:opacity-100 transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
