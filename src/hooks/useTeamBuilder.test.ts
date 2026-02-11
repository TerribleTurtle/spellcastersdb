import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTeamBuilder, STORAGE_KEY_SAVED_TEAMS, TEAM_SLOT_KEYS } from "./useTeamBuilder";
import { Deck } from "@/types/deck";
import { Unit } from "@/types/api";

// --- Mocks ---

const mockUnit: Unit = {
    entity_id: "u1",
    name: "Goblin",
    category: "Creature",
    rank: "I",
    health: 10,
    tags: [],
    magic_school: "Wild",
    description: ""
};

const mockDeck: Deck = {
    id: "d1",
    name: "Mock Deck",
    spellcaster: null,
    slots: [
        { index: 0, unit: mockUnit, allowedTypes: ["UNIT"] },
        { index: 1, unit: null, allowedTypes: ["UNIT"] },
        { index: 2, unit: null, allowedTypes: ["UNIT"] },
        { index: 3, unit: null, allowedTypes: ["UNIT"] },
        { index: 4, unit: null, allowedTypes: ["TITAN"] },
    ]
};

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useTeamBuilder", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
      vi.useRealTimers();
  });

  const waitForHydration = async () => {
      await act(async () => {
          vi.runAllTimers();
      });
  };

  it("should initialize with default team name", async () => {
    const { result } = renderHook(() => useTeamBuilder([mockUnit], []));
    await waitForHydration();

    expect(result.current.teamName).toBe("New Team");
    expect(result.current.activeTeamId).toBeNull();
  });

  it("should save a new team", async () => {
      const { result } = renderHook(() => useTeamBuilder([mockUnit], []));
      await waitForHydration();

      await act(async () => {
          result.current.setTeamName("My Awesome Team");
          result.current.saveTeam("My Awesome Team");
      });

      // Verify saved to state
      expect(result.current.savedTeams).toHaveLength(1);
      expect(result.current.savedTeams[0].name).toBe("My Awesome Team");
      expect(result.current.activeTeamId).not.toBeNull();

      // Verify persisted to storage
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY_SAVED_TEAMS)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe("My Awesome Team");
  });

  it("should load a saved team", async () => {
      const { result } = renderHook(() => useTeamBuilder([mockUnit], []));
      await waitForHydration();
      
      // Save Team A first
      await act(async () => {
          result.current.setTeamName("Team A");
          result.current.saveTeam("Team A");
      });
      const teamId = result.current.activeTeamId!;

      // Create another team (to switch away)
      await act(async () => {
          result.current.clearTeam();
      });
      // Allow state to settle so activeTeamId becomes null
      await act(async () => {
          result.current.saveTeam("Team B");
      });
      
      expect(result.current.teamName).toBe("Team B");
      expect(result.current.activeTeamId).not.toBe(teamId); // Should be new ID

      // Load Team A
      await act(async () => {
          result.current.loadTeam(teamId);
      });

      expect(result.current.teamName).toBe("Team A");
      expect(result.current.activeTeamId).toBe(teamId);
  });

  it("should import a solo deck into a slot", async () => {
      const { result } = renderHook(() => useTeamBuilder([mockUnit], []));
      await waitForHydration();

      await act(async () => {
          result.current.importSoloDeck(0, mockDeck);
      });

      // Verify state update (optimistic)
      expect(result.current.teamDecks?.[0].name).toBe("Mock Deck");

      // Verify storage update
      const key = TEAM_SLOT_KEYS[0];
      const storedSlot = JSON.parse(localStorageMock.getItem(key)!);
      expect(storedSlot.name).toBe("Mock Deck");
  });

  it("should clear the team", async () => {
      const { result } = renderHook(() => useTeamBuilder([mockUnit], []));
      await waitForHydration();

      await act(async () => {
          result.current.saveTeam("To Be Deleted");
      });
      expect(result.current.activeTeamId).not.toBeNull();

      await act(async () => {
          result.current.clearTeam();
      });

      expect(result.current.teamName).toBe("New Team");
      expect(result.current.activeTeamId).toBeNull();
      // Verify storage slots cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(TEAM_SLOT_KEYS[0]);
  });
});

