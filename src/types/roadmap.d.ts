export type RoadmapCategoryId = 'community-requests' | 'in-progress' | 'live';

export type RoadmapItemType = 'bug' | 'feature' | 'enhancement' | 'ux' | 'data';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: RoadmapCategoryId;
  type: RoadmapItemType;
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
