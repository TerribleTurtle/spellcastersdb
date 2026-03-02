import React from "react";

import Link from "next/link";

export interface GuideCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

export function GuideCard({
  title,
  description,
  href,
  icon,
  gradient,
  badge,
}: GuideCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col bg-surface-card border border-border-default rounded-xl p-5 md:p-6 transition-all duration-300 hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/5 hover:-translate-y-0.5"
    >
      {/* Badge */}
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-linear-to-r from-fuchsia-500 to-violet-500 text-white shadow-sm">
          {badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-lg bg-linear-to-br ${gradient} flex items-center justify-center mb-4 text-brand-primary group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="space-y-2 mt-auto">
        <h3 className="text-xl font-bold tracking-tight text-text-primary group-hover:text-brand-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Hover Line */}
      <div className="absolute bottom-0 left-0 h-1 bg-brand-primary w-0 group-hover:w-full transition-all duration-500 ease-in-out" />
    </Link>
  );
}
