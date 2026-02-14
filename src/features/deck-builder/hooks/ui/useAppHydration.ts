"use client";

import { useEffect, useRef, useState } from "react";
import { useDeckStore } from "@/store/index";
import { StateService, HydratedState } from "@/services/persistence/state-service";
import { useShallow } from "zustand/react/shallow";

export function useAppHydration() {
  const { 
    mode, 
    setMode, 
    viewSummary, 
    setViewSummary 
  } = useDeckStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
      viewSummary: state.viewSummary,
      setViewSummary: state.setViewSummary,
    }))
  );

  const [hydratedState, setHydratedState] = useState<HydratedState | null>(null);
  const isMounted = useRef(false);

  // Hydrate from Local Storage on Mount (useLayoutEffect to avoid flash)
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const result = StateService.hydrate(mode, viewSummary);
    const { hydratedMode, hydratedViewSummary } = result;
    
    // Batch updates if needed? Zustand handles this well usually.
    if (hydratedMode !== mode) setMode(hydratedMode);
    if (hydratedViewSummary !== viewSummary) setViewSummary(hydratedViewSummary);
    
    setHydratedState(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isHydrated: !!hydratedState,
    lastTeamHash: hydratedState?.lastHash || null,
    hydratedMode: hydratedState?.hydratedMode || mode
  };
}
