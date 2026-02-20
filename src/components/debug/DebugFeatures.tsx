"use client";

import { useMemo, useState } from "react";

import {
  AlertTriangle,
  BarChart3,
  Info,
  Search,
  Search as SearchIcon,
  Shield,
  Sword,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Consumable,
  Spell,
  Spellcaster,
  Titan,
  UnifiedEntity,
  Unit,
  Upgrade,
} from "@/types/api";

interface DebugFeaturesProps {
  units: Unit[];
  spells: Spell[];
  titans: Titan[];
  spellcasters: Spellcaster[];
  consumables: Consumable[];
  upgrades: Upgrade[];
}

type Tab = "integrity" | "keywords" | "balance" | "search";

export function DebugFeatures({
  units,
  spells,
  titans,
  spellcasters,
  consumables,
  upgrades,
}: DebugFeaturesProps) {
  const [activeTab, setActiveTab] = useState<Tab>("integrity");

  // Combine for easier processing
  const allEntities = useMemo(() => {
    return [
      ...units,
      ...spells,
      ...titans,
      ...spellcasters,
      ...consumables,
      ...upgrades,
    ] as UnifiedEntity[];
  }, [units, spells, titans, spellcasters, consumables, upgrades]);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border-default pb-4">
        <TabButton
          id="integrity"
          label="Data Integrity"
          icon={<AlertTriangle size={16} />}
          active={activeTab === "integrity"}
          onClick={setActiveTab}
        />
        <TabButton
          id="keywords"
          label="Keyword Analysis"
          icon={<Info size={16} />}
          active={activeTab === "keywords"}
          onClick={setActiveTab}
        />
        <TabButton
          id="balance"
          label="Balance Stats"
          icon={<BarChart3 size={16} />}
          active={activeTab === "balance"}
          onClick={setActiveTab}
        />
        <TabButton
          id="search"
          label="Search Playground"
          icon={<Search size={16} />}
          active={activeTab === "search"}
          onClick={setActiveTab}
        />
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "integrity" && <IntegrityTab entities={allEntities} />}
        {activeTab === "keywords" && <KeywordsTab entities={allEntities} />}
        {activeTab === "balance" && (
          <BalanceTab units={units} titans={titans} />
        )}
        {activeTab === "search" && <SearchTab entities={allEntities} />}
      </div>
    </div>
  );
}

// --- Tab Components ---

