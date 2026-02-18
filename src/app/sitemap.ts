import { MetadataRoute } from "next";
import { fetchGameData } from "@/services/api/api";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://spellcastersdb.com";

  // 1. Fetch all dynamic data + build info
  const data = await fetchGameData();
  const {
    units,
    spellcasters,
    consumables,
    spells,
    titans,
    build_info: { generated_at },
  } = data;

  const lastModified = new Date(generated_at);

  // 2. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(), // Homepage always fresh
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/deck-builder`,
      lastModified: new Date(), // App logic might change
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
    {
      url: `${baseUrl}/changes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // 3. Map Units
  const unitRoutes: MetadataRoute.Sitemap = units.map((unit) => ({
    url: `${baseUrl}/incantations/units/${unit.entity_id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4a. Map Spells
  const spellRoutes: MetadataRoute.Sitemap = spells.map((spell) => ({
    url: `${baseUrl}/incantations/spells/${spell.entity_id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4b. Map Titans
  const titanRoutes: MetadataRoute.Sitemap = titans.map((titan) => ({
    url: `${baseUrl}/titans/${titan.entity_id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // 4. Map Spellcasters (URLs changed from /heroes/ to /spellcasters/)
  const spellcasterRoutes: MetadataRoute.Sitemap = spellcasters.map((s) => ({
    url: `${baseUrl}/spellcasters/${s.spellcaster_id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 5. Map Consumables
  const consumableRoutes: MetadataRoute.Sitemap = consumables.map((item) => ({
    url: `${baseUrl}/consumables/${item.entity_id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // 6. Map Categories (Classes, Schools, Ranks)
  const classes = ["Enchanter", "Duelist", "Conqueror"];
  const classRoutes: MetadataRoute.Sitemap = classes.map((c) => ({
    url: `${baseUrl}/classes/${c}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const schools = [
    "Elemental",
    "Wild",
    "War",
    "Astral",
    "Holy",
    "Technomancy",
    "Necromancy",
    "Titan",
  ];
  const schoolRoutes: MetadataRoute.Sitemap = schools.map((s) => ({
    url: `${baseUrl}/schools/${s}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const ranks = ["I", "II", "III", "IV"];
  const rankRoutes: MetadataRoute.Sitemap = ranks.map((r) => ({
    url: `${baseUrl}/ranks/${r}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...spellcasterRoutes,
    ...unitRoutes,
    ...spellRoutes,
    ...titanRoutes,
    ...consumableRoutes,
    ...classRoutes,
    ...schoolRoutes,
    ...rankRoutes,
  ];
}
