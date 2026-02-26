import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeIcon } from "@/components/ui/icons/KnowledgeIcon";

// Mock next/image since it's not available in test environment
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="knowledge-icon"
    />
  ),
}));

describe("KnowledgeIcon", () => {
  it("renders an image pointing to knowledge.webp", () => {
    render(<KnowledgeIcon />);
    const img = screen.getByTestId("knowledge-icon");
    expect(img.getAttribute("src")).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/currencies/knowledge.webp"
    );
    expect(img.getAttribute("alt")).toBe("Knowledge Cost");
  });

  it("uses default visual size of 27 (18 * 1.5) when no size prop is provided", () => {
    render(<KnowledgeIcon />);
    const img = screen.getByTestId("knowledge-icon");
    expect(img.getAttribute("width")).toBe("27");
    expect(img.getAttribute("height")).toBe("27");
  });

  it("respects custom size prop with 1.5x visual scale", () => {
    render(<KnowledgeIcon size={12} />);
    const img = screen.getByTestId("knowledge-icon");
    expect(img.getAttribute("width")).toBe("18"); // 12 * 1.5
    expect(img.getAttribute("height")).toBe("18");
  });

  it("passes className through to the image element", () => {
    render(<KnowledgeIcon className="opacity-80 drop-shadow-md" />);
    const img = screen.getByTestId("knowledge-icon");
    expect(img.className).toContain("opacity-80");
    expect(img.className).toContain("drop-shadow-md");
  });

  it("renders without crashing when size is 0", () => {
    render(<KnowledgeIcon size={0} />);
    const img = screen.getByTestId("knowledge-icon");
    expect(img.getAttribute("width")).toBe("0");
  });
});
