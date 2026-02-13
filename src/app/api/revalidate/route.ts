import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    // Revalidate all critical static paths
    revalidatePath('/incantations/units/[id]');
    revalidatePath('/incantations/spells/[id]');
    revalidatePath('/spellcasters/[id]');
    revalidatePath('/titans/[id]');
    revalidatePath('/ranks/[rank]');
    revalidatePath('/types/[category]');
    revalidatePath('/schools/[school]');
    
    // Revalidate sitemap
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
