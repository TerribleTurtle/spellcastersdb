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
            top: '-10%',
            left: '-10%',
            width: '40%',
            height: '40%',
            background: primary,
            filter: 'blur(140px)',
            opacity: 0.3,
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
          }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 24, color: accent, fontWeight: 600, marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SpellcastersDB</div>
                    <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        {deckName}
                    </div>
                </div>
                {/* Site URL pill (visual only) */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    padding: '8px 20px', 
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: 18,
                    color: '#94a3b8'
                }}>
                    spellcasters.io
                </div>
            </div>

            {/* Deck Content */}
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%' }}>
                
                {/* Spellcaster (Larger/Prominent) */}
                {spellcaster && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 220, height: 340, position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getCardImageUrl(spellcaster)} 
                            alt={spellcaster.name}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                borderRadius: 16, 
                                border: `2px solid ${primary}`,
                                boxShadow: `0 0 30px ${primary}40`,
                            }} 
                        />
                         <div style={{
                            marginTop: -40,
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            width: '100%',
                            padding: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,
                            zIndex: 10
                        }}>
                             <span style={{ fontSize: 18, fontWeight: 700, color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '90%', textAlign: 'center' }}>
                                {spellcaster.name}
                            </span>
                        </div>
                         {/* Badge */}
                         <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 4, fontSize: 12, color: accent, fontWeight: 900, textTransform: 'uppercase' }}>
                            {spellcaster.class}
                        </div>
                    </div>
                )}

                {/* Separator */}
                <div style={{ width: 1, height: 100, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

                {/* Units Grid */}
                <div style={{ display: 'flex', gap: 16 }}>
                    {/* Render up to 5 units */}
                    {[...Array(5)].map((_, i) => {
                        const unit = units[i];
                        if (!unit) {
                            // Empty Slot
                            return (
                                <div key={i} style={{ 
                                    width: 140, 
                                    height: 200, 
                                    borderRadius: 12, 
                                    border: '2px dashed rgba(255,255,255,0.1)', 
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
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
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', width: 140, height: 200, position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${rarityColor}60` }}>
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
                                    height: 36,
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 4px'
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.1 }}>
                                        {unit.name}
                                    </span>
                                </div>
                                {/* Rank/Type Badge */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 6, 
                                    left: 6, 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    padding: '2px 6px', 
                                    borderRadius: 4, 
                                    fontSize: 10, 
                                    color: rarityColor, 
                                    fontWeight: 900, 
                                    fontFamily: 'monospace' 
                                }}>
                                    {isTitan ? 'TITAN' : unit.card_config.rank}
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
