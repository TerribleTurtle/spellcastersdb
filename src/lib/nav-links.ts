import {
  BookOpen,
  Bot,
  Database,
  Github,
  HelpCircle,
  Home,
  Info,
  LucideIcon,
  SwatchBook,
} from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  internal?: boolean;
}

export const PRIMARY_NAV: NavLink[] = [
  { name: "Home", href: "/", icon: Home, internal: true },
  {
    name: "Deck Builder",
    href: "/deck-builder",
    icon: SwatchBook,
    internal: true,
  },
  { name: "Database", href: "/database", icon: Database, internal: true },
];

export const SECONDARY_NAV: NavLink[] = [
  { name: "Guide", href: "/guide", icon: BookOpen, internal: true },
  { name: "FAQ", href: "/faq", icon: HelpCircle, internal: true },
  { name: "Bot", href: "/discord-bot", icon: Bot, internal: true },
  { name: "About", href: "/about", icon: Info, internal: true },
];

export const EXTERNAL_LINKS: NavLink[] = [
  {
    name: "Contribute",
    href: "https://github.com/TerribleTurtle/spellcasters-community-api",
    icon: Github,
    internal: false,
  },
];

export const isActivePath = (
  path: string,
  pathname: string | null
): boolean => {
  if (!pathname || !path) return false;
  if (pathname === path) return true;
  if (path === "/") return false;
  // Ensure the match is at a path boundary (e.g. /deck-builder/ or /deck-builder?)
  // and not a prefix collision (e.g. /deck-builder-pro)
  return (
    pathname.startsWith(path) &&
    (pathname[path.length] === "/" ||
      pathname[path.length] === "?" ||
      pathname[path.length] === "#")
  );
};
