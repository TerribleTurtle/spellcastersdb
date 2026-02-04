'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Github, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => pathname?.startsWith(path);

  const navLinks = [
    { name: 'Deck Builder', href: '/deck-builder', internal: true },
    { name: 'Guide', href: '/guide', internal: true },
    { name: 'FAQ', href: '/faq', internal: true },
    { name: 'About', href: '/about', internal: true },
  ];

  const externalLinks = [
    { name: 'Contribute', href: 'https://github.com/TerribleTurtle/spellcasters-community-api', icon: Github },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-surface-main/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                SPELLCASTERS<span className="text-white">DB</span>
              </span>
              <span className="text-[10px] text-gray-500 tracking-wide hidden sm:block">
                Unofficial community database
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
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
            
            {/* External Links */}
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/10">
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
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 bg-surface-main/95 backdrop-blur-xl border-b border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-white/5 text-brand-primary'
                    : 'text-slate-300 hover:bg-white/5 hover:text-brand-accent'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* External Links in Mobile */}
            <div className="pt-2 mt-2 border-t border-white/10">
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

