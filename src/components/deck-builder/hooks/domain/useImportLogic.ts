"use client";

import { useEffect } from "react";
import { useDeckStore } from "@/store/index";

interface UseImportLogicProps {
  isEmpty: boolean;
  hasChanges: boolean;
}

export function useImportLogic({ isEmpty, hasChanges }: UseImportLogicProps) {
  const {
    pendingImport,
    setPendingImport,
    resolvePendingImport,
  } = useDeckStore();

  // Auto-resolve if no conflicts (empty deck or no changes)
  useEffect(() => {
    if (pendingImport && (isEmpty || !hasChanges)) {
      resolvePendingImport("OVERWRITE");
    }
  }, [pendingImport, isEmpty, hasChanges, resolvePendingImport]);

  const showConflictModal = !!(pendingImport && !isEmpty && hasChanges);

  return {
    pendingImport,
    setPendingImport,
    resolvePendingImport,
    showConflictModal,
  };
}
