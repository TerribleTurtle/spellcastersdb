import { ImageResponse } from "next/og";
import { AllDataResponse, Unit, Spellcaster, Spell, Titan } from "@/types/api";

export function renderEntityImage(
  entityId: string,
  data: AllDataResponse,
  fontData: ArrayBuffer,

): ImageResponse {
  // 1. Find Entity (Unit, Spellcaster, Spell, Titan)
  // We check multiple arrays
  let entity: Unit | Spellcaster | Spell | Titan | undefined;
  let type = "Unknown";

  if (!entity) {
    entity = data.units.find((u) => u.entity_id === entityId);
    if (entity) type = "Unit";
  }
  if (!entity) {
    entity = data.spellcasters.find((s) => s.spellcaster_id === entityId);
    if (entity) type = "Spellcaster";
  }
  if (!entity) {
    entity = data.spells.find((s) => s.entity_id === entityId);
    if (entity) type = "Spell";
  }
  if (!entity) {
    entity = data.titans.find((t) => t.entity_id === entityId);
    if (entity) type = "Titan";
  }

  if (!entity) {
    return new Response("Entity Not Found", { status: 404 });
  }

  // 2. Extract Data
  const name = entity.name;
  let subtext = type;

  // Type-specific extraction
  if (type === "Spellcaster") {
      const s = entity as Spellcaster;
      subtext = `${s.class || ""} Class`;
  } else if (type === "Unit") {
      const u = entity as Unit;
      // Fixed property access
      subtext = `${u.rank || ""} ${u.magic_school || ""} Unit`; 
  }

  // 3. Render Image
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          backgroundImage: "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          color: "white",
          fontFamily: '"Oswald"',
          position: "relative",
        }}
      >
        {/* Background Accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(90deg, #a855f7, #ec4899)",
          }}
        />

        {/* Content Container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "40px", textAlign: "center" }}>
            
            {/* Type/Subtext */}
            <div style={{ 
                fontSize: 30, 
                color: "#94a3b8", 
                textTransform: "uppercase", 
                letterSpacing: "4px",
                fontWeight: 400
            }}>
                {subtext}
            </div>

            {/* Name */}
            <div style={{ 
                fontSize: 80, 
                fontWeight: 700, 
                background: "linear-gradient(to bottom right, #fff, #cbd5e1)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: 1.1,
                marginBottom: "10px"
            }}>
                {name}
            </div>

            {/* Logo/Footer */}
            <div style={{ 
                position: "absolute", 
                bottom: 40, 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                fontSize: 24,
                color: "#a855f7"
            }}>
                <span>SPELLCASTERS</span>
                <span style={{ color: "white" }}>DB</span>
            </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Oswald",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
