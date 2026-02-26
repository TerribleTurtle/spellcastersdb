import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import GuideHubPage from "../page";

// Mock the Link component since we are testing a page component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("Guide Hub Page", () => {
  it("renders all expected guide sections with correct terminology", () => {
    // The GuideHubPage is a Server Component, but since it has no async data fetching
    // directly in its top-level render (it just returns static JSX structure for the hub cards),
    // we can render it synchronously in our tests.
    render(<GuideHubPage />);

    // Verify Main Headers
    expect(screen.getByText("Game Guide")).toBeInTheDocument();
    expect(
      screen.getByText("A reference for game systems and mechanics.")
    ).toBeInTheDocument();

    // Verify Terminology Corrections (Phase 3 Audit Fixes)
    // 1. "Archetype Upgrades" should be "Class Upgrades"
    expect(screen.getByText("Class Upgrades")).toBeInTheDocument();

    // 2. Ensure hallucinated "build paths" are gone, and "choices" is present
    expect(
      screen.getByText(/Population scaling and level-up choices/i)
    ).toBeInTheDocument();

    // 3. Ensure ranked "strategies" is gone, and "RP mechanics" is present
    expect(
      screen.getByText(/tier breakdowns, and RP mechanics/i)
    ).toBeInTheDocument();

    // Verify Other Cards Exist
    expect(screen.getByText("Basics & Deck Building")).toBeInTheDocument();
    expect(screen.getByText("Mechanics & Progression")).toBeInTheDocument();
    expect(screen.getByText("Ranked Mode")).toBeInTheDocument();
  });
});
