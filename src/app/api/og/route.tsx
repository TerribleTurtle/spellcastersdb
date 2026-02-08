/**
 * @file route.tsx
 * @description CRITICAL CORE COMPONENT. Public API for generating Social Share (OG) Images.
 * DO NOT DELETE OR MODIFY WITHOUT VERIFICATION.
 */
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

import { decodeDeck, decodeTeam } from '@/lib/encoding';
import { fetchGameData } from '@/lib/api';
import { getCardImageUrl } from '@/lib/utils';
import { Unit, Spell, Titan } from '@/types/api';

// Font fallback strategy:
// We try to fetch Oswald. If it fails, we silently continue, and ImageResponse will use its default.
const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/oswald/Oswald-Bold.ttf';

export async function GET(request: NextRequest) {
  console.log("Team OG: Handling Request", request.url);
  // Cache Control (The "Sharpness" Lock)
  const headers = {
      'Cache-Control': 'public, max-age=2592000, immutable',
      'Content-Type': 'image/png',
  };
    try {
    const { searchParams, origin } = new URL(request.url);
    const deckHash = searchParams.get('deck') || searchParams.get('d');
    const teamHash = searchParams.get('team');

    const resolveUrl = (url: string) => {
        if (url.startsWith('/')) return `${origin}${url}`;
        return url;
    };

    // --- TEAM MODE ---
    if (teamHash) { 
        const { name: teamName, decks } = decodeTeam(teamHash);

        // Fetch Game Data
        const data = await fetchGameData();

        // Resolve Spellcasters
        const spellcasters = decks.map(d => {
            if (!d || !d.spellcasterId) return null;
            return data.spellcasters.find(h => h.spellcaster_id === d.spellcasterId);
        });

        const bgDark = '#0f172a';
        const primary = '#a855f7';
        const accent = '#22d3ee';

        // Load Font (Oswald)
        let fontData: ArrayBuffer | null = null;
        try {
            const fontRes = await fetch(fontUrl);
            if (fontRes.ok) fontData = await fontRes.arrayBuffer();
        } catch (e) { console.warn('Font fetch failed', e); }

        console.log("Team OG: About to render ImageResponse");
        
        // Restore ImageResponse (No Custom Font for now to test stability)
        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: bgDark,
                    backgroundImage: `radial-gradient(circle at 50% 0%, #2e1065 0%, ${bgDark} 50%)`,
                    color: 'white',
                    fontFamily: fontData ? '"Oswald"' : 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                     {/* Background Elements */}
                    <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '70%', height: '70%', background: '#020617', filter: 'blur(80px)', opacity: 0.9, zIndex: 0 }} />
                    <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '40%', height: '40%', background: primary, filter: 'blur(140px)', opacity: 0.25, zIndex: 0 }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: accent, filter: 'blur(140px)', opacity: 0.2, zIndex: 0 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '40px 60px', zIndex: 10 }}>
                         <div style={{ fontSize: 60, fontWeight: 900, color: 'white', textAlign: 'center' }}>
                            {teamName || "TEAM TRINITY"}
                        </div>
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40, width: '100%', marginTop: 40 }}>
                            {spellcasters.map((sc, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: 150, height: 220, 
                                        backgroundColor: 'rgba(0,0,0,0.3)', 
                                        border: `2px solid ${sc ? primary : '#334155'}`,
                                        borderRadius: 12,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                     }}>
                                         {sc ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={resolveUrl(getCardImageUrl(sc))} alt={sc.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                                         ) : <div style={{ fontSize: 40 }}>?</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers,
                fonts: fontData ? [
                    {
                        name: 'Oswald',
                        data: fontData,
                        style: 'normal',
                        weight: 700,
                    }
                ] : undefined,
            }
        );
    }
    // --- END TEAM MODE ---

    if (!deckHash) {
      return new Response('Missing deck or team parameter', { status: 400 });
    }

    const decoded = decodeDeck(deckHash);
    if (!decoded) {
      return new Response('Invalid deck string', { status: 400 });
    }

    if (decoded) {
        // Validation removed for brevity, check logic below
    }

    // Load custom font
    let fontData: ArrayBuffer | null = null;
    try {
        const fontRes = await fetch(fontUrl);
        if (fontRes.ok) {
            fontData = await fontRes.arrayBuffer();
        } else {
            console.warn('Failed to fetch font:', fontRes.statusText);
        }
    } catch (err) {
        console.warn('Error fetching font:', err);
    }

    // Fetch Game Data
    const data = await fetchGameData();
    
    // Resolve Entities
    // Resolve Spellcaster
    const spellcaster = data.spellcasters.find(h => h.spellcaster_id === decoded.spellcasterId);
    
    const units = decoded.slotIds
        .map(id => {
            const u = data.units.find(u => u.entity_id === id);
            if (u) return u;
            const s = data.spells.find(s => s.entity_id === id);
            if (s) return s;
            const t = data.titans.find(t => t.entity_id === id);
            if (t) return t;
            return null;
        })
        .filter((u): u is Unit | Spell | Titan => !!u);

    // Prepare Name
    const deckName = decoded.name || (spellcaster ? `${spellcaster.name} Deck` : 'Spellcasters Deck');

    // Brand Colors
    const bgDark = '#0f172a';
    const primary = '#a855f7';
    const accent = '#22d3ee';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: bgDark,
            backgroundImage: `radial-gradient(circle at 50% 0%, #2e1065 0%, ${bgDark} 50%)`,
            color: 'white',
            fontFamily: fontData ? '"Oswald"' : 'sans-serif',
            padding: '30px 50px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '70%',
            height: '70%',
            background: '#020617',
            filter: 'blur(80px)',
            opacity: 0.9,
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '20%',
            width: '40%',
            height: '40%',
            background: primary,
            filter: 'blur(140px)',
            opacity: 0.25,
            zIndex: 0,
          }} />
           <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '40%',
            height: '40%',
            background: accent,
            filter: 'blur(140px)',
            opacity: 0.2,
             zIndex: 0,
          }} />

            {/* Content Wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 30, alignItems: 'center', justifyContent: 'center', zIndex: 10, height: '100%' }}>
            
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                     {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>
                         <span style={{ 
                             backgroundImage: 'linear-gradient(to right, #a855f7, #ec4899)', 
                             backgroundClip: 'text', 
                             color: 'transparent',
                             marginRight: 0 
                         }}>
                             SPELLCASTERS
                         </span>
                         <span style={{ color: 'white' }}>DB</span>
                    </div>
    
                    {/* Deck Name with Stroke Hack */}
                    <div style={{ 
                        fontSize: 80, // Massive size
                        fontWeight: 900, 
                        lineHeight: 1, 
                        color: 'white',
                        // The "Stroke" Hack: Hard shadows create an outline effect
                        textShadow: '0px 2px 10px rgba(0,0,0,0.8), 2px 2px 0px #000', 
                        display: '-webkit-box',
                        WebkitLineClamp: 1, // Keep it one line for cleaner look? Or 2? 
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                    }}>
                        {deckName}
                    </div>
                </div>

                {/* Deck Content */}
                <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 16, width: '100%' }}>
                
                {/* Spellcaster (Hero) */}
                {spellcaster && (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: 220, 
                        height: 350, 
                        position: 'relative', 
                        marginRight: 24, 
                        flexShrink: 0,
                        borderRadius: 16, 
                        border: `4px solid ${primary}`, 
                        boxShadow: `0 0 50px ${primary}60`,
                        overflow: 'hidden'
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={resolveUrl(getCardImageUrl(spellcaster))} 
                            alt={spellcaster.name}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                            }} 
                        />
                         {/* Name Bar */}
                         <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 60,
                            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: 10,
                            paddingLeft: 4,
                            paddingRight: 4
                        }}>
                             <span style={{ 
                                 fontSize: 24, 
                                 fontWeight: 700, 
                                 color: 'white', 
                                 textAlign: 'center',
                                 whiteSpace: 'nowrap', 
                                 overflow: 'hidden', 
                                 textOverflow: 'ellipsis',
                                 textShadow: '0px 2px 4px black, 2px 2px 0px black'
                            }}>
                                {spellcaster.name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Units Grid */}
                {[...Array(5)].map((_, i) => {
                    const unit = units[i];
                    if (!unit) {
                        // Empty Slot
                        return (
                            <div key={i} style={{ 
                                width: 150, 
                                height: 220, 
                                borderRadius: 14, 
                                border: '2px dashed rgba(255,255,255,0.1)', 
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                            </div>
                        );
                    }

                    const isTitan = unit.category === 'Titan';
                    const isSpell = unit.category === 'Spell';
                    
                    let rankKey = 'I';
                    if (isTitan) rankKey = 'Titan';
                    else if (isSpell) rankKey = 'Spell'; // Spells don't have rank, map to a color?
                    else if ('rank' in unit && unit.rank) rankKey = unit.rank;

                    const rarityColor = ({
                        'Titan': accent,
                        'Spell': '#f472b6', // Pink for spells
                        'I': '#94a3b8',
                        'II': '#60a5fa',
                        'III': primary,
                        'IV': '#facc15'
                    } as Record<string, string>)[rankKey] || '#94a3b8';

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 150 }}>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                width: '100%', 
                                height: 220, 
                                position: 'relative', 
                                borderRadius: 14, 
                                overflow: 'hidden', 
                                border: `2px solid ${rarityColor}80`, 
                                boxShadow: '0 6px 24px rgba(0,0,0,0.4)', 
                                flexShrink: 0 
                            }}>
                                {/* Full Card Image (No Zoom) */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={resolveUrl(getCardImageUrl(unit))} 
                                    alt={unit.name}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                    }} 
                                />
                            </div>
                            
                            {/* Name Below Card */}
                            <div style={{
                                marginTop: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                            }}>
                                <span style={{ 
                                    fontSize: 18, 
                                    fontWeight: 700, 
                                    color: '#e2e8f0', // slate-200
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                    textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                }}>
                                    {unit.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers,
        fonts: fontData ? [
            {
                name: 'Oswald',
                data: fontData,
                style: 'normal',
                weight: 700,
            }
        ] : undefined,
      },
    );
    } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error ' + JSON.stringify(e);
    console.error(`OG Generation Error: ${message}`);
    const stack = e instanceof Error ? e.stack : undefined;
    return new Response(`Failed to generate the image: ${message} \nStack: ${stack}`, {
      status: 200, // Return 200 to see the message in browser if needed, or 500. Let's use 500 but with text.
      statusText: "Internal Server Error"
    });
  }
}
