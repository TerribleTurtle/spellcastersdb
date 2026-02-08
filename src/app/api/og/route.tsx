/**
 * @file route.tsx
 * @description CRITICAL CORE COMPONENT. Public API for generating Social Share (OG) Images.
 * DO NOT DELETE OR MODIFY WITHOUT VERIFICATION.
 */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

import { decodeDeck, decodeTeam } from '@/lib/encoding';
import { fetchGameData } from '@/lib/api';
import { getCardImageUrl } from '@/lib/utils';
import { Unit, Spell, Titan } from '@/types/api';

// Font fallback strategy:
const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/oswald/Oswald-Bold.ttf';

export async function GET(request: NextRequest) {
  // Shared Constants
  const bgDark = '#0f172a';
  const primary = '#a855f7';
  const accent = '#22d3ee';

  console.log("OG: Handling Request", request.url);

  // Cache Control
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
        if (!url.startsWith('http')) return `${origin}/${url}`;
        return url;
    };

    // Load Font (Oswald)
    let fontData: ArrayBuffer | null = null;
    try {
        const fontRes = await fetch(fontUrl);
         if (fontRes.ok) {
             fontData = await fontRes.arrayBuffer();
        }
    } catch (e) { console.warn('Font fetch failed', e); }

    // Fetch Game Data
    const data = await fetchGameData();

    // --- TEAM MODE ---
    if (teamHash) { 
        const { name: teamName, decks } = decodeTeam(teamHash);

        // Resolve Spellcasters
        const spellcasters = decks.map(d => {
            if (!d || !d.spellcasterId) return null;
            return data.spellcasters.find(h => h.spellcaster_id === d.spellcasterId);
        });

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
                     {/* Background Elements - Simple Gradients */}
                    <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '40%', height: '40%', background: primary, opacity: 0.1, borderRadius: '50%', zIndex: 0 }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: accent, opacity: 0.1, borderRadius: '50%', zIndex: 0 }} />

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
                                            <img src={resolveUrl(getCardImageUrl(sc, { forceRemote: true, forceFormat: 'png' }))} alt={sc.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
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
    } // End Team Mode

    // --- DECK MODE ---
    if (!deckHash) {
      return new Response('Missing deck or team parameter', { status: 400 });
    }

    const decoded = decodeDeck(deckHash);
    if (!decoded) {
      return new Response('Invalid deck string', { status: 400 });
    }

    const { name: deckNameFromHash, spellcasterId, slotIds } = decoded;

    // Resolve Entities
    const spellcaster = data.spellcasters.find(s => s.spellcaster_id === spellcasterId);
    
    // Resolve Units/Spells/Titans
    const units = slotIds.map(id => {
        if (!id) return null;
        let found: Unit | Spell | Titan | undefined;
        found = data.units.find(u => u.entity_id === id);
        if (!found) found = data.spells.find(s => s.entity_id === id);
        if (!found) found = data.titans.find(t => t.entity_id === id);
        return found || null;
    });

    const deckName = deckNameFromHash || `${spellcaster?.name || 'Unknown'}'s Deck`;

    // --- PRE-FETCH IMAGES FOR PERFORMANCE ---
    const urlToDataUri = new Map<string, string>();
    const uniqueUrls = new Set<string>();

    if (spellcaster) uniqueUrls.add(resolveUrl(getCardImageUrl(spellcaster, { forceRemote: true, forceFormat: 'png' })));
    units.forEach(u => {
        if (u) uniqueUrls.add(resolveUrl(getCardImageUrl(u, { forceRemote: true, forceFormat: 'png' })));
    });

    console.log(`OG (Deck): Pre-fetching ${uniqueUrls.size} images`);

    try {
        await Promise.all(Array.from(uniqueUrls).map(async (url) => {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 4000); // 4s timeout per image
                
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(id);
                
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const mime = url.endsWith('.webp') ? 'image/webp' : 'image/png';
                    urlToDataUri.set(url, `data:${mime};base64,${base64}`);
                } else {
                    console.warn(`Failed to fetch image: ${url} (${res.status})`);
                }
            } catch (err) {
                console.warn(`Error fetching image: ${url}`, err);
            }
        }));
    } catch (e) {
        console.error("Critical error during image pre-fetch", e);
    }

    const getImageSrc = (entity: any) => {
        const url = resolveUrl(getCardImageUrl(entity, { forceRemote: true, forceFormat: 'png' }));
        return urlToDataUri.get(url) || url; // Fallback to URL if fetch failed
    };

    console.log(`OG (Deck): Rendering ImageResponse (1600x840)`);

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
            padding: '40px 66px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Elements - Simple Gradients */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '20%',
            width: '40%',
            height: '40%',
            background: primary,
            opacity: 0.1,
            borderRadius: '50%',
            zIndex: 0,
          }} />
           <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '40%',
            height: '40%',
            background: accent,
            opacity: 0.1,
            borderRadius: '50%',
             zIndex: 0,
          }} />

            {/* Content Wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 40, alignItems: 'center', justifyContent: 'center', zIndex: 10, height: '100%' }}>
            
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                     {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>
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
    
                    {/* Deck Name */}
                    <div style={{ 
                        fontSize: 106, // 1.33x Large
                        fontWeight: 900, 
                        lineHeight: 1, 
                        color: 'white',
                        textShadow: '0px 3px 14px rgba(0,0,0,0.8), 3px 3px 0px #000', 
                        display: '-webkit-box',
                        WebkitLineClamp: 1, 
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                    }}>
                        {deckName}
                    </div>
                </div>

                {/* Deck Content */}
                <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 20, width: '100%' }}>
                
                {/* Spellcaster (Hero) */}
                {spellcaster && (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: 294, 
                        height: 466, 
                        position: 'relative', 
                        marginRight: 32, 
                        flexShrink: 0,
                        borderRadius: 22, 
                        border: `6px solid ${primary}`, 
                        boxShadow: `0 0 66px ${primary}60`,
                        overflow: 'hidden'
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getImageSrc(spellcaster)} 
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
                            height: 80,
                            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: 14,
                            paddingLeft: 6,
                            paddingRight: 6
                        }}>
                             <span style={{ 
                                 fontSize: 32, 
                                 fontWeight: 700, 
                                 color: 'white', 
                                 textAlign: 'center',
                                 whiteSpace: 'nowrap', 
                                 overflow: 'hidden', 
                                 textOverflow: 'ellipsis',
                                 textShadow: '0px 3px 6px black, 3px 3px 0px black'
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
                                width: 200, 
                                height: 294, 
                                borderRadius: 19, 
                                border: '3px dashed rgba(255,255,255,0.1)', 
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)' }} />
                            </div>
                        );
                    }

                    const isTitan = unit.category === 'Titan';
                    const isSpell = unit.category === 'Spell';
                    
                    let rankKey = 'I';
                    if (isTitan) rankKey = 'Titan';
                    else if (isSpell) rankKey = 'Spell';
                    else if ('rank' in unit && unit.rank) rankKey = unit.rank;

                    const rarityColor = ({
                        'Titan': accent,
                        'Spell': '#f472b6',
                        'I': '#94a3b8',
                        'II': '#60a5fa',
                        'III': primary,
                        'IV': '#facc15'
                    } as Record<string, string>)[rankKey] || '#94a3b8';

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                width: '100%', 
                                height: 294, 
                                position: 'relative', 
                                borderRadius: 19, 
                                overflow: 'hidden', 
                                border: `3px solid ${rarityColor}80`, 
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', 
                                flexShrink: 0 
                            }}>
                                {/* Full Card Image (No Zoom) */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={getImageSrc(unit)} 
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
                                marginTop: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                            }}>
                                <span style={{ 
                                    fontSize: 24, 
                                    fontWeight: 700, 
                                    color: '#e2e8f0', // slate-200
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                    textShadow: '0px 3px 6px rgba(0,0,0,0.5)',
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
        width: 1600, // 1.33x Resolution
        height: 840,
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

  } catch (e: any) {
    console.error('OG Error:', e);
    return new ImageResponse(
        (
            <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0f172a', color: 'white', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                OG Error: {e.message}
            </div>
        ),
        { width: 1200, height: 630 }
    );
  }
}
