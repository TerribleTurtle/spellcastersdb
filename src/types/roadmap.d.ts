export type RoadmapCategoryId = 'community-requests' | 'in-progress' | 'live';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: RoadmapCategoryId;
}

export interface RoadmapCategory {
  id: RoadmapCategoryId;
  title: string;
  description: string;
}

export interface RoadmapData {
  categories: RoadmapCategory[];
  items: RoadmapItem[];
}
