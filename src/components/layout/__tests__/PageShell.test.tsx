import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageShell } from "@/components/layout/PageShell";

describe("PageShell", () => {
  it("renders title and children", () => {
    render(
      <PageShell title="Test Page">
        <div data-testid="child-content">Content</div>
      </PageShell>
    );

    expect(screen.getByText("Test Page")).toBeTruthy();
    expect(screen.getByTestId("child-content")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    render(
      <PageShell title="Test Page" subtitle="Test Subtitle">
        <div>Content</div>
      </PageShell>
    );

    expect(screen.getByText("Test Subtitle")).toBeTruthy();
  });

  it("applies max-width classes correctly", () => {
    const { container } = render(
      <PageShell title="Test" maxWidth="page-grid">
        Content
      </PageShell>
    );

    // Check for the class availability
    // Note: class-variance-authority or tailwind classes might be merged, so we check if the element has the class
    expect(container.firstChild).toHaveClass("max-w-page-grid");
  });
});
