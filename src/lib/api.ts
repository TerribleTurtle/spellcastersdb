/**
 * API Fetching Service for Spellcasters Community API
 * Implements Stale-While-Revalidate (SWR) caching strategy via Next.js fetch
 */

import type { AllDataResponse, Unit, Hero, Consumable, Upgrade } from "@/types/api";

const API_BASE_URL = "https://terribleturtle.github.io/spellcasters-community-api/api/v1";
const REVALIDATE_SECONDS = 60; // 1 minute cache

/**
 * Fetches the complete game data from all_data.json
 * Uses Next.js fetch with automatic revalidation
 */
export async function fetchGameData(): Promise<AllDataResponse> {
  const url = `${API_BASE_URL}/all_data.json`;
  
  try {
    const response = await fetch(url, {
      next: { 
        revalidate: REVALIDATE_SECONDS,
        tags: ['game-data']
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game data: ${response.status} ${response.statusText}`);
    }

    const data: AllDataResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
}

/**
 * Returns all units (Creatures, Buildings, Spells, Titans)
 */
export async function getUnits(): Promise<Unit[]> {
  const data = await fetchGameData();
  return data.units;
}

/**
 * Returns all heroes
 */
export async function getHeroes(): Promise<Hero[]> {
  const data = await fetchGameData();
  return data.heroes;
}

/**
 * Returns all consumables
 */
export async function getConsumables(): Promise<Consumable[]> {
  const data = await fetchGameData();
  return data.consumables;
}

/**
 * Returns all upgrades
 */
export async function getUpgrades(): Promise<Upgrade[]> {
  const data = await fetchGameData();
  return data.upgrades;
}

/**
 * Get a specific unit by entity_id
 */
export async function getUnitById(entityId: string): Promise<Unit | null> {
  const units = await getUnits();
  return units.find(unit => unit.entity_id === entityId) || null;
}

/**
 * Get a specific hero by entity_id
 */
export async function getHeroById(entityId: string): Promise<Hero | null> {
  const heroes = await getHeroes();
  return heroes.find(hero => hero.hero_id === entityId) || null;
}

/**
 * Filter units by category
 */
export async function getUnitsByCategory(category: Unit['category']): Promise<Unit[]> {
  const units = await getUnits();
  return units.filter(unit => unit.category === category);
}

/**
 * Filter units by magic school
 */
export async function getUnitsByMagicSchool(school: Unit['magic_school']): Promise<Unit[]> {
  const units = await getUnits();
  return units.filter(unit => unit.magic_school === school);
}
