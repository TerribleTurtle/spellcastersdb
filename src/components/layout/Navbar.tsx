'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => pathname?.startsWith(path);

  const navLinks = [
    { name: 'The Forge', href: '/deck-builder', status: 'future' },
    { name: 'The Stratosphere', href: '/meta', status: 'future' },
  ];

  const archiveLinks = [
    { name: 'Units', href: '/units' },
    { name: 'Heroes', href: '/heroes' },
    { name: 'Consumables', href: '/consumables' },
    { name: 'Upgrades', href: '/upgrades' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-surface-main/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
                SPELLCASTERS<span className="text-white">DB</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* Archive Dropdown Group */}
              <div className="relative group">
                <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-brand-accent ${
                  ['/units', '/heroes', '/consumables', '/upgrades'].some(p => isActive(p)) 
                    ? 'text-brand-primary' 
                    : 'text-slate-300'
                }`}>
                  The Archive <ChevronDown size={14} />
                </button>
                <div className="absolute left-0 mt-0 w-48 origin-top-left scale-95 opacity-0 transition-all duration-200 group-hover:block group-hover:scale-100 group-hover:opacity-100">
                  <div className="mt-2 rounded-md border border-white/10 bg-surface-main/95 p-1 shadow-lg backdrop-blur-xl ring-1 ring-black ring-opacity-5">
                    {archiveLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`block rounded-md px-4 py-2 text-sm transition-colors hover:bg-white/5 hover:text-brand-accent ${
                          isActive(link.href) ? 'text-brand-primary' : 'text-slate-300'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

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
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              The Archive
            </div>
            {archiveLinks.map((link) => (
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
            <div className="my-2 border-t border-white/10"></div>
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
          </div>
        </div>
      )}
    </nav>
  );
}
