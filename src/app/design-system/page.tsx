"use client";

import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { ComponentCatalog } from "@/components/ui/ComponentCatalog";
import { ThemeBuilder } from "@/components/ui/ThemeBuilder";
import { TokenCatalog } from "@/components/ui/TokenCatalog";
import { cn } from "@/lib/utils";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<
    "builder" | "tokens" | "components"
  >("builder");

  return (
    <PageShell
      title="Design System Playground"
      subtitle="Create custom themes and preview tokens live."
    >
      <div className="w-full space-y-8">
        <div className="flex p-1 bg-surface-card border border-border-default rounded-lg w-full max-w-md">
          {["builder", "tokens", "components"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as "builder" | "tokens" | "components")
              }
              className={cn(
                "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab
                  ? "bg-surface-main text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "builder" && (
            <div className="bg-surface-main rounded-xl p-1 md:p-4">
              <ThemeBuilder />
            </div>
          )}
          {activeTab === "tokens" && <TokenCatalog />}
          {activeTab === "components" && <ComponentCatalog />}
        </div>
      </div>
    </PageShell>
  );
}
