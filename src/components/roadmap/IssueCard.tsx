import { RoadmapIssue } from "@/types/roadmap";
import { ExternalLink, Calendar } from "lucide-react";

interface IssueCardProps {
  issue: RoadmapIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  // Helper to map label names to tailwind classes
  const getLabelStyle = (name: string) => {
    const lower = name.toLowerCase();
    
    if (lower.includes("bug")) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (lower.includes("feature")) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (lower.includes("ui") || lower.includes("design")) return "bg-pink-500/20 text-pink-300 border-pink-500/30";
    if (lower.includes("mobile")) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (lower.includes("investigation")) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    if (lower.includes("mechanics")) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (lower.includes("stats")) return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    
    // Default
    return "bg-slate-700/50 text-slate-300 border-slate-600/50";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <a
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-accent/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-accent/10 overflow-hidden"
    >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-brand-primary/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
            <h3 className="text-xl font-bold text-white leading-snug group-hover:text-brand-accent transition-colors">
                {issue.title}
            </h3>
            <span className="shrink-0 text-slate-500 font-mono text-sm">#{issue.number}</span>
        </div>

        {/* Content/Spacer */}
        <div className="grow relative z-10" />

        {/* Labels */}
        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {issue.labels.map((label) => (
                <span 
                    key={label.id || label.name} 
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getLabelStyle(label.name)}`}
                >
                    {label.name}
                </span>
            ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4 mt-auto relative z-10">
            <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Opened {formatDate(issue.created_at)}</span>
            </div>
            
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity text-brand-accent">
                <span>View</span>
                <ExternalLink className="w-3.5 h-3.5" />
            </div>
        </div>
    </a>
  );
}
