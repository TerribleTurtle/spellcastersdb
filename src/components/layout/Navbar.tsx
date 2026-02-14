"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";


import { ExternalLink, Github, Menu, X, MessageSquare } from "lucide-react";

import { useFeedback } from "@/hooks/useFeedback";

import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const feedback = useFeedback();
  const pathname = usePathname();
  useFocusTrap(isOpen, () => setIsOpen(false));

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname?.startsWith(path));

  const primaryLinks = [
    { name: "Deck Builder", href: "/", internal: true },
    { name: "Database", href: "/database", internal: true },
    { name: "Roadmap", href: "/roadmap", internal: true },
  ];

  const secondaryLinks = [
    { name: "Guide", href: "/guide", internal: true },
    { name: "FAQ", href: "/faq", internal: true },
    { name: "Bot", href: "/discord-bot", internal: true },
    { name: "About", href: "/about", internal: true },
    {
      name: "Contribute",
      href: "https://github.com/TerribleTurtle/spellcasters-community-api",
      internal: false,
      icon: Github,
    },
  ];

  const allLinks = [...primaryLinks, ...secondaryLinks];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-surface-main/80 backdrop-blur-md">
      <div className="relative mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Deck Context */}
          <div className="shrink-0 flex items-center gap-6">
            <Link href="/" className="flex flex-col group">
                <>
                <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
                    SPELLCASTERS<span className="text-white">DB</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-wide hidden sm:block">
                    Unofficial community database
                </span>
                </>
            </Link>
          </div>

          {/* Desktop Primary Nav - HIDDEN (Moved to Sidebar) */}
          {/* We keep this commented out or removed so it doesn't conflict with the sidebar */
          /* 
          {pathname !== "/" && (
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6">
                 ...
            </div>
          )}
          */
          }

          {/* Desktop Right Side (External + Menu) */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* External Links - Hidden on desktop now as they are in sidebar, or keep specifically for some? */}
            {/* Actually, if we use sidebar, we might trigger the sidebar on mobile via this button, OR just hide this trigger on desktop if the sidebar is always visible.
                The prompt says "Hide the hamburger on desktop".
            */}
            <div className="pl-4 border-l border-white/10 md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-brand-accent focus:outline-none transition-colors"
                title="Menu"
              >
                <span className="sr-only">Open menu</span>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center gap-2 md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-brand-accent focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Drawer (Mobile & Desktop Overlay) */}
        {isOpen && (
          <div className="absolute top-16 right-0 w-full md:w-64 bg-surface-main/95 backdrop-blur-xl border-l border-b border-white/10 shadow-2xl h-[calc(100vh-4rem)] md:h-auto md:rounded-bl-xl overflow-y-auto">
            <div className="flex flex-col p-4 space-y-1">
              {/* Show all links in the drawer for easy access */}
              {allLinks.map((link) => {
                if (link.internal) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-white/5 text-brand-primary"
                          : "text-slate-300 hover:bg-white/5 hover:text-brand-accent"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                }

                const Icon = (link as { icon?: React.ElementType }).icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-brand-accent transition-colors"
                  >
                    {Icon && <Icon size={18} />}
                    {link.name}
                    <ExternalLink size={14} className="opacity-50 ml-auto" />
                  </a>
                );
              })}
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  feedback.openFeedback();
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-brand-accent transition-colors w-full text-left"
              >
                <MessageSquare size={18} />
                Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
