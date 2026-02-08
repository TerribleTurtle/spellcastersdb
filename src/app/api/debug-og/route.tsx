import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { decodeTeam } from '@/lib/encoding';
import { fetchGameData } from '@/lib/api';
import { getCardImageUrl } from '@/lib/utils';

// Font fallback strategy:
const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/oswald/Oswald-Bold.ttf';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamHash = searchParams.get('team');
  const returnImage = searchParams.get('image') === 'true';

  if (!teamHash) {
     // List heroes if no team hash, to help me build a valid hash
     try {
         const data = await fetchGameData();
         return NextResponse.json({ 
             heroes: data.heroes.map(h => ({ id: h.hero_id, name: h.name })) 
         });
     } catch(e: any) {
         return NextResponse.json({ error: e.message });
     }
  }

  try {
    const { name: teamName, decks } = decodeTeam(teamHash);
    const data = await fetchGameData();
    
    // Resolve Spellcasters
    const spellcasters = decks.map(d => {
        if (!d || !d.spellcasterId) return null;
        return data.heroes.find(h => h.hero_id === d.spellcasterId);
    });
    
    const spellcasterDebug = decks.map(d => {
        if (!d || !d.spellcasterId) return { id: null, found: false };
        const hero = data.heroes.find(h => h.hero_id === d.spellcasterId);
        return { id: d.spellcasterId, found: !!hero, name: hero?.name || 'Unknown' };
    });

    if (!returnImage) {
        return NextResponse.json({
            receivedHash: teamHash,
            decoded: {
                teamName,
                decksCount: decks.length,
            },
            spellcasters: spellcasterDebug,
            gameDataHeroesCount: data.heroes.length
        });
    }

    // --- Image Generation Test ---
    const bgDark = '#0f172a';
    const primary = '#a855f7';
    const accent = '#22d3ee';

    // Load Font (Oswald)
    let fontData: ArrayBuffer | null = null;
    try {
        const fontRes = await fetch(fontUrl);
        if (fontRes.ok) fontData = await fontRes.arrayBuffer();
    } catch (e) { console.warn('Font fetch failed', e); }

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
                fontFamily: 'sans-serif',
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
                                        <img src={getCardImageUrl(sc)} alt={sc.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
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
            // fonts: undefined // No fonts logic matches original
        }
    );

  } catch (e: any) {
    return NextResponse.json({
        error: 'Crash during processing',
        message: e.message,
        stack: e.stack
    }, { status: 500 });
  }
}
