"use client";

import { useEffect, useState } from "react";

import { Combine, FlaskConical, Library, Play, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeckStore } from "@/store/index";

export function DeckBuilderWelcomeModal() {
  const { hasSeenDeckBuilderWelcome, setHasSeenDeckBuilderWelcome } =
    useDeckStore();

  // Handle hydration to prevent render mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog
      open={!hasSeenDeckBuilderWelcome}
      onOpenChange={(open) => {
        if (!open) {
          setHasSeenDeckBuilderWelcome(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[90dvh] flex flex-col bg-surface-main border-brand-primary/20 text-text-primary p-0 overflow-hidden rounded-xl md:rounded-2xl">
        {/* Header Decorator */}
        <div className="h-2 w-full shrink-0 bg-linear-to-r from-brand-primary via-brand-accent to-brand-secondary" />

        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          <DialogHeader className="mb-4 md:mb-6 pb-4 border-b border-border-subtle pr-8">
            <DialogTitle className="text-2xl font-oswald text-brand-primary flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-brand-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Welcome to the Deck Builder
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-base">
              Harness arcane power and forge your perfect strategy in three
              steps.
            </DialogDescription>
          </DialogHeader>

          {/* Steps */}
          <div className="space-y-6 md:space-y-8 mt-4 md:mt-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg text-text-primary mb-1">
                  Forge Your Strategy
                </h4>
                <p className="text-text-secondary">
                  Browse all available Incantations, Units, and Titans directly
                  within the builder and drag them into your slots. Ascend a
                  Spellcaster to command your forces.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg text-text-primary mb-1">
                  Bind Your Magic
                </h4>
                <p className="text-text-secondary mb-3">
                  Inscribe a title for your deck and Save your creation for
                  future battles.
                </p>
                {/* Mock Button */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-brand-primary/10 text-brand-primary border-brand-primary/50 cursor-default">
                  <Save className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Save
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg text-text-primary mb-1">
                  Consult the Library
                </h4>
                <p className="text-text-secondary mb-3">
                  Open the Library from the top menu to access your saved decks,
                  manage your collection, and import or export creations.
                </p>
                {/* Mock Button */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary border border-brand-primary text-brand-dark shadow-lg shadow-brand-primary/20 opacity-90 cursor-default">
                  <Library className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Library
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4 (Team Mode) */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border-subtle">
              <div className="shrink-0 mt-1 text-brand-accent">
                <Combine className="w-6 h-6 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-brand-accent mb-1">
                  Playing with Friends?
                </h4>
                <p className="text-text-secondary text-sm">
                  Toggle{" "}
                  <strong className="text-brand-accent">Team Mode</strong>! You
                  can build and manage three decks simultaneously to create the
                  perfect setup for your entire party.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-4 pb-2">
            <Button
              className="w-full sm:w-auto bg-brand-primary text-text-primary hover:bg-brand-primary/80 font-bold border border-brand-primary/50 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
              onClick={() => setHasSeenDeckBuilderWelcome(true)}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Begin Casting
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
