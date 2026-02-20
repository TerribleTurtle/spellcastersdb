"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { EntityMechanics } from "@/components/entity-card/EntityMechanics";
import { EntityStats } from "@/components/entity-card/EntityStats";
import { SpellcasterAbilities } from "@/components/entity-card/SpellcasterAbilities";
import { EntityDisplayItem } from "@/components/entity-card/types";
import { Breadcrumbs } from "@/components/inspector/Breadcrumbs";
import { PatchHistorySection } from "@/components/inspector/PatchHistorySection";
import { RelatedEntities } from "@/components/inspector/RelatedEntities";
import { GameImage } from "@/components/ui/GameImage";
import { SmartRankBadge } from "@/components/ui/rank-badge";
import {
  getCardAltText,
  getCardImageUrl,
} from "@/services/assets/asset-helpers";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import type { UnifiedEntity } from "@/types/api";
import type { PatchEntry, TimelineEntry } from "@/types/patch-history";

export type EntityItem = EntityDisplayItem;

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EntityShowcaseProps {
  item: EntityItem;
  backUrl?: string;
  backLabel?: string;
  changelog?: PatchEntry[];
  timeline?: TimelineEntry[];
  showControls?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  relatedEntities?: UnifiedEntity[];
  relatedTitle?: string;
}

