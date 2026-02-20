import { JsonLd } from "./JsonLd";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsLdProps {
  items: BreadcrumbItem[];
  id?: string;
}

/**
 * Generates JSON-LD for a BreadcrumbList.
 * Automatically adds the "position" property.
 *
 * @param items Array of { name, url } objects in order (Home -> Category -> Item)
 */
export function BreadcrumbsLd({ items, id }: BreadcrumbsLdProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `https://spellcastersdb.com${item.url}`,
    })),
  };

  return <JsonLd data={breadcrumbSchema} id={id || "json-ld-breadcrumbs"} />;
}
