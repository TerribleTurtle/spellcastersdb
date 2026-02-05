import type { Metadata } from 'next';
import StatusDashboard from '@/components/roadmap/StatusDashboard';
import type { RoadmapData } from '@/types/roadmap';

export const metadata: Metadata = {
  title: 'Development Roadmap',
  description: 'See what features are being built, what\'s requested by the community, and what\'s already live on SpellcastersDB.',
  openGraph: {
    title: 'Development Roadmap | SpellcastersDB',
    description: 'A transparent view into the development process of SpellcastersDB.',
  },
};

import { promises as fs } from 'fs';
import path from 'path';

async function getRoadmapData(): Promise<RoadmapData> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'roadmap-data.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function RoadmapPage() {
  const data = await getRoadmapData();

  return <StatusDashboard data={data} />;
}
