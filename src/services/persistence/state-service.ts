import { DeckBuilderMode } from "@/store/types";

const STORAGE_KEY_APP_STATE = "spellcasters_app_state_v2";

export interface AppState {
  mode?: DeckBuilderMode;
  viewSummary?: boolean;
  lastTeamHash?: string | null;
}

export interface HydratedState {
  hydratedMode: DeckBuilderMode;
  hydratedViewSummary: boolean;
  lastHash: string | null;
}

export const StateService = {
  save(state: AppState) {
    try {
      localStorage.setItem(STORAGE_KEY_APP_STATE, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save app state", e);
    }
  },

  hydrate(defaultMode: DeckBuilderMode, defaultViewSummary: boolean): HydratedState {
    let lastHash = null;
    let hydratedMode = defaultMode;
    let hydratedViewSummary = defaultViewSummary;

    if (typeof window === "undefined") {
        return { hydratedMode, hydratedViewSummary, lastHash };
    }

    const rawState = localStorage.getItem(STORAGE_KEY_APP_STATE);
    if (rawState) {
      try {
        const s = JSON.parse(rawState);
        if (s.mode) {
          hydratedMode = s.mode;
        }
        if (s.viewSummary !== undefined) {
          hydratedViewSummary = s.viewSummary;
        }
        if (s.lastTeamHash) lastHash = s.lastTeamHash;
      } catch (e) {
        console.error("Failed to hydrate app state", e);
      }
    }

    return { hydratedMode, hydratedViewSummary, lastHash };
  },
};
