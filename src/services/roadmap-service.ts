import { RoadmapIssue } from "@/types/roadmap";
import { FALLBACK_ISSUES } from "@/data/roadmap-fallback";

const GITHUB_API_URL = "https://api.github.com/repos/TerribleTurtle/spellcastersdb/issues?state=open";

// Local interfaces for GitHub API response
interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  body: string;
}

export const roadmapService = {
  async getIssues(): Promise<{ issues: RoadmapIssue[]; isLive: boolean }> {
    try {
      const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
      };

      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      console.log("[RoadmapService] Fetching issues from GitHub...");
      
      const res = await fetch(GITHUB_API_URL, {
        headers,
        next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
          console.warn(`[RoadmapService] Rate limit hit (${res.status}). Using fallback data.`);
        } else {
          console.error(`[RoadmapService] GitHub API Error: ${res.status} ${res.statusText}`);
        }
        return { issues: FALLBACK_ISSUES, isLive: false };
      }

      const data = await res.json();

      // Basic validation/sanitization to ensure it matches our interface
      const issues: RoadmapIssue[] = data.map((issue: GitHubIssue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        labels: issue.labels.map((label: GitHubLabel) => ({
          id: label.id,
          name: label.name,
          color: label.color,
          description: label.description,
        })),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        body: issue.body,
      }));

      // Filter out Pull Requests (GitHub "issues" endpoint includes PRs)
      const cleanIssues = issues.filter(i => !i.html_url.includes("/pull/"));

      return { issues: cleanIssues, isLive: true };

    } catch (error) {
      console.error("[RoadmapService] Network/Fetch Error:", error);
      return { issues: FALLBACK_ISSUES, isLive: false };
    }
  },
};
