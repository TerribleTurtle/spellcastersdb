import https from 'https';
import fetch from 'node-fetch';

const BASE_URL = 'https://spellcastersdb.com';

const pathsToCheck = [
  '/',
  '/deck-builder',
  '/guide',
  '/faq',
  '/about',
  '/incantations/units',
  '/incantations/spells',
  '/database',
  '/consumables',
  '/ranks/I',
  '/classes/Duelist',
  '/schools/Wild',
  '/types/spellcasters',
  // Try to test a dynamic path if possible, let's just check standard ones
  '/changelog' // Note: sitemap says /changes ... let's check /changes
];

async function checkUrl(path) {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ [${path}] HTTP Error ${response.status}`);
      return false;
    }
    const html = await response.text();
    
    // Check for OG tags
    const hasOgTitle = html.includes('property="og:title"');
    const hasOgDescription = html.includes('property="og:description"');
    const hasOgImage = html.includes('property="og:image"');
    const hasTwitterCard = html.includes('name="twitter:card"');
    
    // Also parse what the og:image is to see if it's dynamic or static
    let ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    let imageSrc = ogImageMatch ? ogImageMatch[1] : 'none';

    // Also look for Discord or generic oEmbed <link type="application/json+oembed">
    let hasOEmbed = html.includes('type="application/json+oembed"');

    const errors = [];
    if (!hasOgTitle) errors.push('Missing og:title');
    if (!hasOgDescription) errors.push('Missing og:description');
    if (!hasOgImage) errors.push('Missing og:image');
    if (!hasTwitterCard) errors.push('Missing twitter:card');
    
    if (errors.length === 0) {
      console.log(`✅ [${path}] All embed tags present. Image: ${imageSrc}`);
      if (hasOEmbed) console.log(`   - oEmbed detected (excellent for rich embeds).`);
      return true;
    } else {
      console.error(`❌ [${path}] Missing tags: ${errors.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ [${path}] Fetch failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log(`Running embed tests against ${BASE_URL}...\n`);
  let allGood = true;
  for (const path of pathsToCheck) {
    const success = await checkUrl(path);
    if (!success) allGood = false;
  }

  // Let's test one dynamic unit path we know might exist, e.g. /spellcasters/nadia
  const nadiaSuccess = await checkUrl('/spellcasters/nadia');
  if (!nadiaSuccess) allGood = false;

  if (allGood) {
    console.log('\n🎉 All checked pages have valid embed tags.');
  } else {
    console.log('\n⚠️ Some pages are missing embed tags.');
  }
}

main();
