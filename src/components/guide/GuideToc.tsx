"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, ChevronRight, List } from "lucide-react";

import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  label: string;
}

const GUIDE_SECTIONS: TocItem[] = [
  { id: "overview", label: "Overview" },
  { id: "card-types", label: "Card Types" },
  { id: "ranks", label: "Ranks" },
  { id: "spellcasters", label: "Spellcasters" },
  { id: "charges-cooldowns", label: "Charges & Cooldowns" },
  { id: "deck-building", label: "Deck Building" },
  { id: "infusions", label: "Infusions" },
];

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 100;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  history.pushState(null, "", `#${id}`);
}

/**
 * Desktop sidebar TOC — sticky, follows you down the page.
 */
export function GuideToc() {
  const [activeId, setActiveId] = useState<string>("overview");
  const clickLockRef = useRef(false);

  useEffect(() => {
    const lastSectionId = GUIDE_SECTIONS[GUIDE_SECTIONS.length - 1].id;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !clickLockRef.current) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    GUIDE_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Force-highlight last item when scrolled to page bottom
    const handleScroll = () => {
      if (clickLockRef.current) return;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;
      if (nearBottom) {
        setActiveId(lastSectionId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTocClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    setActiveId(id);
    clickLockRef.current = true;
    scrollToSection(id);
    setTimeout(() => {
      clickLockRef.current = false;
    }, 1200);
  };

  return (
    <nav
      className="hidden lg:block shrink-0 w-56"
      aria-label="Table of Contents"
    >
      <div className="sticky top-24">
        <h3 className="flex items-center gap-2 font-bold mb-4 text-text-primary px-3 text-sm">
          <List size={16} className="text-brand-primary" />
          On this page
        </h3>
        <ul className="space-y-0.5 border-l-2 border-border-subtle ml-3">
          {GUIDE_SECTIONS.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => handleTocClick(e, id)}
                  className={cn(
                    "block px-4 py-1.5 text-sm transition-colors border-l-2 -ml-[2px]",
                    isActive
                      ? "border-brand-primary text-text-primary font-medium"
                      : "border-transparent text-text-muted hover:text-text-primary hover:border-border-strong"
                  )}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/**
 * Mobile TOC — collapsible accordion with smooth open/close transition.
 */
export function MobileGuideToc() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-surface-card border border-border-default rounded-lg px-4 py-3 text-left transition-colors hover:border-border-strong"
        aria-expanded={isOpen}
        aria-controls="mobile-toc-content"
      >
        <span className="flex items-center gap-2 font-bold text-text-primary text-sm">
          <List size={16} className="text-brand-primary" />
          Table of Contents
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        id="mobile-toc-content"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-surface-card border border-border-default rounded-lg px-4 py-3">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {GUIDE_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors py-1.5 active:text-brand-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(id);
                    setIsOpen(false);
                  }}
                >
                  <ChevronRight
                    size={12}
                    className="text-brand-primary/50 shrink-0"
                  />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
