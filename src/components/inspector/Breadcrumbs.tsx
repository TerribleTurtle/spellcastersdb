"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
      <Link 
        href="/" 
        className="flex items-center gap-1 hover:text-white transition-colors shrink-0"
      >
        <Home size={12} />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={10} className="text-gray-700 shrink-0" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-300 font-medium truncate max-w-[150px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
