import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/admin/", "/design-system/"],
    },
    sitemap: "https://spellcastersdb.com/sitemap.xml",
  };
}
