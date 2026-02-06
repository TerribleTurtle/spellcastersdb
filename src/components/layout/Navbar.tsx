'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Github, ExternalLink } from 'lucide-react';

import { BetaBanner } from './BetaBanner';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path));

  const primaryLinks = [
      { name: 'Deck Builder', href: '/', internal: true },
      { name: 'Database', href: '/database', internal: true },
      { name: 'Roadmap', href: '/roadmap', internal: true },
  ];

  const secondaryLinks = [
    { name: 'Guide', href: '/guide', internal: true },
    { name: 'FAQ', href: '/faq', internal: true },
    { name: 'About', href: '/about', internal: true },
  ];
  
  const allLinks = [...primaryLinks, ...secondaryLinks];

  const externalLinks = [
    { name: 'Contribute', href: 'https://github.com/TerribleTurtle/spellcasters-community-api', icon: Github },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-surface-main/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-6">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
                SPELLCASTERS<span className="text-white">DB</span>
              </span>
              <span className="text-[10px] text-gray-500 tracking-wide hidden sm:block">
                Unofficial community database
              </span>
            </Link>
          </div>

          {/* Desktop Primary Nav - Centered */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6">
              {primaryLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-brand-accent ${
                    isActive(link.href) ? 'text-brand-primary' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          </div>

          {/* Desktop Right Side (External + Menu) */}
          <div className="hidden md:flex items-center gap-4">
             <BetaBanner />
             {/* External Links */}
             <div className="flex items-center gap-4">
              {externalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-brand-accent transition-colors"
                    title={link.name}
                  >
                    <Icon size={16} />
                    <span className="hidden lg:inline">{link.name}</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </a>
                );
              })}
            </div>

            <div className="pl-4 border-l border-white/10">
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
            <BetaBanner />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-brand-accent focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Drawer (Mobile & Desktop Overlay) */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-full md:w-64 bg-surface-main/95 backdrop-blur-xl border-l border-b border-white/10 shadow-2xl h-[calc(100vh-4rem)] md:h-auto md:rounded-bl-xl overflow-y-auto">
          <div className="flex flex-col p-4 space-y-1">
             {/* Show all links in the drawer for easy access */}
             {allLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/5 text-brand-primary'
                    : 'text-slate-300 hover:bg-white/5 hover:text-brand-accent'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 mt-2 border-t border-white/10 md:hidden">
            {/* Mobile Only External Links (Desktop has them in bar) */}
              {externalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-brand-accent"
                  >
                    <Icon size={18} />
                    {link.name}
                    <ExternalLink size={14} className="opacity-50 ml-auto" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