function IntegrityTab({ entities }: { entities: UnifiedEntity[] }) {
  const issues = useMemo(() => {
    const ids = new Set<string>();
    const duplicates: string[] = [];
    const missingName: UnifiedEntity[] = [];
    const missingDescription: UnifiedEntity[] = [];

    entities.forEach((e) => {
      // Check ID
      if (ids.has(e.entity_id)) {
        duplicates.push(e.entity_id);
      } else {
        ids.add(e.entity_id);
      }

      // Check Name
      if (!e.name || e.name.trim() === "") {
        missingName.push(e);
      }

      // Check Description
      if (
        "description" in e &&
        (!e.description || e.description.trim() === "")
      ) {
        missingDescription.push(e);
      }
    });

    return { duplicates, missingName, missingDescription };
  }, [entities]);

  return (
    <div className="grid gap-6">
      <Card className="bg-surface-card border-border-default">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="text-status-warning" /> Integrity Report
          </CardTitle>
          <CardDescription>
            Scanned {entities.length} entities for common data issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrityItem
            label="Duplicate IDs"
            count={issues.duplicates.length}
            items={issues.duplicates}
            variant="destructive"
          />
          <IntegrityItem
            label="Missing Names"
            count={issues.missingName.length}
            items={issues.missingName.map((e) => e.entity_id)}
            variant="warning"
          />
          <IntegrityItem
            label="Missing Descriptions"
            count={issues.missingDescription.length}
            items={issues.missingDescription.map(
              (e) => `${e.name} (${e.entity_id})`
            )}
            variant="warning"
          />
          {issues.duplicates.length === 0 &&
            issues.missingName.length === 0 &&
            issues.missingDescription.length === 0 && (
              <div className="text-status-success-text flex items-center gap-2 p-4 bg-status-success-muted rounded-lg border border-status-success-border">
                <span>✅</span> All explicit integrity checks passed!
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

const KEYWORDS = [
  "Stun",
  "Silence",
  "Root",
  "Slow",
  "Freeze",
  "Burn",
  "Poison",
  "Heal",
  "Shield",
  "Summon",
  "Knockback",
  "Pull",
  "Flying",
  "Stealth",
];

function KeywordsTab({ entities }: { entities: UnifiedEntity[] }) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    KEYWORDS.forEach((k) => (counts[k] = 0));

    entities.forEach((e) => {
      const text = JSON.stringify(e).toLowerCase();
      KEYWORDS.forEach((k) => {
        // Simple string includes check - crude but effective for debug
        if (text.includes(k.toLowerCase())) {
          counts[k]++;
        }
      });
    });

    return counts;
  }, [entities]);

  return (
    <Card className="bg-surface-card border-border-default">
      <CardHeader>
        <CardTitle>Keyword Frequency</CardTitle>
        <CardDescription>
          Occurrences of common mechanics in entity data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([word, count]) => (
              <div
                key={word}
                className="bg-surface-dim p-3 rounded-lg flex justify-between items-center border border-border-subtle"
              >
                <span className="font-medium text-text-secondary">{word}</span>
                <span className="text-xl font-bold text-brand-primary">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceTab({ units, titans }: { units: Unit[]; titans: Titan[] }) {
  const combatants = useMemo(() => [...units, ...titans], [units, titans]);

  const stats = useMemo(() => {
    // Glass Cannons: High DMG / HP ratio
    // Tanks: High HP / DMG ratio
    // We'll normalize by cost/rank if possible, but let's just do raw ratios for now.

    // Filter out buildings or 0 damage things if needed
    const fighters = combatants.filter(
      (u) => (u.damage || 0) > 0 && u.health > 0
    );

    const sortedByDmgToHp = [...fighters].sort((a, b) => {
      const ratioA = (a.damage || 0) / a.health;
      const ratioB = (b.damage || 0) / b.health;
      return ratioB - ratioA; // Descending
    });

    const sortedByHp = [...fighters].sort((a, b) => b.health - a.health);
    const sortedByDmg = [...fighters].sort(
      (a, b) => (b.damage || 0) - (a.damage || 0)
    );

    return {
      glassCannons: sortedByDmgToHp.slice(0, 5),
      tanks: sortedByHp.slice(0, 5),
      topDmg: sortedByDmg.slice(0, 5),
    };
  }, [combatants]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <RankingList
          title="Glass Cannons (DMG/HP)"
          items={stats.glassCannons}
          metricFn={(u) => `${u.damage} / ${u.health}`}
          icon={<Sword className="text-status-danger-text" />}
        />
        <RankingList
          title="Meat Shields (Max HP)"
          items={stats.tanks}
          metricFn={(u) => `${u.health} HP`}
          icon={<Shield className="text-status-info-text" />}
        />
        <RankingList
          title="Top Hitters (Raw DMG)"
          items={stats.topDmg}
          metricFn={(u) => `${u.damage} DMG`}
          icon={<Sword className="text-orange-400" />}
        />
      </div>
    </div>
  );
}

function SearchTab({ entities }: { entities: UnifiedEntity[] }) {
  const [query, setQuery] = useState("");

  // Simple client-side filtering for playground
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return entities
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          ("description" in e && e.description.toLowerCase().includes(q)) ||
          ("tags" in e && e.tags?.some((t) => t.toLowerCase().includes(q)))
      )
      .slice(0, 20); // Limit
  }, [query, entities]);

  return (
    <Card className="bg-surface-card border-border-default">
      <CardHeader>
        <CardTitle>Search Playground</CardTitle>
        <CardDescription>
          Test search behavior against {entities.length} entities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
            />
            <Input
              placeholder="Type to search..."
              className="pl-10 bg-surface-dim border-border-default text-text-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          {query && results.length === 0 && (
            <div className="text-center py-8 text-text-dimmed">
              No matches found.
            </div>
          )}
          {results.map((e) => (
            <div
              key={e.entity_id}
              className="p-3 rounded bg-surface-dim border border-border-subtle flex justify-between items-center group hover:bg-surface-card transition-colors"
            >
              <div>
                {e.name}
                <div className="text-xs text-text-dimmed font-mono">
                  {e.category} • {e.entity_id}
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs border-border-default text-text-muted group-hover:text-text-primary transition-colors"
              >
                {("magic_school" in e ? e.magic_school : undefined) ||
                  "Neutral"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Helpers ---

function TabButton({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (id: Tab) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
        active
          ? "bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/20"
          : "bg-surface-highlight hover:bg-surface-hover text-text-muted hover:text-text-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function IntegrityItem({
  label,
  count,
  items,
  variant,
}: {
  label: string;
  count: number;
  items: string[];
  variant: "destructive" | "warning";
}) {
  if (count === 0) return null;

  const color =
    variant === "destructive"
      ? "text-status-danger-text"
      : "text-status-warning-text";
  const bg =
    variant === "destructive"
      ? "bg-status-danger-muted"
      : "bg-status-warning-muted";
  const border =
    variant === "destructive"
      ? "border-status-danger-border"
      : "border-status-warning-border";

  return (
    <div className={`p-4 rounded-lg border ${bg} ${border}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`font-bold ${color}`}>{label}</h4>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Badge variant={variant as any}>{count}</Badge>
      </div>
      <div className="text-xs font-mono text-text-muted max-h-32 overflow-auto">
        {items.join(", ")}
      </div>
    </div>
  );
}

function RankingList({
  title,
  items,
  metricFn,
  icon,
}: {
  title: string;
  items: (Unit | Titan)[];
  metricFn: (u: Unit | Titan) => string;
  icon: React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="bg-surface-card border-border-default">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.entity_id}
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-text-faint w-4">{i + 1}</span>
              <span className="font-medium text-text-secondary">
                {item.name}
              </span>
            </div>
            <span className="font-mono text-brand-secondary">
              {metricFn(item)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
