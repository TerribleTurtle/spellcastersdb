import { FALLBACK_ISSUES } from "@/data/roadmap-fallback";
import { DataFetchError, fetchJson } from "@/services/api/api-client";
import { monitoring } from "@/services/monitoring";
import { RoadmapIssue } from "@/types/roadmap";

const GITHUB_API_URL =
  "https://api.github.com/repos/TerribleTurtle/spellcastersdb/issues?state=open";

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

      const data = await fetchJson<GitHubIssue[]>(GITHUB_API_URL, {
        headers,
        next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
      });

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
      const cleanIssues = issues.filter((i) => !i.html_url.includes("/pull/"));

      return { issues: cleanIssues, isLive: true };
    } catch (error) {
      if (error instanceof DataFetchError) {
        if (error.status === 403 || error.status === 429) {
          monitoring.captureMessage(
            `[RoadmapService] Rate limit hit (${error.status}). Using fallback data.`,
            "warning",
            { context: "roadmap-service.ts:getIssues", status: error.status }
          );
        } else {
          monitoring.captureMessage(
            `[RoadmapService] GitHub API Error: ${error.status} ${error.message}`,
            "error",
            { context: "roadmap-service.ts:getIssues", status: error.status }
          );
        }
      } else {
        monitoring.captureException(error, {
          message: "[RoadmapService] Network/Fetch Error",
          context: "roadmap-service.ts:getIssues",
        });
      }
      return { issues: FALLBACK_ISSUES, isLive: false };
    }
  },
};
