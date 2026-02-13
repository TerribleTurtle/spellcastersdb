import { ImageResponse } from "next/og";
import { decodeDeck } from "@/services/encoding";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { AllDataResponse, Spell, Titan, UnifiedEntity, Unit } from "@/types/api";

export async function renderDeckImage(
  hash: string,
  data: AllDataResponse,
  fontData: ArrayBuffer | null,
  origin: string
) {
  // Shared Constants
  const bgDark = "#0f172a";
  const primary = "#a855f7";
  const accent = "#22d3ee";

  // Cache Control
  const headers = {
    "Cache-Control": "public, max-age=2592000, immutable",
    "Content-Type": "image/png",
  };

  const resolveUrl = (url: string) => {
    if (url.startsWith("/")) return `${origin}${url}`;
    if (!url.startsWith("http")) return `${origin}/${url}`;
    return url;
  };

  const decoded = decodeDeck(hash);
  if (!decoded) {
    return new Response("Invalid deck string", { status: 400 });
  }

  const { name: deckNameFromHash, spellcasterId, slotIds } = decoded;

  // Resolve Entities
  const spellcaster = data.spellcasters.find(
    (s) => s.spellcaster_id === spellcasterId
  );

  // Resolve Units/Spells/Titans
  const units = slotIds.map((id) => {
    if (!id) return null;
    let found: Unit | Spell | Titan | undefined;
    found = data.units.find((u) => u.entity_id === id);
    if (!found) found = data.spells.find((s) => s.entity_id === id);
    if (!found) found = data.titans.find((t) => t.entity_id === id);
    return found || null;
  });

  const deckName =
    deckNameFromHash || `${spellcaster?.name || "Unknown"}'s Deck`;



  // --- PRE-FETCH IMAGES FOR PERFORMANCE ---
  const urlToDataUri = new Map<string, string>();
  const uniqueUrls = new Set<string>();

  if (spellcaster)
    uniqueUrls.add(
      resolveUrl(
        getCardImageUrl(spellcaster, {
          forceRemote: true,
          forceFormat: "png",
        })
      )
    );
  units.forEach((u) => {
    if (u)
      uniqueUrls.add(
        resolveUrl(
          getCardImageUrl(u, { forceRemote: true, forceFormat: "png" })
        )
      );
  });

  try {
    await Promise.all(
      Array.from(uniqueUrls).map(async (url) => {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 4000); // 4s timeout per image

          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(id);

          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const mime = url.endsWith(".webp") ? "image/webp" : "image/png";
            urlToDataUri.set(url, `data:${mime};base64,${base64}`);
          } else {
            console.warn(`Failed to fetch image: ${url} (${res.status})`);
          }
        } catch (err) {
          console.warn(`Error fetching image: ${url}`, err);
        }
      })
    );
  } catch (e) {
    console.error("Critical error during image pre-fetch", e);
  }

  const getImageSrc = (entity: UnifiedEntity) => {
    const url = resolveUrl(
      getCardImageUrl(entity, { forceRemote: true, forceFormat: "png" })
    );
    // CRITICAL: Return cached data URI or fallback. 
    // Do NOT return the raw URL if fetch failed, as Satori may crash trying to fetch it.
    const cached = urlToDataUri.get(url);
    if (cached) return cached;
    
    // Fallback: Transparent 1x1 pixel
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgDark,
          backgroundImage: `radial-gradient(circle at 10% 10%, #2e1065 0%, ${bgDark} 80%)`,
          color: "white",
          fontFamily: fontData ? '"Oswald"' : "sans-serif",
          padding: "50px 80px", // More padding for "clean" look
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Elements - Subtle and Clean (No Blur for Performance) */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            backgroundImage: `radial-gradient(closest-side, ${primary} 0%, transparent 100%)`,
            opacity: 0.15,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "60%",
            height: "60%",
            backgroundImage: `radial-gradient(closest-side, ${accent} 0%, transparent 100%)`,
            opacity: 0.15,
            zIndex: 0,
          }}
        />

        {/* Content Wrapper */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 40,
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              paddingBottom: 20,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Title */}
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {deckName}
              </div>
              {/* Subtitle / Label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginTop: 8,
                  letterSpacing: "0.05em",
                }}
              >
                <span style={{ color: primary, marginRight: 8 }}>
                  SPELLCASTERS
                </span>
                <span style={{ color: "white" }}>DB</span>
              </div>
            </div>

            {/* Faction/Data on Right (Optional visual balance) */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Could put mana curve or something here later. For now, just clean space. */}
            </div>
          </div>

          {/* Main Content Area: Spellcaster + Units */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              width: "100%",
              gap: 40,
            }}
          >
            {/* SPELLCASTER CARD (Left) */}
            {spellcaster && (
              <div
                style={{
                  display: "flex",
                  width: 320,
                  height: 480,
                  position: "relative",
                  borderRadius: 24,
                  border: `4px solid ${primary}`,
                  // boxShadow removed for performance
                  overflow: "hidden",
                  backgroundColor: "#1e293b",
                }}
              >
                {/* Image */}
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageSrc(spellcaster)}
                  alt={spellcaster.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Name Overlay (Gradient) */}
                  {/* Name Overlay (Gradient) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: 160,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "0 20px 24px 20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      color: "white",
                      textShadow: "0 4px 12px rgba(0,0,0,0.8)",
                      lineHeight: 0.9,
                      marginBottom: 20,
                    }}
                  >
                    {spellcaster.name}
                  </span>
                </div>
              </div>
            )}

            {/* UNITS GRID (Right) */}
            <div
              style={{
                display: "flex",
                flex: 1,
                height: "100%",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {[...Array(5)].map((_, i) => {
                const unit = units[i];

                // Empty Slot
                if (!unit) {
                  return (
                    <div
                      key={i}
                      style={{
                        width: 200,
                        height: 300,
                        borderRadius: 16,
                        border: "2px dashed rgba(255,255,255,0.1)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      />
                    </div>
                  );
                }

                const isTitan = unit.category === "Titan";
                const isSpell = unit.category === "Spell";

                let rankKey = "I";
                if (isTitan) rankKey = "Titan";
                else if (isSpell) rankKey = "Spell";
                else if ("rank" in unit && unit.rank) rankKey = unit.rank;

                const rarityColor =
                  (
                    {
                      Titan: accent,
                      Spell: "#f472b6",
                      I: "#94a3b8",
                      II: "#60a5fa",
                      III: primary,
                      IV: "#facc15",
                    } as Record<string, string>
                  )[rankKey] || "#94a3b8";

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      width: 200,
                      height: 300,
                      position: "relative",
                      borderRadius: 16,
                      overflow: "hidden",
                      border: `4px solid ${rarityColor}`,
                      backgroundColor: "#1e293b",
                      // boxShadow removed for performance
                    }}
                  >
                    {/* Card Image */}
                    {/* Card Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageSrc(unit)}
                      alt={unit.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* Rank/Type Badge (Top Right) */}
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: rarityColor,
                        color: "#0f172a",
                        fontSize: 16,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 8,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {rankKey === "Spell"
                        ? "SPL"
                        : rankKey === "Titan"
                          ? "TTN"
                          : rankKey}
                    </div>

                    {/* Name Overlay (Bottom) */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: 120, // Taller gradient for safety
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "0 14px 20px 14px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 32, // bumped from 30
                          fontWeight: 900,
                          color: "white",
                          lineHeight: 1,
                          textShadow: "0 3px 8px rgba(0,0,0,0.9)",
                        }}
                      >
                        {unit.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1600,
      height: 840,
      headers,
      fonts: fontData
        ? [
            {
              name: "Oswald",
              data: fontData,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    }
  );
}
