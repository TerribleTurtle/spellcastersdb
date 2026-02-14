"use client";

import { useMemo, useState } from "react";
import { RoadmapIssue } from "@/types/roadmap";
import { IssueCard } from "@/components/roadmap/IssueCard";
import { Info, ArrowDownUp, CheckCircle2, Bug, Lightbulb, Search } from "lucide-react";

interface RoadmapClientProps {
  initialIssues: RoadmapIssue[];
  isLive: boolean;
}

type FilterType = "all" | "bug" | "feature" | "investigation" | "mobile";
type SortType = "newest" | "oldest" | "comments";

const FilterButton = ({ type, label, icon: Icon, colorClass, count, activeFilter, onFilterChange }: { type: FilterType, label: string, icon: React.ComponentType<{ className?: string }>, colorClass: string, count: number, activeFilter: FilterType, onFilterChange: (type: FilterType) => void }) => (
  <button
    onClick={() => onFilterChange(type)}
    className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 w-full
      ${activeFilter === type 
        ? `bg-white/10 border-brand-accent/50 shadow-lg shadow-brand-accent/10 ${colorClass}` 
        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400"
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

export default function RoadmapClient({ initialIssues, isLive }: RoadmapClientProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return {
      all: initialIssues.length,
      bug: initialIssues.filter((i) => i.labels.some((l) => l.name.toLowerCase().includes("bug"))).length,
      feature: initialIssues.filter((i) => i.labels.some((l) => l.name.toLowerCase().includes("feature"))).length,
      investigation: initialIssues.filter((i) => i.labels.some((l) => l.name.toLowerCase().includes("investigation"))).length,
      mobile: initialIssues.filter((i) => i.labels.some((l) => l.name.toLowerCase().includes("mobile"))).length,
    };
  }, [initialIssues]);

  const filteredIssues = useMemo(() => {
    let result = [...initialIssues];

    // Filter by Type
    if (filter !== "all") {
      result = result.filter((i) => i.labels.some((l) => l.name.toLowerCase().includes(filter)));
    }

    // Filter by Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => 
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
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`} />
          <span className="text-xs font-medium text-slate-300">
            {isLive ? "Live from GitHub" : "Cached / Offline Mode"}
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
          Development Roadmap
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
          Transparency is key. Vote on issues by adding reactions on GitHub.
        </p>
      </div>

      {/* Interactive Stats / Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <FilterButton type="all" label="All Issues" icon={CheckCircle2} colorClass="text-brand-accent" count={counts.all} activeFilter={filter} onFilterChange={setFilter} />
        <FilterButton type="bug" label="Bugs" icon={Bug} colorClass="text-red-400" count={counts.bug} activeFilter={filter} onFilterChange={setFilter} />
        <FilterButton type="feature" label="Features" icon={Lightbulb} colorClass="text-purple-400" count={counts.feature} activeFilter={filter} onFilterChange={setFilter} />
        <FilterButton type="investigation" label="Research" icon={Search} colorClass="text-yellow-400" count={counts.investigation} activeFilter={filter} onFilterChange={setFilter} />
        <FilterButton type="mobile" label="Mobile" icon={ArrowDownUp} colorClass="text-blue-400" count={counts.mobile} activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors"
            />
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/10">
            <span className="text-xs font-medium text-slate-500 pl-3 uppercase tracking-wider">Sort By</span>
            <div className="flex">
                <button
                    onClick={() => setSort("newest")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sort === "newest" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                >
                    Newest
                </button>
                <button
                    onClick={() => setSort("oldest")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sort === "oldest" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
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
        <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Issues Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            {search ? `No results match "${search}"` : "Try adjusting your filters."}
          </p>
          <button 
            onClick={() => { setFilter("all"); setSearch(""); }}
            className="mt-6 text-brand-accent hover:text-brand-accent/80 font-medium text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
