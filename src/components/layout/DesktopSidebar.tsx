"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Github, 
  Map, 
  Database, 
  BookOpen, 
  HelpCircle, 
  Info,
  Layers,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();
  const { openFeedback } = useFeedback();

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname?.startsWith(path));

  const navItems = [
    { name: "Deck Builder", href: "/", icon: Layers },
    { name: "Database", href: "/database", icon: Database },
    { name: "Roadmap", href: "/roadmap", icon: Map },
  ];

  const secondaryItems = [
    { name: "Guide", href: "/guide", icon: BookOpen },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "About", href: "/about", icon: Info },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/10 fixed left-0 top-16 bottom-0 bg-surface-main z-30 overflow-y-auto">
      <div className="flex flex-col gap-6 p-4">
        
        {/* Primary Navigation */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Menu
          </h3>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  active 
                    ? "bg-brand-primary/10 text-brand-primary" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(
                    "transition-colors",
                    active ? "text-brand-primary" : "text-slate-500 group-hover:text-white"
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Resources
          </h3>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  active 
                    ? "bg-brand-primary/10 text-brand-primary" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(
                    "transition-colors",
                    active ? "text-brand-primary" : "text-slate-500 group-hover:text-white"
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <button
          onClick={openFeedback}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group w-full text-left"
        >
          <MessageSquare size={18} className="text-slate-500 group-hover:text-white transition-colors" />
          Feedback
        </button>
        
        {/* External Links */}
        <div className="mt-auto pt-4 border-t border-white/10">
             <a
                href="https://github.com/TerribleTurtle/spellcasters-community-api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Github size={18} className="text-slate-500 group-hover:text-white" />
                Contribute
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </a>
        </div>

      </div>
    </aside>
  );
}
