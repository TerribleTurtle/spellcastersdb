import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuideToc, MobileGuideToc } from "../GuideToc";

// Track the last observer instance so we can fire its callback in tests
let lastObserverInstance: MockIntersectionObserver;
const observeMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastObserverInstance = this;
  }
  observe = observeMock;
  disconnect = disconnectMock;
}

// Mock pushState
const pushStateMock = vi.fn();

const ALL_SECTION_IDS = [
  "overview",
  "card-types",
  "ranks",
  "spellcasters",
  "charges-cooldowns",
  "deck-building",
  "infusions",
];

describe("Guide Table of Contents", () => {
  beforeEach(() => {
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    global.scrollTo = vi.fn();
    window.history.pushState = pushStateMock;

    document.body.innerHTML = ALL_SECTION_IDS.map(
      (id) => `<div id="${id}"></div>`
    ).join("");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  // ─── Desktop GuideToc ───────────────────────────────────────
  describe("Desktop GuideToc", () => {
    it("renders the desktop TOC with all sections", () => {
      render(<GuideToc />);

      expect(screen.getByText("On this page")).toBeInTheDocument();
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Deck Building")).toBeInTheDocument();
      expect(screen.getByText("Infusions")).toBeInTheDocument();

      expect(observeMock).toHaveBeenCalledTimes(7);
    });

    it("handles clicking a link with scroll lock", () => {
      vi.useFakeTimers();
      render(<GuideToc />);

      const deckBuildingLink = screen.getByText("Deck Building");
      fireEvent.click(deckBuildingLink);

      expect(global.scrollTo).toHaveBeenCalled();
      expect(pushStateMock).toHaveBeenCalledWith(null, "", "#deck-building");
      expect(deckBuildingLink).toHaveClass("font-medium");

      vi.runAllTimers();
      vi.useRealTimers();
    });

    it("all links have correct hash hrefs", () => {
      render(<GuideToc />);

      const links = screen.getByRole("navigation").querySelectorAll("a");
      expect(links).toHaveLength(7);

      links.forEach((link, i) => {
        expect(link.getAttribute("href")).toBe(`#${ALL_SECTION_IDS[i]}`);
      });
    });

    it("defaults to 'Overview' as the initially active section", () => {
      render(<GuideToc />);
      const overview = screen.getByText("Overview");
      expect(overview).toHaveClass("font-medium");
    });
  });

  // ─── Click Lock (adversarial) ───────────────────────────────
  describe("click lock behavior", () => {
    it("suppresses IntersectionObserver updates during lock period", () => {
      vi.useFakeTimers();
      render(<GuideToc />);

      // Click "Deck Building" → lock activates
      fireEvent.click(screen.getByText("Deck Building"));
      expect(screen.getByText("Deck Building")).toHaveClass("font-medium");

      // Simulate observer firing for "infusions" while lock is active
      act(() => {
        lastObserverInstance.callback(
          [
            {
              isIntersecting: true,
              target: document.getElementById("infusions")!,
            },
          ] as unknown as IntersectionObserverEntry[],
          lastObserverInstance as unknown as IntersectionObserver
        );
      });

      // "Deck Building" should STILL be active — observer was suppressed
      expect(screen.getByText("Deck Building")).toHaveClass("font-medium");
      expect(screen.getByText("Infusions")).not.toHaveClass("font-medium");

      vi.runAllTimers();
      vi.useRealTimers();
    });

    it("releases the lock after 1200ms and allows observer updates again", () => {
      vi.useFakeTimers();
      render(<GuideToc />);

      fireEvent.click(screen.getByText("Deck Building"));

      // Advance past lock period
      vi.advanceTimersByTime(1300);

      // Now simulate observer firing for "ranks"
      act(() => {
        lastObserverInstance.callback(
          [
            {
              isIntersecting: true,
              target: document.getElementById("ranks")!,
            },
          ] as unknown as IntersectionObserverEntry[],
          lastObserverInstance as unknown as IntersectionObserver
        );
      });

      // Ranks should now be active — lock has expired
      expect(screen.getByText("Ranks")).toHaveClass("font-medium");
      expect(screen.getByText("Deck Building")).not.toHaveClass("font-medium");

      vi.useRealTimers();
    });

    it("handles rapid-fire clicks without corrupting state", () => {
      vi.useFakeTimers();
      render(<GuideToc />);

      // Rapid fire: click 3 different links in fast succession
      fireEvent.click(screen.getByText("Ranks"));
      fireEvent.click(screen.getByText("Spellcasters"));
      fireEvent.click(screen.getByText("Overview"));

      // The LAST clicked item should be active
      expect(screen.getByText("Overview")).toHaveClass("font-medium");
      expect(screen.getByText("Ranks")).not.toHaveClass("font-medium");
      expect(screen.getByText("Spellcasters")).not.toHaveClass("font-medium");

      // scrollTo should have been called 3 times
      expect(global.scrollTo).toHaveBeenCalledTimes(3);

      vi.runAllTimers();
      vi.useRealTimers();
    });
  });

  // ─── Resilience (adversarial) ───────────────────────────────
  describe("resilience", () => {
    it("gracefully handles missing DOM sections without crashing", () => {
      // Remove some sections from the DOM
      document.getElementById("ranks")?.remove();
      document.getElementById("infusions")?.remove();

      // Reset observe mock to avoid accumulation from prior tests
      observeMock.mockClear();

      // Should render without throwing
      expect(() => render(<GuideToc />)).not.toThrow();

      // Only 5 sections should be observed (not 7)
      expect(observeMock).toHaveBeenCalledTimes(5);
    });

    it("cleans up observer and scroll listener on unmount", () => {
      const removeEventSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(<GuideToc />);

      unmount();

      expect(disconnectMock).toHaveBeenCalled();
      expect(removeEventSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function)
      );
    });
  });

  // ─── MobileGuideToc ────────────────────────────────────────
  describe("MobileGuideToc", () => {
    it("renders the mobile TOC in a collapsed state initially", () => {
      render(<MobileGuideToc />);

      const button = screen.getByRole("button", { name: /table of contents/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "false");

      const content = document.getElementById("mobile-toc-content");
      expect(content).toHaveClass("max-h-0");
    });

    it("expands and collapses when the toggle button is clicked", () => {
      render(<MobileGuideToc />);

      const button = screen.getByRole("button", { name: /table of contents/i });

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

    it("scrolls to section and auto-closes when a link is clicked", () => {
      render(<MobileGuideToc />);

      const button = screen.getByRole("button", { name: /table of contents/i });
      fireEvent.click(button);

      const link = screen.getByText("Infusions");
      fireEvent.click(link);

      expect(global.scrollTo).toHaveBeenCalled();
      expect(pushStateMock).toHaveBeenCalledWith(null, "", "#infusions");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("double-toggle returns to collapsed state", () => {
      render(<MobileGuideToc />);

      const button = screen.getByRole("button", { name: /table of contents/i });

      fireEvent.click(button); // open
      fireEvent.click(button); // close

      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(document.getElementById("mobile-toc-content")).toHaveClass(
        "max-h-0"
      );
    });

    it("every mobile link triggers scroll without errors", () => {
      render(<MobileGuideToc />);

      const button = screen.getByRole("button", { name: /table of contents/i });

      ALL_SECTION_IDS.forEach((id) => {
        // Re-open accordion each time (it auto-closes)
        fireEvent.click(button);
        const label =
          id === "card-types"
            ? "Card Types"
            : id === "charges-cooldowns"
              ? "Charges & Cooldowns"
              : id === "deck-building"
                ? "Deck Building"
                : id.charAt(0).toUpperCase() + id.slice(1);

        fireEvent.click(screen.getByText(label));
      });

      // scrollTo should have been called 7 times (once per section)
      expect(global.scrollTo).toHaveBeenCalledTimes(7);
    });
  });
});
