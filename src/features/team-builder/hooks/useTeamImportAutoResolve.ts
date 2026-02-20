"use client";

import { useEffect } from "react";

import { useDeckStore } from "@/store/index";

interface UseTeamImportAutoResolveProps {
  isEmpty: boolean;
  hasChanges: boolean;
}

export function useTeamImportAutoResolve({
  isEmpty,
  hasChanges,
}: UseTeamImportAutoResolveProps) {
  const { pendingImport, resolvePendingImport } = useDeckStore();

  useEffect(() => {
    if (pendingImport && (isEmpty || !hasChanges)) {
      resolvePendingImport("OVERWRITE");
    }
  }, [pendingImport, isEmpty, hasChanges, resolvePendingImport]);

  return {
    showConflictModal: pendingImport && !isEmpty && hasChanges,
  };
}
