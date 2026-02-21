"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";

export function ClearDataButton() {
  const [isCleared, setIsCleared] = useState(false);

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete all your local data, including constructed decks and settings? This action cannot be undone."
      )
    ) {
      localStorage.clear();
      setIsCleared(true);
      // Optional: force reload so app state (like Zustand) drops the cache
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="mt-4 p-4 border border-border-strong rounded-lg bg-surface-base">
      <h4 className="text-md font-semibold text-text-primary mb-2 flex items-center gap-2">
        <Trash2 className="w-5 h-5 text-feedback-error" />
        Data Erasure Tool
      </h4>
      <p className="text-sm text-text-muted mb-4">
        Use this tool to instantly delete all data SpellcastersDB has stored in
        your browser&apos;s Local Storage.
      </p>

      {isCleared ? (
        <div className="text-sm text-feedback-success font-medium flex items-center gap-2 bg-surface-card p-3 rounded">
          <span>✓</span>
          All local data has been successfully deleted. Reloading...
        </div>
      ) : (
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-surface-card hover:bg-surface-elevated border border-border-strong hover:border-feedback-error text-feedback-error rounded-md text-sm font-medium transition-colors"
        >
          Clear My Data Now
        </button>
      )}
    </div>
  );
}
