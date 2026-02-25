import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  const svgPath = path.join(__dirname, '..', 'public', 'og-default.svg');
  const pngPath = path.join(__dirname, '..', 'public', 'og-default.png');
  
  const svgBuffer = fs.readFileSync(svgPath);
  
  await sharp(svgBuffer)
    .png()
    .toFile(pngPath);
    
  console.log('Successfully generated og-default.png from og-default.svg');
}

generate().catch(console.error);