export function EntityShowcase({
  item,
  backUrl,
  backLabel = "Back",
  changelog = [],
  timeline = [],
  showControls = false,
  breadcrumbs = [],
  relatedEntities = [],
  relatedTitle,
}: EntityShowcaseProps) {
  // Type Guards
  const isSpellcaster = "spellcaster_id" in item;
  const isUnit = !isSpellcaster;

  // Safe category access
  const category = isUnit
    ? (item as Unit | Spell | Titan).category
    : "Spellcaster";
  const name = item.name;

  let rank = "N/A";
  let isTitan = false;
  if (isSpellcaster) {
    if ("class" in item) {
      rank = (item as Spellcaster).class.toUpperCase();
    }
  } else {
    const entity = item as Unit | Spell | Titan;
    if (entity.category === "Titan") {
      rank = "V";
      isTitan = true;
    } else if (entity.category === "Spell") {
      rank = "N/A";
    } else if ("rank" in entity && entity.rank) {
      rank = entity.rank;
    }
  }

  // Magic School
  const magicSchoolRaw =
    "magic_school" in item ? (item as Unit | Spell | Titan).magic_school : null;
  const magicSchool = magicSchoolRaw === "Titan" ? null : magicSchoolRaw;

  // Tags
  const tags = "tags" in item ? item.tags : [];

  // Movement type (for units)
  const movementType =
    "movement_type" in item ? (item as Unit).movement_type : null;

  // Description
  const description = "description" in item ? item.description : null;

  return (
    <div className="min-h-screen w-full bg-surface-main/30 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 blur-[150px] rounded-full" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
        {/* Breadcrumbs + Back */}
        <div className="flex items-center gap-4 pt-16 md:pt-4">
          {backUrl && (
            <Link
              href={backUrl}
              className="p-2 bg-surface-card hover:bg-surface-hover rounded-full text-text-primary border border-border-default transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="sr-only">{backLabel}</span>
            </Link>
          )}
          {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        </div>

        {/* ================================================================ */}
        {/* HERO SECTION — Image + Title (Two Column on Desktop) */}
        {/* ================================================================ */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Left — Entity Image */}
          <div className="w-full md:w-80 shrink-0">
            <div className="relative w-full aspect-square md:aspect-[4/5] bg-surface-card border border-border-default rounded-2xl overflow-hidden group shadow-2xl">
              {/* Blurred Background */}
              <GameImage
                src={getCardImageUrl(item)}
                alt={getCardAltText(item)}
                fill
                priority
                className="object-cover opacity-30 blur-2xl scale-110"
              />
              {/* Main Image */}
              <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                <GameImage
                  src={getCardImageUrl(item)}
                  alt={getCardAltText(item)}
                  width={500}
                  height={500}
                  className="h-full w-auto max-w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-100 group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
              {/* Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-surface-card via-transparent to-transparent z-20 pointer-events-none" />

              {/* Badges overlaid on image */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-30">
                <div className="flex flex-col gap-1.5 items-start">
                  {rank && rank !== "N/A" && (
                    <SmartRankBadge
                      rank={rank}
                      isTitan={isTitan}
                      mode="text"
                      className="px-3 py-1 rounded text-xs font-bold font-mono shadow-lg"
                      fallbackClassName="bg-surface-card px-3 py-1 rounded text-xs font-bold font-mono text-brand-accent border border-brand-accent/30 backdrop-blur-md shadow-lg"
                    />
                  )}
                  {magicSchool && (
                    <Link
                      href={`/schools/${magicSchool}`}
                      className="bg-brand-secondary/80 hover:bg-brand-secondary text-text-primary px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors"
                    >
                      {magicSchool}
                    </Link>
                  )}
                </div>
                <span className="bg-brand-primary/90 text-text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-border-default">
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Title + Overview + Quick Facts */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary mb-2 drop-shadow-md">
                {name}
              </h1>
              {description && (
                <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-xl">
                  {description}
                </p>
              )}
            </div>

            {/* Quick Facts */}
            <div className="flex flex-wrap gap-2">
              {movementType && (
                <span className="bg-surface-card border border-border-default text-text-secondary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {movementType}
                </span>
              )}
              {(() => {
                const pop =
                  "population" in item ? (item as Unit).population : undefined;
                return pop != null && pop > 0 ? (
                  <span className="bg-surface-card border border-border-default text-text-secondary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Pop: {pop}
                  </span>
                ) : null;
              })()}
              {(() => {
                const cd =
                  "cooldown" in item ? (item as Spell).cooldown : undefined;
                return cd != null && cd > 0 ? (
                  <span className="bg-surface-card border border-border-default text-text-secondary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    CD: {cd}s
                  </span>
                ) : null;
              })()}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/database?search=${encodeURIComponent(tag)}`}
                    className="bg-surface-card hover:bg-surface-hover border border-border-subtle hover:border-brand-primary/30 text-text-muted hover:text-text-primary px-2.5 py-1 rounded text-[10px] font-medium transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Stats Section — Inline on desktop */}
            <div className="bg-surface-card border border-border-default rounded-xl p-4 sm:p-5">
              <h2 className="text-xs font-bold text-text-dimmed uppercase tracking-widest mb-3">
                Stats
              </h2>
              <EntityStats item={item} variant="detailed" />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CONTENT SECTIONS */}
        {/* ================================================================ */}
        <div className="space-y-6">
          {/* Mechanics Section */}
          {"mechanics" in item && item.mechanics && (
            <section className="bg-surface-card border border-border-default rounded-xl p-4 sm:p-5 animate-in fade-in duration-500 delay-100">
              <EntityMechanics item={item} variant="detailed" />
            </section>
          )}

          {/* Abilities Section (Spellcasters) */}
          {isSpellcaster && (
            <section className="bg-surface-card border border-border-default rounded-xl p-4 sm:p-5 animate-in fade-in duration-500 delay-200">
              <SpellcasterAbilities item={item} variant="detailed" />
            </section>
          )}

          {/* Related Entities */}
          {relatedEntities.length > 0 && (
            <section className="bg-surface-card border border-border-default rounded-xl p-4 sm:p-5 animate-in fade-in duration-500 delay-300">
              <RelatedEntities
                entities={relatedEntities}
                title={relatedTitle}
              />
            </section>
          )}

          {/* Patch History */}
          {(changelog.length > 0 || timeline.length > 0) && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <PatchHistorySection
                changelog={changelog}
                timeline={timeline}
                showControls={showControls}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
