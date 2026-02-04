import { MetadataRoute } from "next";
import { getUnits, getHeroes, getConsumables } from "@/lib/api";

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
  const [units, heroes, consumables] = await Promise.all([
    getUnits(),
    getHeroes(),
    getConsumables(),
  ]);

  // 3. Map Units
  const unitRoutes: MetadataRoute.Sitemap = units.map((unit) => ({
    url: `${baseUrl}/units/${unit.entity_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Map Heroes
  const heroRoutes: MetadataRoute.Sitemap = heroes.map((hero) => ({
    url: `${baseUrl}/heroes/${hero.hero_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 5. Map Consumables
  const consumableRoutes: MetadataRoute.Sitemap = consumables.map((item) => ({
    url: `${baseUrl}/consumables/${item.consumable_id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...heroRoutes, ...unitRoutes, ...consumableRoutes];
}
