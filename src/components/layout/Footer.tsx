"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on Deck Builder for full-screen experience
  if (pathname?.startsWith("/deck-builder")) {
    return null;
  }

  return (
    <footer
      className="border-t border-border-default bg-surface-main/50 py-12 backdrop-blur-sm"
      data-testid="footer"
    >
      <div className="mx-auto max-w-site-shell px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left: Branding & Disclaimer */}
          <div className="flex flex-col items-center gap-2 md:items-start text-center md:text-left">
            <Link
              href="/"
              className="text-lg font-bold tracking-wider text-text-secondary hover:text-text-primary transition-colors"
            >
              SPELLCASTERS<span className="text-brand-primary">DB</span>
            </Link>
            <p className="text-sm text-text-muted max-w-md">
              A community-built database for Spellcasters Chronicles. Not
              affiliated with the game developers. All game assets property of
              their respective owners.
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex gap-6 flex-wrap justify-center md:justify-end">
              <a
                href="https://store.steampowered.com/app/2458470/Spellcasters_Chronicles/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-link-steam"
                className="text-sm text-text-muted hover:text-brand-accent transition-colors"
              >
                Steam
              </a>
              <a
                href="https://discord.com/invite/spellcasters-chronicles-1425209254847058003"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-link-discord"
                className="text-sm text-text-muted hover:text-brand-accent transition-colors"
              >
                Game Dev Discord
              </a>
              <a
                href="https://github.com/TerribleTurtle/spellcasters-community-api"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-link-github"
                className="text-sm text-text-muted hover:text-brand-accent transition-colors"
              >
                Community API
              </a>
              <div className="w-full md:w-auto hidden md:block border-r border-border-subtle h-4 mx-2" />
              <Link
                href="/privacy"
                data-testid="footer-link-privacy"
                className="text-sm text-text-muted hover:text-brand-accent transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                data-testid="footer-link-terms"
                className="text-sm text-text-muted hover:text-brand-accent transition-colors"
              >
                Terms
              </Link>
            </div>
            <div className="text-xs text-text-faint">
              Built by{" "}
              <a
                href="https://ko-fi.com/terribleturtles"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-text-muted hover:text-brand-accent transition-colors"
              >
                TerribleTurtles
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
