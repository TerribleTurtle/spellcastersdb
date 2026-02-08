import { MetadataRoute } from "next";
import { getUnits, getSpellcasters, getConsumables, getSpells } from "@/lib/api";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://spellcastersdb.com";

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/deck-builder`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/debug`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.1,
    },
  ];

  // 2. Fetch all dynamic data
  const [units, spellcasters, consumables, spells] = await Promise.all([
    getUnits(),
    getSpellcasters(),
    getConsumables(),
    getSpells(),
  ]);

  // 3. Map Units
  const unitRoutes: MetadataRoute.Sitemap = units.map((unit) => ({
    url: `${baseUrl}/incantations/units/${unit.entity_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4a. Map Spells
  const spellRoutes: MetadataRoute.Sitemap = spells.map((spell) => ({
    url: `${baseUrl}/incantations/spells/${spell.entity_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Map Spellcasters (URLs changed from /heroes/ to /spellcasters/)
  const spellcasterRoutes: MetadataRoute.Sitemap = spellcasters.map((s) => ({
    url: `${baseUrl}/spellcasters/${s.spellcaster_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 5. Map Consumables
  const consumableRoutes: MetadataRoute.Sitemap = consumables.map((item) => ({
    url: `${baseUrl}/consumables/${item.entity_id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...spellcasterRoutes, ...unitRoutes, ...consumableRoutes, ...spellRoutes];
}
