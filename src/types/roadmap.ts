export interface RoadmapLabel {
  id?: number;
  name: string;
  color: string;
  description?: string;
}

export interface RoadmapIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  labels: RoadmapLabel[];
  created_at?: string;
  updated_at?: string;
  body?: string; // Optional, maybe used for expansion later
}
