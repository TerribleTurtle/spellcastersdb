import { ImageResponse } from "next/og";

import { getCachedAsset } from "@/services/api/asset-cache";
import {
  getCardAltText,
  getCardImageUrl,
} from "@/services/assets/asset-helpers";
import { monitoring } from "@/services/monitoring";
import { decodeTeam } from "@/services/utils/encoding";
import { AllDataResponse, UnifiedEntity } from "@/types/api";

export async function renderTeamImage(
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
    "Cache-Control":
      "public, max-age=86400, stale-while-revalidate=43200, immutable",
    "Content-Type": "image/png",
  };

  const resolveUrl = (url: string) => {
    if (url.startsWith("/")) return `${origin}${url}`;
    if (!url.startsWith("http")) return `${origin}/${url}`;
    return url;
  };

  const { name: teamName, decks } = decodeTeam(hash);

  // Resolve Spellcasters & Pre-fetch
  const spellcastersDetails = decks.map((d) => {
    if (!d || !d.spellcasterId) return null;
    const sc = data.spellcasters.find(
      (s) => s.spellcaster_id === d.spellcasterId
    );
    return {
      spellcaster: sc,
      deckName: d.name || (sc ? `${sc.name} Deck` : "Unknown Deck"),
    };
  });

  // Pre-fetch images
  const urlToDataUri = new Map<string, string>();
  const uniqueUrls = new Set<string>();

  spellcastersDetails.forEach((item) => {
    if (item && item.spellcaster) {
      uniqueUrls.add(
        resolveUrl(
          getCardImageUrl(item.spellcaster, {
            forceRemote: true,
            forceFormat: "png",
          })
        )
      );
    }
  });

  await Promise.all(
    Array.from(uniqueUrls).map(async (url) => {
      try {
        const dataUri = await getCachedAsset(url);
        if (dataUri) {
          urlToDataUri.set(url, dataUri);
        }
      } catch (e) {
        monitoring.captureMessage("Team image fetch failed", "warning", {
          url,
          error: e,
        });
      }
    })
  );

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
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: bgDark,
        backgroundImage: `radial-gradient(circle at 50% 0%, #2e1065 0%, ${bgDark} 50%)`,
        color: "white",
        fontFamily: fontData ? '"Oswald"' : "sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "50px 80px",
      }}
    >
      {/* Background Elements */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "20%",
          width: "40%",
          height: "40%",
          backgroundImage: `radial-gradient(closest-side, ${primary} 0%, transparent 100%)`,
          opacity: 0.15,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "40%",
          height: "40%",
          backgroundImage: `radial-gradient(closest-side, ${accent} 0%, transparent 100%)`,
          opacity: 0.15,
          zIndex: 0,
        }}
      />

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
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "white",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {teamName || "TEAM TRINITY"}
            </div>
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
        </div>

        {/* 3 Columns Grid */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            width: "100%",
          }}
        >
          {spellcastersDetails.map((item, i) => {
            const sc = item?.spellcaster;
            const dName = item?.deckName;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  height: "100%",
                }}
              >
                {sc ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      border: `4px solid ${primary}`, // Thicker border
                      borderRadius: 24,
                      overflow: "hidden",
                      display: "flex",
                    }}
                  >
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageSrc(sc)}
                      alt={getCardAltText(sc)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* Name Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: 180, // Tall gradient
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "0 24px 32px 24px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 40,
                          fontWeight: 900,
                          color: "white",
                          textShadow: "0 4px 12px rgba(0,0,0,0.8)",
                          lineHeight: 1,
                          marginBottom: 8,
                        }}
                      >
                        {dName}
                      </span>
                      <span
                        style={{
                          fontSize: 24,
                          color: accent,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {sc.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Empty Slot
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 24,
                      border: "2px dashed rgba(255,255,255,0.1)",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 40,
                        color: "rgba(255,255,255,0.2)",
                      }}
                    >
                      ?
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
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
