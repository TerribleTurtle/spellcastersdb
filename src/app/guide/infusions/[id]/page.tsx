import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Box, Flame, Info, Skull, Snowflake, Zap } from "lucide-react";

import { UnitCard } from "@/components/database/UnitCard";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";
import { fetchGameData } from "@/services/api/api";
import { DamageTier, Infusion, UnifiedEntity } from "@/types/api";

type Props = {
  params: Promise<{ id: string }>;
};

// Static generation
export async function generateStaticParams() {
  const data = await fetchGameData();
  if (!data.infusions) return [];

  return data.infusions.map((inf: Infusion) => ({
    id: inf.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchGameData();
  const infusion = data.infusions?.find((i) => i.id === id);

  if (!infusion) return { title: "Infusion Not Found" };

  return {
    title: `${infusion.name} - SC Guide`,
    description: infusion.allied_effect,
  };
}

const INFUSION_ICONS: Record<string, React.ElementType> = {
  fire_infusion: Flame,
  lightning_infusion: Zap,
  poison_infusion: Skull,
  ice_infusion: Snowflake,
};

export default async function InfusionDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchGameData();
  const infusion = data.infusions?.find((i) => i.id === id);

  if (!infusion) {
    notFound();
  }

  // Find all entities that use this infusion
  const relatedEntities: UnifiedEntity[] = [];

  const checkMechanics = (mechanics?: { infusion?: { id: string } }) =>
    mechanics?.infusion?.id === id;

  // Check Units
  data.units.forEach((unit) => {
    if (checkMechanics(unit.mechanics)) relatedEntities.push(unit);
  });

  // Check Spells
  data.spells.forEach((spell) => {
    if (checkMechanics(spell.mechanics)) relatedEntities.push(spell);
  });

  // Check Spellcasters (Abilities)
  data.spellcasters.forEach((caster) => {
    const hasInfusion = [
      ...caster.abilities.passive,
      caster.abilities.primary,
      caster.abilities.defense,
      caster.abilities.ultimate,
    ].some((ability) => checkMechanics(ability.mechanics));

    if (hasInfusion) relatedEntities.push(caster);
  });

  const Icon = INFUSION_ICONS[infusion.id] || Info;

  return (
    <PageShell
      title={infusion.name}
      maxWidth="4xl"
      breadcrumbs={[
        { label: "Guide", href: routes.guide() },
        { label: "Infusions", href: routes.infusions() },
        { label: infusion.name, href: routes.infusion(infusion.id) },
      ]}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 lg:p-8 flex items-start gap-6">
          <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-brand-primary shrink-0 hidden sm:block">
            <Icon size={48} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-text-primary">
                {infusion.name}
              </h1>
              <span className="px-3 py-1 bg-surface-inset border border-border-subtle rounded-full text-xs font-bold text-text-muted uppercase tracking-wider">
                {infusion.element}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-surface-inset rounded border border-border-subtle">
                <h3 className="text-xs font-bold text-status-success-text uppercase tracking-widest flex items-center gap-2 mb-2">
                  Allied Effect
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {infusion.allied_effect}
                </p>
              </div>
              <div className="p-4 bg-surface-inset rounded border border-border-subtle">
                <h3 className="text-xs font-bold text-status-danger-text uppercase tracking-widest flex items-center gap-2 mb-2">
                  Enemy Effect
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {infusion.enemy_effect}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infusion.damage_tiers && infusion.damage_tiers.length > 0 ? (
            <section className="bg-surface-card border border-border-default rounded-lg p-6">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <Flame size={16} /> Damage Tiers
              </h3>
              <div className="space-y-2">
                {infusion.damage_tiers.map((tier: DamageTier) => (
                  <div
                    key={tier.tier}
                    className="flex items-center justify-between p-3 bg-surface-inset rounded border border-border-subtle"
                  >
                    <span className="font-bold text-brand-secondary">
                      Tier {tier.tier}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="text-text-primary">
                        {tier.value * 100}%
                      </span>
                      <span className="text-text-muted">
                        {tier.calculation_unit === "percent_max_hp"
                          ? "Max HP"
                          : tier.calculation_unit}
                        {tier.interval && ` / ${tier.interval}s`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="bg-surface-card border border-dashed border-border-default rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <Box size={32} className="text-text-dimmed mb-3" />
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-1">
                Damage Output
              </h3>
              <p className="text-sm text-text-dimmed">
                This infusion applies effects directly rather than scaled
                percentage damage over time.
              </p>
            </section>
          )}
        </div>

        {/* Cross-Reference Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-primary">
              Users & Sources
            </h2>
            <span className="px-2.5 py-1 bg-surface-inset rounded text-xs font-bold text-text-muted border border-border-subtle">
              {relatedEntities.length} matching
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            The following entities natively utilize {infusion.name} through
            their attacks, mechanics, or abilities.
          </p>

          {relatedEntities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relatedEntities.map((entity) => (
                <UnitCard key={entity.entity_id} unit={entity} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-card border border-dashed border-border-default rounded-lg p-12 text-center">
              <p className="text-text-muted italic">
                No standard entities currently utilize this infusion
                organically.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
