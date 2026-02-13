"use client";

import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DECK_EDITOR_TABS, DeckEditorTab } from "../../ui/constants";

interface DeckEditorShellProps {
  activeTab: DeckEditorTab;
  onTabChange: (tab: DeckEditorTab) => void;
  browserContent: ReactNode;
  inspectorContent: ReactNode;
  forgeContent: ReactNode;
  trayContent: ReactNode;
  toastMessage?: string | null;
}

export function DeckEditorShell({
  activeTab,
  onTabChange,
  browserContent,
  inspectorContent,
  forgeContent,
  trayContent,
  toastMessage,
}: DeckEditorShellProps) {
  return (
    <>
      <div className="h-full flex flex-col md:grid md:grid-cols-12 xl:grid-cols-16 border-b border-white/10 bg-surface-main overflow-hidden relative">
        <div className="md:hidden flex bg-surface-main border-b border-white/10 shrink-0 sticky top-0 z-50">
          {[
            {
              id: DECK_EDITOR_TABS.BROWSER,
              label: "Vault",
              icon: <div className="w-1.5 h-1.5 rounded-full border border-current" />,
            },
            {
              id: DECK_EDITOR_TABS.INSPECTOR,
              label: "Inspector",
              icon: <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />,
            },
            { id: DECK_EDITOR_TABS.FORGE, label: "Forge", icon: <AlertTriangle size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as DeckEditorTab)}
              className={cn(
                "flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2",
                activeTab === tab.id
                  ? "text-brand-accent border-brand-accent bg-white/5"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Unit Browser - Left Column */}
        <div
          className={cn(
            "md:col-span-4 xl:col-span-5 h-full overflow-hidden md:border-r border-white/10",
            activeTab === DECK_EDITOR_TABS.BROWSER ? "block" : "hidden md:block"
          )}
        >
          {browserContent}
        </div>

        {/* Inspector - Middle Column */}
        <div
          className={cn(
            "md:col-span-4 xl:col-span-6 h-full overflow-hidden flex flex-col",
            activeTab !== DECK_EDITOR_TABS.INSPECTOR && "hidden md:block"
          )}
        >
          {inspectorContent}
        </div>

        {/* Forge Controls - Right Column */}
        <div
          className={cn(
            "md:col-span-4 xl:col-span-5 h-full overflow-hidden border-l border-white/10",
            activeTab !== DECK_EDITOR_TABS.FORGE && "hidden md:block"
          )}
        >
          <div className="h-full p-4 flex flex-col gap-4 overflow-hidden">
            {forgeContent}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 bg-brand-primary text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>

       {/* Active Deck Bar (Fixed Bottom) */}
       <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="bg-surface-main/95 border-t border-brand-primary/30 backdrop-blur-md shadow-2xl pointer-events-auto">
             <div className="w-full">
                 {trayContent}
             </div>
          </div>
       </div>
    </>
  );
}
