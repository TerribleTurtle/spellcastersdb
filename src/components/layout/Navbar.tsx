"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";


import { ExternalLink, Menu, X, MessageSquare } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, EXTERNAL_LINKS, isActivePath } from "@/lib/nav-links";

import { useFeedback } from "@/hooks/useFeedback";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Button } from "@/components/ui/button";
import { ThemePicker } from "@/components/ui/ThemePicker";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const feedback = useFeedback();
  const pathname = usePathname();
  useFocusTrap(isOpen, () => setIsOpen(false));

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => isActivePath(path, pathname);

  const allLinks = [...PRIMARY_NAV, ...SECONDARY_NAV, ...EXTERNAL_LINKS];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-default bg-surface-main/80 backdrop-blur-md">
      <div className="relative mx-auto max-w-site-shell px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Deck Context */}
          <div className="shrink-0 flex items-center gap-6">
            <Link href="/" className="flex flex-col group">
                <>
                <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
                    SPELLCASTERS<span className="text-text-primary">DB</span>
                </span>
                <span className="text-[10px] text-text-muted tracking-wide hidden sm:block">
                    Unofficial community database
                </span>
                </>
            </Link>
          </div>

          {/* Desktop Right Side (External + Menu) */}
          <div className="hidden md:flex items-center gap-6">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-brand-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center gap-2 md:hidden relative z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-expanded={isOpen}
              className="text-text-muted hover:text-brand-accent"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Menu Drawer (Mobile & Desktop Overlay) */}
        {isOpen && (
          <div className="absolute top-16 right-0 w-full md:w-64 bg-surface-main/95 backdrop-blur-xl border-l border-b border-border-default shadow-2xl h-[calc(100vh-4rem)] md:h-auto md:rounded-bl-xl overflow-y-auto">
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
                          ? "bg-surface-card text-brand-primary"
                          : "text-text-secondary hover:bg-surface-card hover:text-brand-accent"
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
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-text-secondary hover:bg-surface-card hover:text-brand-accent transition-colors"
                  >
                    {Icon && <Icon size={18} />}
                    {link.name}
                    <ExternalLink size={14} className="opacity-50 ml-auto" />
                  </a>
                );
              })}
              
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  feedback.openFeedback();
                }}
                className="justify-start px-3 py-2 text-base font-medium text-text-secondary hover:bg-surface-card hover:text-brand-accent w-full"
              >
                <MessageSquare size={18} className="mr-2" />
                Feedback
              </Button>
              
              <div className="px-3 py-2">
                  <ThemePicker side="bottom" align="end" className="w-full justify-between px-0 hover:bg-transparent text-base font-medium text-text-secondary">
                    <span>Theme</span>
                  </ThemePicker>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

