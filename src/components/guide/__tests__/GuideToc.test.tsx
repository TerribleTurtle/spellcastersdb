import { usePathname } from "next/navigation";

import { fireEvent, render, screen } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { GuideToc, MobileGuideToc } from "../GuideToc";

// Mock Next.js routing and navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

describe("Guide Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Desktop GuideToc ───────────────────────────────────────
  describe("Desktop GuideToc", () => {
    it("renders the desktop TOC with all sections", () => {
      (usePathname as Mock).mockReturnValue("/guide");
      render(<GuideToc />);

      expect(screen.getByText("Guide Sections")).toBeInTheDocument();
      expect(screen.getByText("Guide Hub")).toBeInTheDocument();
      expect(screen.getByText("Basics & Deck Building")).toBeInTheDocument();
      expect(screen.getByText("Mechanics & Progression")).toBeInTheDocument();
      expect(screen.getByText("Ranked Mode")).toBeInTheDocument();
      expect(screen.getByText("Class Upgrades")).toBeInTheDocument();
      expect(screen.getByText("Infusions Database")).toBeInTheDocument();
    });

    it("highlights the currently active route", () => {
      (usePathname as Mock).mockReturnValue("/guide/mechanics");
      render(<GuideToc />);

      const activeLink = screen.getByText("Mechanics & Progression");
      expect(activeLink).toHaveClass("border-brand-primary");

      const inactiveLink = screen.getByText("Guide Hub");
      expect(inactiveLink).not.toHaveClass("border-brand-primary");
    });
  });

  // ─── MobileGuideToc ────────────────────────────────────────
  describe("MobileGuideToc", () => {
    it("renders collapsed initially with the active section label", () => {
      (usePathname as Mock).mockReturnValue("/guide/upgrades");
      render(<MobileGuideToc />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveTextContent("Class Upgrades");

      const content = document.getElementById("mobile-toc-content");
      expect(content).toHaveClass("max-h-0");
    });

    it("expands when the toggle button is clicked and collapses on second click", () => {
      (usePathname as Mock).mockReturnValue("/guide");
      render(<MobileGuideToc />);

      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(document.getElementById("mobile-toc-content")).toHaveClass(
        "max-h-96"
      );

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(document.getElementById("mobile-toc-content")).toHaveClass(
        "max-h-0"
      );
    });

    it("auto-closes the accordion when a link is clicked", () => {
      (usePathname as Mock).mockReturnValue("/guide");
      render(<MobileGuideToc />);

      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      const link = screen.getByText("Ranked Mode");
      fireEvent.click(link);

      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });
});
