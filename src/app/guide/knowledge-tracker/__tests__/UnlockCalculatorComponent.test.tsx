import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useCalculatorStore } from "@/store/calculator-store";
import { GameSystems, UnifiedEntity } from "@/types/api";

import { UnlockCalculator } from "../components/UnlockCalculator";

const mockSystems = {
  constants: {
    knowledge_per_win: 100,
    knowledge_per_loss: 50,
    daily_bonus_knowledge: 200,
  },
  progression: {
    starting_knowledge: {
      beta: 0,
      default: 0,
    },
    earn_rates: {
      win: 100,
      loss: 50,
      first_win_daily: 200,
    },
  },
} as unknown as GameSystems;

const mockEntities: UnifiedEntity[] = [
  {
    entity_id: "e1",
    name: "High Cost Spell",
    knowledge_cost: 500,
  } as unknown as UnifiedEntity,
  {
    entity_id: "e2",
    name: "Zero Cost Starter",
    knowledge_cost: 0,
  } as unknown as UnifiedEntity,
];

describe("UnlockCalculator Component Integration", () => {
  beforeEach(() => {
    // Reset the store before each test
    useCalculatorStore.setState({
      selectedIds: [],
      ownedIds: [],
      hideOwned: false,
      currentKnowledge: 250,
      winRate: 0.5,
      gamesPerDay: 3,
      matchDuration: 20,
    });
  });

  it("automatically marks 0-cost entities as owned on mount via initializeDefaults", () => {
    // Before render, store should be empty
    expect(useCalculatorStore.getState().ownedIds).toEqual([]);

    render(<UnlockCalculator entities={mockEntities} systems={mockSystems} />);

    // After mount, the useEffect should have triggered initializeDefaults for "e2"
    expect(useCalculatorStore.getState().ownedIds).toContain("e2");
    expect(useCalculatorStore.getState().ownedIds).not.toContain("e1");

    // The UI should reflect this - "Zero Cost Starter" should be rendered
    expect(screen.getByText("Zero Cost Starter")).toBeInTheDocument();
  });
});
