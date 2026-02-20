import {
  BookOpen,
  Bot,
  Database,
  Github,
  HelpCircle,
  History,
  Home,
  Info,
  Layers,
  LucideIcon,
  Map,
} from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  internal?: boolean;
}

export const PRIMARY_NAV: NavLink[] = [
  { name: "Home", href: "/", icon: Home, internal: true },
  { name: "Deck Builder", href: "/deck-builder", icon: Layers, internal: true },
  { name: "Database", href: "/database", icon: Database, internal: true },
  { name: "History", href: "/changes", icon: History, internal: true },
  { name: "Roadmap", href: "/roadmap", icon: Map, internal: true },
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
  if (!pathname) return false;
  return pathname === path || (path !== "/" && pathname.startsWith(path));
};
