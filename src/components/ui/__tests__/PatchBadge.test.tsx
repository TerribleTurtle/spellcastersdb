import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatchBadge } from "@/components/ui/PatchBadge";

describe("PatchBadge", () => {
  it("renders icon variant for buff with correct title", () => {
    render(<PatchBadge type="buff" variant="icon" />);
    const badge = screen.getByTestId("patch-badge-buff");
    expect(badge).toBeTruthy();
    expect(badge.getAttribute("title")).toBe("Buffed");
  });

  it("renders icon variant for nerf with correct title", () => {
    render(<PatchBadge type="nerf" variant="icon" />);
    const badge = screen.getByTestId("patch-badge-nerf");
    expect(badge).toBeTruthy();
    expect(badge.getAttribute("title")).toBe("Nerfed");
  });

  it("renders full variant with label text", () => {
    render(<PatchBadge type="rework" variant="full" />);
    const badge = screen.getByTestId("patch-badge-rework");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Reworked");
  });

  it("renders all five patch types", () => {
    const types = ["buff", "nerf", "rework", "fix", "new"] as const;
    for (const type of types) {
      const { unmount } = render(<PatchBadge type={type} />);
      expect(screen.getByTestId(`patch-badge-${type}`)).toBeTruthy();
      unmount();
    }
  });

  it("applies custom className", () => {
    render(<PatchBadge type="buff" className="custom-class" />);
    const badge = screen.getByTestId("patch-badge-buff");
    expect(badge.className).toContain("custom-class");
  });
});
