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
// Request deduplication map
const pendingRequests = new Map<string, Promise<string | null>>();

export async function getCachedAsset(url: string): Promise<string | null> {
  if (assetCache.has(url)) {
    return assetCache.get(url)!;
  }

  // Deduplication: Return existing promise if already fetching
  if (pendingRequests.has(url)) {
      return pendingRequests.get(url)!;
  }

  const fetchPromise = (async () => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000); // Increased timeout
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (res.ok) {
            let dataUri = "";

            if (typeof window !== "undefined" && typeof FileReader !== "undefined") {
                // Browser Environment: Use Blob & FileReader
                const blob = await res.blob();
                dataUri = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else {
                // Server/Node Environment: Use Buffer
                const arrayBuffer = await res.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString("base64");
                const mime = url.endsWith(".webp") ? "image/webp" : "image/png";
                dataUri = `data:${mime};base64,${base64}`;
            }
            
            // Cache it
            assetCache.set(url, dataUri);
            return dataUri;
        }
    } catch (e) {
        console.warn("Asset fetch failed", url, e);
    } finally {
        pendingRequests.delete(url);
    }
    return null;
  })();

  pendingRequests.set(url, fetchPromise);
  return fetchPromise;
}
