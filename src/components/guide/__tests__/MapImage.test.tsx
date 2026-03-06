import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MapImage } from "../MapImage";

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    sizes: _sizes,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    className?: string;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  },
}));

const MOCK_SRC =
  "https://terribleturtle.github.io/spellcasters-community-api/assets/maps/mausoleum.png";

describe("MapImage", () => {
  it("renders the image with the correct src and alt", () => {
    render(<MapImage src={MOCK_SRC} alt="Mausoleum arena map" />);
    const img = screen.getByRole("img", { name: /mausoleum arena map/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", MOCK_SRC);
  });

  it("renders a figure element with an Arena Map caption", () => {
    const { container } = render(
      <MapImage src={MOCK_SRC} alt="Mausoleum arena map" />
    );
    expect(container.querySelector("figure")).toBeInTheDocument();
    expect(screen.getByText("Arena Map")).toBeInTheDocument();
  });
});
