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

        // Resolve Spellcasters & Pre-fetch
        const spellcastersDetails = decks.map(d => {
            if (!d || !d.spellcasterId) return null;
            const sc = data.spellcasters.find(h => h.spellcaster_id === d.spellcasterId);
            return {
                 spellcaster: sc,
                 deckName: d.name || (sc ? `${sc.name} Deck` : 'Unknown Deck')
            };
        });

        // Pre-fetch images
        const urlToDataUri = new Map<string, string>();
        const uniqueUrls = new Set<string>();
        
        spellcastersDetails.forEach(item => {
             if (item && item.spellcaster) {
                 uniqueUrls.add(resolveUrl(getCardImageUrl(item.spellcaster, { forceRemote: true, forceFormat: 'png' })));
             }
        });

        console.log(`OG (Team): Pre-fetching ${uniqueUrls.size} images`);
        
        await Promise.all(Array.from(uniqueUrls).map(async (url) => {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 4000); 
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(id);
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const mime = url.endsWith('.webp') ? 'image/webp' : 'image/png';
                    urlToDataUri.set(url, `data:${mime};base64,${base64}`);
                }
                } catch (e) { console.warn("Team image fetch failed", url, e); }
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getImageSrc = (entity: any) => {
            const url = resolveUrl(getCardImageUrl(entity, { forceRemote: true, forceFormat: 'png' }));
            return urlToDataUri.get(url) || url;
        };

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
                    padding: '50px 80px',
                }}>
                     {/* Background Elements */}
                    <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '40%', height: '40%', backgroundImage: `radial-gradient(closest-side, ${primary} 0%, transparent 100%)`, opacity: 0.15, zIndex: 0 }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', backgroundImage: `radial-gradient(closest-side, ${accent} 0%, transparent 100%)`, opacity: 0.15, zIndex: 0 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', zIndex: 10 }}>
                         
                         {/* Header */}
                         <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 40, borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                    {teamName || "TEAM TRINITY"}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700, color: '#e2e8f0', marginTop: 8, letterSpacing: '0.05em' }}>
                                     <span style={{ color: primary, marginRight: 8 }}>SPELLCASTERS</span>
                                     <span style={{ color: 'white' }}>DB</span>
                                </div>
                            </div>
                        </div>

                        {/* 3 Columns Grid */}
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40, width: '100%' }}>
                            {spellcastersDetails.map((item, i) => {
                                const sc = item?.spellcaster;
                                const dName = item?.deckName;
                                
                                return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%' }}>
                                    {sc ? (
                                        <div style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            position: 'relative',
                                            backgroundColor: 'rgba(0,0,0,0.3)', 
                                            border: `4px solid ${primary}`, // Thicker border
                                            borderRadius: 24,
                                            overflow: 'hidden',
                                            display: 'flex',
                                        }}>
                                            {/* Image */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={getImageSrc(sc)} 
                                                alt={sc.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                            
                                            {/* Name Overlay */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0, 
                                                left: 0, 
                                                width: '100%',
                                                height: 180, // Tall gradient
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                padding: '0 24px 32px 24px',
                                            }}>
                                                <span style={{ 
                                                    fontSize: 40,
                                                    fontWeight: 900, 
                                                    color: 'white', 
                                                    textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                                                    lineHeight: 1,
                                                    marginBottom: 8,
                                                }}>
                                                    {dName}
                                                </span>
                                                <span style={{ fontSize: 24, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {sc.name}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        // Empty Slot
                                        <div style={{ 
                                            width: '100%', height: '100%', 
                                            borderRadius: 24, 
                                            border: '2px dashed rgba(255,255,255,0.1)', 
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.2)' }}>?</div>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1600,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            backgroundImage: `radial-gradient(circle at 10% 10%, #2e1065 0%, ${bgDark} 80%)`,
            color: 'white',
            fontFamily: fontData ? '"Oswald"' : 'sans-serif',
            padding: '50px 80px', // More padding for "clean" look
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Elements - Subtle and Clean (No Blur for Performance) */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', backgroundImage: `radial-gradient(closest-side, ${primary} 0%, transparent 100%)`, opacity: 0.15, zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '60%', height: '60%', backgroundImage: `radial-gradient(closest-side, ${accent} 0%, transparent 100%)`, opacity: 0.15, zIndex: 0 }} />

            {/* Content Wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', zIndex: 10 }}>
            
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 40, borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 20 }}>
                     
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Title */}
                        <div style={{ 
                            fontSize: 72, 
                            fontWeight: 700, 
                            color: 'white',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                        }}>
                            {deckName}
                        </div>
                        {/* Subtitle / Label */}
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700, color: '#e2e8f0', marginTop: 8, letterSpacing: '0.05em' }}>
                             <span style={{ color: primary, marginRight: 8 }}>SPELLCASTERS</span>
                             <span style={{ color: 'white' }}>DB</span>
                        </div>
                    </div>

                    {/* Faction/Data on Right (Optional visual balance) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         {/* Could put mana curve or something here later. For now, just clean space. */}
                    </div>
                </div>

                {/* Main Content Area: Hero + Units */}
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', width: '100%', gap: 40 }}>
                
                {/* HERO CARD (Left) */}
                {spellcaster && (
                    <div style={{ 
                        display: 'flex', 
                        width: 320, 
                        height: 480, 
                        position: 'relative', 
                        borderRadius: 24, 
                        border: `4px solid ${primary}`, 
                        // boxShadow removed for performance
                        overflow: 'hidden',
                        backgroundColor: '#1e293b',
                    }}>
                        {/* Image */}
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
                         {/* Name Overlay (Gradient) */}
                         <div style={{
                            position: 'absolute',
                            bottom: 0, 
                            left: 0, 
                            width: '100%',
                            height: 160,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '0 20px 24px 20px',
                        }}>
                             <span style={{ 
                                 fontSize: 48,
                                 fontWeight: 900, 
                                 color: 'white', 
                                 textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                                 lineHeight: 0.9,
                                 marginBottom: 20, // Moved down since label is gone
                            }}>
                                {spellcaster.name}
                            </span>
                             {/* Label removed per user request */}
                        </div>
                    </div>
                )}

                {/* UNITS GRID (Right) */}
                <div style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    {[...Array(5)].map((_, i) => {
                        const unit = units[i];
                        
                        // Empty Slot
                        if (!unit) {
                            return (
                                <div key={i} style={{ 
                                    width: 200, 
                                    height: 300, 
                                    borderRadius: 16, 
                                    border: '2px dashed rgba(255,255,255,0.1)', 
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
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
                            <div key={i} style={{ 
                                display: 'flex', 
                                width: 200, 
                                height: 300, 
                                position: 'relative', 
                                borderRadius: 16, 
                                overflow: 'hidden', 
                                border: `4px solid ${rarityColor}`, 
                                backgroundColor: '#1e293b',
                                // boxShadow removed for performance 
                            }}>
                                {/* Card Image */}
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
                                
                                {/* Rank/Type Badge (Top Right) */}
                                <div style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: rarityColor,
                                    color: '#0f172a',
                                    fontSize: 16,
                                    fontWeight: 800,
                                    padding: '4px 10px',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {rankKey === 'Spell' ? 'SPL' : rankKey === 'Titan' ? 'TTN' : rankKey}
                                </div>

                                {/* Name Overlay (Bottom) */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    height: 120, // Taller gradient for safety
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    padding: '0 14px 20px 14px',
                                }}>
                                    <span style={{ 
                                        fontSize: 32, // bumped from 30
                                        fontWeight: 900, 
                                        color: 'white',
                                        lineHeight: 1,
                                        textShadow: '0 3px 8px rgba(0,0,0,0.9)',
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
        </div>
      ),
      {
        width: 1600,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
