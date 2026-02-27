import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountPanel } from "../components/AccountPanel";

describe("AccountPanel", () => {
  const defaultProps = {
    currentKnowledge: 1500,
    onKnowledgeChange: vi.fn(),
    winRate: 0.5,
    onWinRateChange: vi.fn(),
    gamesPerDay: 5,
    onGamesPerDayChange: vi.fn(),
    matchDuration: 30,
    onMatchDurationChange: vi.fn(),
    winReward: 50,
    lossReward: 25,
  };

  it("renders the current knowledge input correctly", () => {
    render(<AccountPanel {...defaultProps} />);

    expect(screen.getByText("Knowledge")).toBeInTheDocument();

    const input = screen.getByRole("spinbutton", {
      name: "Current Knowledge Bank",
    });
    expect(input).toHaveValue(1500);
  });

  it("calls onKnowledgeChange when input changes", () => {
    render(<AccountPanel {...defaultProps} />);

    const input = screen.getByRole("spinbutton", {
      name: "Current Knowledge Bank",
    });
    fireEvent.change(input, { target: { value: "2000" } });

    expect(defaultProps.onKnowledgeChange).toHaveBeenCalledWith(2000);
  });

  it("renders forecast settings (win rate & games/day)", () => {
    render(<AccountPanel {...defaultProps} />);

    expect(screen.getByText("Expected Win Rate")).toBeInTheDocument();

    // "50%" appears both as the current value and in the scale below the slider
    const fiftyPercentLabels = screen.getAllByText("50%");
    expect(fiftyPercentLabels.length).toBeGreaterThan(0);

    expect(screen.getByText("Matches Per Day")).toBeInTheDocument();
    const gamesInput = screen.getByRole("spinbutton", {
      name: "Matches Per Day",
    });
    expect(gamesInput).toHaveValue(5);
  });

  it("calls onWinRateChange when slider changes", () => {
    render(<AccountPanel {...defaultProps} />);

    const slider = screen.getByRole("slider", { name: "Expected Win Rate" });
    fireEvent.change(slider, { target: { value: "75" } });

    expect(defaultProps.onWinRateChange).toHaveBeenCalledWith(0.75);
  });

  it("calls onGamesPerDayChange when stepper changes", () => {
    render(<AccountPanel {...defaultProps} />);

    const increaseBtn = screen.getByRole("button", {
      name: "Increase Matches Per Day",
    });
    fireEvent.click(increaseBtn);

    expect(defaultProps.onGamesPerDayChange).toHaveBeenCalledWith(6);
  });

  it("renders Avg Match Duration stepper", () => {
    render(<AccountPanel {...defaultProps} />);

    expect(screen.getByText("Avg Match Duration")).toBeInTheDocument();
    const durationInput = screen.getByRole("spinbutton", {
      name: "Avg Match Duration",
    });
    expect(durationInput).toHaveValue(30);
  });

  it("calls onMatchDurationChange when stepper changes", () => {
    render(<AccountPanel {...defaultProps} />);

    const increaseBtn = screen.getByRole("button", {
      name: "Increase Avg Match Duration",
    });
    fireEvent.click(increaseBtn);

    expect(defaultProps.onMatchDurationChange).toHaveBeenCalledWith(31);
  });

  it("does not render a Closed Beta Player toggle", () => {
    render(<AccountPanel {...defaultProps} />);

    expect(screen.queryByText("Closed Beta Player")).not.toBeInTheDocument();
  });
});
