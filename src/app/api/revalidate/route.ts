import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    
    // 1. Revalidate Data Cache (This updates all pages that use fetch with 'game-data' tag)
    // This is much more robust than guessing paths.
    // 'max' is required by this Next.js version (16.1.6) for revalidateTag.
    revalidateTag('game-data', 'max');
    
    // 2. Revalidate Sitemap (Static route, not data-driven in the same way)
    revalidatePath('/sitemap.xml');

    const duration = Date.now() - startTime;
    console.log(`[Revalidation] Success in ${duration}ms. Tag: 'game-data', Path: '/sitemap.xml'`);

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: "Game data and sitemap revalidation triggered" 
    });
  } catch (err) {
    console.error('[Revalidation] Error:', err);
    return NextResponse.json({ 
      message: 'Error revalidating', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
