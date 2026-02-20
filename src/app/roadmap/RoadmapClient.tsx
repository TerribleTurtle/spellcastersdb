"use client";

import { useMemo, useState } from "react";

import {
  ArrowDownUp,
  Bug,
  CheckCircle2,
  Info,
  Lightbulb,
  Search,
} from "lucide-react";

import { IssueCard } from "@/components/roadmap/IssueCard";
import { RoadmapIssue } from "@/types/roadmap";

interface RoadmapClientProps {
  initialIssues: RoadmapIssue[];
  isLive: boolean;
}

type FilterType = "all" | "bug" | "feature" | "investigation" | "mobile";
type SortType = "newest" | "oldest" | "comments";

const FilterButton = ({
  type,
  label,
  icon: Icon,
  colorClass,
  count,
  activeFilter,
  onFilterChange,
}: {
  type: FilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  count: number;
  activeFilter: FilterType;
  onFilterChange: (type: FilterType) => void;
}) => (
  <button
    onClick={() => onFilterChange(type)}
    className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 w-full
      ${
        activeFilter === type
          ? `bg-surface-hover border-brand-accent/50 shadow-lg shadow-brand-accent/10 ${colorClass}`
          : "bg-surface-card border-border-default hover:bg-surface-hover hover:border-border-strong text-text-muted"
      }
    `}
  >
    <div className="text-2xl font-bold mb-1">{count}</div>
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    {activeFilter === type && (
      <div className="absolute inset-x-0 -bottom-px h-1 bg-brand-accent/50 mx-4 rounded-t-full filter blur-[2px]" />
    )}
  </button>
);

export default function RoadmapClient({
  initialIssues,
  isLive,
}: RoadmapClientProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return {
      all: initialIssues.length,
      bug: initialIssues.filter((i) =>
        i.labels.some((l) => l.name.toLowerCase().includes("bug"))
      ).length,
      feature: initialIssues.filter((i) =>
        i.labels.some((l) => l.name.toLowerCase().includes("feature"))
      ).length,
      investigation: initialIssues.filter((i) =>
        i.labels.some((l) => l.name.toLowerCase().includes("investigation"))
      ).length,
      mobile: initialIssues.filter((i) =>
        i.labels.some((l) => l.name.toLowerCase().includes("mobile"))
      ).length,
    };
  }, [initialIssues]);

  const filteredIssues = useMemo(() => {
    let result = [...initialIssues];

    // Filter by Type
    if (filter !== "all") {
      result = result.filter((i) =>
        i.labels.some((l) => l.name.toLowerCase().includes(filter))
      );
    }

    // Filter by Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.number.toString().includes(q) ||
          (i.body && i.body.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      if (sort === "newest") return dateB - dateA;
      if (sort === "oldest") return dateA - dateB;
      // Note: GitHub API issue object doesn't always have comment count in list view without extra fetch details,
      // but if we had it, we'd sort here. For now, fallback to newest.
      return dateB - dateA;
    });

    return result;
  }, [initialIssues, filter, search, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
      {/* Header Area */}
      {/* Header Area Removed - handled by PageShell */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-default backdrop-blur-sm">
          <span
            className={`w-2 h-2 rounded-full ${isLive ? "bg-status-success shadow-[0_0_8px_theme(--color-status-success)]" : "bg-orange-500 shadow-[0_0_8px_#f97316]"}`}
          />
          <span className="text-xs font-medium text-text-secondary">
            {isLive ? "Live from GitHub" : "Cached / Offline Mode"}
          </span>
        </div>
      </div>

      {/* Interactive Stats / Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <FilterButton
          type="all"
          label="All Issues"
          icon={CheckCircle2}
          colorClass="text-brand-accent"
          count={counts.all}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
        <FilterButton
          type="bug"
          label="Bugs"
          icon={Bug}
          colorClass="text-status-danger-text"
          count={counts.bug}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
        <FilterButton
          type="feature"
          label="Features"
          icon={Lightbulb}
          colorClass="text-purple-400"
          count={counts.feature}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
        <FilterButton
          type="investigation"
          label="Research"
          icon={Search}
          colorClass="text-status-warning-text"
          count={counts.investigation}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
        <FilterButton
          type="mobile"
          label="Mobile"
          icon={ArrowDownUp}
          colorClass="text-status-info-text"
          count={counts.mobile}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-dimmed" />
          </div>
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-default rounded-lg leading-5 bg-surface-card text-text-secondary placeholder-text-dimmed focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors"
          />
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center gap-3 bg-surface-card rounded-lg p-1 border border-border-default">
          <span className="text-xs font-medium text-text-dimmed pl-3 uppercase tracking-wider">
            Sort By
          </span>
          <div className="flex">
            <button
              onClick={() => setSort("newest")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sort === "newest" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"}`}
            >
              Newest
            </button>
            <button
              onClick={() => setSort("oldest")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sort === "oldest" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"}`}
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right fade-in duration-500">
        {filteredIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      {/* Empty State */}
      {filteredIssues.length === 0 && (
        <div className="text-center py-24 bg-surface-card rounded-2xl border border-border-default border-dashed">
          <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            No Issues Found
          </h3>
          <p className="text-text-muted max-w-sm mx-auto">
            {search
              ? `No results match "${search}"`
              : "Try adjusting your filters."}
          </p>
          <button
            onClick={() => {
              setFilter("all");
              setSearch("");
            }}
            className="mt-6 text-brand-accent hover:text-brand-accent/80 font-medium text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
