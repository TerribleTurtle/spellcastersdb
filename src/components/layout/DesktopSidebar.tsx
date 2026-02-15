"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Github, 
  Map, 
  Database, 
  BookOpen, 
  HelpCircle, 
  Info,
  Layers,
  ExternalLink,
  MessageSquare,
  ChevronLeft,
  Menu,
  Bot
} from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";

export function DesktopSidebar() {
  const pathname = usePathname();
  const { openFeedback } = useFeedback();
  
  const { isSidebarOpen, toggleSidebar, setSidebarOpen, hasManuallyToggled } = useUIStore();
  
  // Mounted check for hydration safety
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
      // Logic to sync sidebar with window size
      if (!mounted) return;

      const handleResize = () => {
          if (hasManuallyToggled) return; // Respect user preference
          
          if (window.innerWidth < 1536) { // 2XL Breakpoint
              setSidebarOpen(false);
          } else {
              setSidebarOpen(true);
          }
      };

      // Run once on mount if no manual toggle
      if (!hasManuallyToggled) {
          handleResize();
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
  }, [mounted, hasManuallyToggled, setSidebarOpen]);

  // Prevent hydration mismatch by rendering a placeholder or default until mounted
  // For sidebar, we can just render default (open) or closed, but might flicker. 
  // Ideally, valid "w-64" or "w-16" is applied immediately.
  
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
    { name: "Bot", href: "/discord-bot", icon: Bot },
    { name: "About", href: "/about", icon: Info },
  ];
  
  if (!mounted) return (
      <aside className="hidden md:flex flex-col w-16 2xl:w-64 border-r border-white/10 sticky top-16 h-[calc(100vh-4rem)] bg-surface-main z-30" />
  );

  return (
    <aside 
        className={cn(
            "hidden md:flex flex-col border-r border-white/10 sticky top-16 h-[calc(100vh-4rem)] bg-surface-main z-30 transition-[width] duration-300 ease-in-out overflow-y-auto overflow-x-hidden",
            isSidebarOpen ? "w-64" : "w-16"
        )}
    >
      <div className={cn("flex flex-col gap-6 p-4", !isSidebarOpen && "px-2 items-center")}>
        
        {/* Toggle Button (Sidebar Header) */}
        {!isSidebarOpen && (
            <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleSidebar}
                className="text-slate-400 hover:bg-white/5 hover:text-white transition-colors mb-2"
                title="Expand Menu"
                aria-label="Expand sidebar"
            >
                <Menu size={20} />
            </Button>
        )}

        {/* Primary Navigation */}
        <div className="flex flex-col gap-1 w-full">
          {isSidebarOpen && (
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 flex justify-between items-center">
                Menu
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 hover:text-white transition-colors" title="Collapse Menu" aria-label="Collapse sidebar">
                    <ChevronLeft size={14} />
                </Button>
              </h3>
          )}
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                  active 
                    ? "bg-brand-primary/10 text-brand-primary" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  !isSidebarOpen && "justify-center px-2"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon size={18} className={cn(
                    "transition-colors shrink-0",
                    active ? "text-brand-primary" : "text-slate-500 group-hover:text-white"
                )} />
                {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="flex flex-col gap-1 w-full">
          {isSidebarOpen && (
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Resources
            </h3>
          )}
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                  active 
                    ? "bg-brand-primary/10 text-brand-primary" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                   !isSidebarOpen && "justify-center px-2"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon size={18} className={cn(
                    "transition-colors shrink-0",
                    active ? "text-brand-primary" : "text-slate-500 group-hover:text-white"
                )} />
                {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <Button
          variant="ghost"
          onClick={openFeedback}
          className={cn(
              "flex items-center gap-3 px-3 py-2 h-auto rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group w-full justify-start",
              !isSidebarOpen && "justify-center px-2"
          )}
          title={!isSidebarOpen ? "Feedback" : undefined}
          aria-label="Submit feedback"
        >
          <MessageSquare size={18} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
          {isSidebarOpen && "Feedback"}
        </Button>
        
        {/* External Links */}
        <div className={cn("mt-auto pt-4 border-t border-white/10 w-full", !isSidebarOpen && "flex justify-center")}>
             <a
                href="https://github.com/TerribleTurtle/spellcasters-community-api"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group",
                    !isSidebarOpen && "justify-center px-2"
                )}
                title={!isSidebarOpen ? "Contribute (GitHub)" : undefined}
              >
                <Github size={18} className="text-slate-500 group-hover:text-white shrink-0" />
                {isSidebarOpen && (
                    <>
                        Contribute
                        <ExternalLink size={12} className="ml-auto opacity-50" />
                    </>
                )}
              </a>
        </div>

      </div>
    </aside>
  );
}
