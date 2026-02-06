import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { decodeDeck } from '@/lib/encoding';
import { fetchGameData } from '@/lib/api';
import { getCardImageUrl } from '@/lib/utils';
import { Unit } from '@/types/api';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deckHash = searchParams.get('deck') || searchParams.get('d');

    if (!deckHash) {
      return new Response('Missing deck parameter', { status: 400 });
    }

    const decoded = decodeDeck(deckHash);
    if (!decoded) {
      return new Response('Invalid deck string', { status: 400 });
    }

    // specific cache: 1 hour for valid images
    const headers = {
        'Cache-Control': 'public, max-age=3600, immutable',
    };

    // Fetch Game Data (Data is cached by Next.js fetch, effectively instantaneous)
    const data = await fetchGameData();
    
    // Resolve Entities
    const spellcaster = data.heroes.find(h => h.hero_id === decoded.spellcasterId);
    
    const units = decoded.slotIds
        .map(id => data.units.find(u => u.entity_id === id))
        .filter((u): u is Unit => !!u);

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
            fontFamily: '"Inter", sans-serif',
            padding: '40px 60px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '60%',
            height: '60%',
            background: '#0f172a', // Darker blob behind logo
            filter: 'blur(100px)',
            opacity: 0.8,
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

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 20, width: '100%', zIndex: 10 }}>
                 {/* Logo Match: SPELLCASTERS(Gradient) DB(White) */}
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 12 }}>
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

                <div style={{ 
                    fontSize: 72, 
                    fontWeight: 900, 
                    lineHeight: 1.05, 
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                }}>
                    {deckName}
                </div>
            </div>

            {/* Deck Content */}
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'flex-end', justifyContent: 'center', gap: 20, width: '100%', paddingBottom: 20, zIndex: 10 }}>
                
                {/* Spellcaster (Hero) */}
                {spellcaster && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 220, height: 350, position: 'relative', marginRight: 24 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getCardImageUrl(spellcaster)} 
                            alt={spellcaster.name}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                borderRadius: 16, 
                                border: `3px solid ${primary}`,
                                boxShadow: `0 0 50px ${primary}60`,
                            }} 
                        />
                         {/* Simple Name Bar */}
                         <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 48,
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            borderTop: '1px solid rgba(255,255,255,0.15)',
                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 8px'
                        }}>
                             <span style={{ fontSize: 18, fontWeight: 700, color: 'white', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
                                {spellcaster.name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Units Grid */}
                {/* Render up to 5 units */}
                {[...Array(5)].map((_, i) => {
                    const unit = units[i];
                    if (!unit) {
                        // Empty Slot
                        return (
                            <div key={i} style={{ 
                                width: 170, 
                                height: 250,
                                borderRadius: 14, 
                                border: '2px dashed rgba(255,255,255,0.1)', 
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                            </div>
                        );
                    }

                    const isTitan = unit.category === 'Titan';
                    
                    // Explicitly type the lookup map or use a simpler switch
                    const rankKey = isTitan ? 'Titan' : unit.card_config.rank;
                    const rarityColor = ({
                        'Titan': accent,
                        'I': '#94a3b8',
                        'II': '#60a5fa',
                        'III': primary,
                        'IV': '#facc15'
                    } as Record<string, string>)[rankKey] || '#94a3b8';

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', width: 170, height: 250, position: 'relative', borderRadius: 14, overflow: 'hidden', border: `2px solid ${rarityColor}80`, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={getCardImageUrl(unit)} 
                                alt={unit.name}
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                }} 
                            />
                            {/* Bottom Name Bar */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 44,
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                borderTop: '1px solid rgba(255,255,255,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 8px'
                            }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
                                    {unit.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers,
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error(`OG Generation Error: ${message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
