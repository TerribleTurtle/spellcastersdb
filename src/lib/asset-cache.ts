/**
 * In-memory cache for asset Data URIs to prevent repeated fetching/buffering.
 * Keys are URLs, Values are Data URIs (base64).
 */
export const assetCache = new Map<string, string>();

/**
 * Helper to get or fetch an asset as a Data URI.
 * @param url The URL to fetch.
 * @returns The Data URI string.
 */
export async function getCachedAsset(url: string): Promise<string | null> {
  if (assetCache.has(url)) {
    return assetCache.get(url)!;
  }

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mime = url.endsWith(".webp") ? "image/webp" : "image/png";
      const dataUri = `data:${mime};base64,${base64}`;
      
      // Cache it
      assetCache.set(url, dataUri);
      return dataUri;
    }
  } catch (e) {
    console.warn("Asset fetch failed", url, e);
  }

  return null;
}
