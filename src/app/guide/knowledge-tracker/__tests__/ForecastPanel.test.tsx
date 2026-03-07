import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameSystems } from "@/types/api";

import { ForecastPanel } from "../components/ForecastPanel";

const mockSystems: GameSystems = {
  progression: {
    starting_knowledge: {
      default: 250,
      beta: 1000,
      early_access_compensation: 2000,
    },
    earn_rates: { first_daily_match: 200, win: 50, loss: 25 },
  },
  ranked: { tiers_per_rank: 5, rp_gain_per_win: 10, ranks: [] },
  match_xp: {},
};

const defaultProps = {
  targetCost: 2000,
  currentKnowledge: 1000,
  selectedCount: 3,
  winRate: 0.5,
  gamesPerDay: 5,
  matchDuration: 30,
  systems: mockSystems,
};

describe("ForecastPanel", () => {
  it("calculates blended rate and days needed correctly (50% win rate)", () => {
    // Deficit: 1000
    // Blended = (0.5 * 50) + (0.5 * 25) = 37.5 / game
    // Daily: 200 + (5 * 37.5) = 387.5 / day → ceil(1000 / 387.5) = 3 Days
    render(<ForecastPanel {...defaultProps} />);

    expect(screen.getByText("1,000 remaining")).toBeInTheDocument();

    // Days = 3 (in the projection row)
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Projected at 50% Win Rate/i)).toBeInTheDocument();
  });

  it("shows the All Wins and All Losses scenario cards", () => {
    render(<ForecastPanel {...defaultProps} />);

    // All Wins: ceil(1000 / 50) = 20
    // All Losses: ceil(1000 / 25) = 40
    expect(screen.getByText("Wins Needed")).toBeInTheDocument();
    expect(screen.getByText("Losses Needed")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("shows Time to Goal based on match duration", () => {
    // gamesCustom at 50% WR: ceil(1000 / 37.5) = 27
    // Time: 27 * 30 = 810 min → 13.5h
    render(<ForecastPanel {...defaultProps} />);

    expect(screen.getByText("Time")).toBeInTheDocument();
    // Time value in hrs format — look for the exact value
    expect(screen.getByText("13.5h")).toBeInTheDocument();
  });

  it("handles 0 games per day gracefully", () => {
    render(<ForecastPanel {...defaultProps} gamesPerDay={0} />);

    // Days column should show ∞
    expect(screen.getAllByText("∞").length).toBeGreaterThan(0);
  });

  it("shows success state when target is met", () => {
    render(
      <ForecastPanel
        {...defaultProps}
        targetCost={500}
        currentKnowledge={600}
        selectedCount={1}
      />
    );

    // Progress bar shows Goal Accomplished
    expect(screen.getByText("Goal Accomplished")).toBeInTheDocument();
    expect(screen.getByText("100% of 500")).toBeInTheDocument();
    // Buy CTA appears
    expect(
      screen.getByText(/You can buy your tracked items now/i)
    ).toBeInTheDocument();
    // Projection row should not appear
    expect(screen.queryByText(/Projected at/i)).not.toBeInTheDocument();
  });

  it("shows empty state when no target selected", () => {
    render(
      <ForecastPanel {...defaultProps} targetCost={0} selectedCount={0} />
    );

    // Progress bar shows "No incantations selected"
    expect(screen.getByText("No incantations selected")).toBeInTheDocument();
    // CTA prompt is shown in the projection area
    expect(screen.getByText(/Select entities below/i)).toBeInTheDocument();
    // Grid placeholders are muted dashes
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("renders progress bar with correct percentage (cap at 100%)", () => {
    // 750 / 1000 = 75%
    render(
      <ForecastPanel
        {...defaultProps}
        targetCost={1000}
        currentKnowledge={750}
        selectedCount={2}
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    expect(screen.getByText("75% of 1,000")).toBeInTheDocument();
  });
});
