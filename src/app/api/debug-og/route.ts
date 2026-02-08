import { NextRequest, NextResponse } from 'next/server';
import { decodeTeam } from '@/lib/encoding';
import { fetchGameData } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamHash = searchParams.get('team');

  if (!teamHash) {
    return NextResponse.json({ error: 'Missing team parameter' }, { status: 400 });
  }

  try {
    const { name: teamName, decks } = decodeTeam(teamHash);
    const data = await fetchGameData();
    
    // Resolve Spellcasters
    const spellcasters = decks.map(d => {
        if (!d || !d.spellcasterId) return null;
        const hero = data.heroes.find(h => h.hero_id === d.spellcasterId);
        return {
            id: d.spellcasterId,
            found: !!hero,
            name: hero?.name
        };
    });

    return NextResponse.json({
        receivedHash: teamHash,
        decoded: {
            teamName,
            decksCount: decks.length,
            decks: decks,
        },
        spellcasters,
        gameDataHeroesCount: data.heroes.length
    });

  } catch (e: any) {
    return NextResponse.json({
        error: 'Crash during processing',
        message: e.message,
        stack: e.stack
    }, { status: 500 });
  }
}
