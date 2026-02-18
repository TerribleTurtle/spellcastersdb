import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatchBadge } from "@/components/ui/PatchBadge";

describe("PatchBadge", () => {
  it("renders icon variant for Patch with correct title", () => {
    render(<PatchBadge type="Patch" variant="icon" />);
    const badge = screen.getByTestId("patch-badge-Patch");
    expect(badge).toBeTruthy();
    expect(badge.getAttribute("title")).toBe("Patch");
  });

  it("renders icon variant for Hotfix with correct title", () => {
    render(<PatchBadge type="Hotfix" variant="icon" />);
    const badge = screen.getByTestId("patch-badge-Hotfix");
    expect(badge).toBeTruthy();
    expect(badge.getAttribute("title")).toBe("Hotfix");
  });

  it("renders full variant with label text", () => {
    render(<PatchBadge type="Content" variant="full" />);
    const badge = screen.getByTestId("patch-badge-Content");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Content");
  });

  it("renders all three patch categories", () => {
    const types = ["Patch", "Hotfix", "Content"] as const;
    for (const type of types) {
      const { unmount } = render(<PatchBadge type={type} />);
      expect(screen.getByTestId(`patch-badge-${type}`)).toBeTruthy();
      unmount();
    }
  });

  it("applies custom className", () => {
    render(<PatchBadge type="Patch" className="custom-class" />);
    const badge = screen.getByTestId("patch-badge-Patch");
    expect(badge.className).toContain("custom-class");
  });
});
