// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { Team } from "@/types/deck";

import { downloadTeamJson } from "../export-service";

describe("export-service", () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let createElementSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.fn>;
  let removeChildSpy: ReturnType<typeof vi.fn>;
  let dummyAnchor: HTMLAnchorElement;

  beforeEach(() => {
    // 1. Mock URL object methods
    createObjectURLSpy = vi.fn().mockReturnValue("blob:test-url");
    revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL =
      createObjectURLSpy as typeof URL.createObjectURL;
    global.URL.revokeObjectURL =
      revokeObjectURLSpy as typeof URL.revokeObjectURL;

    // 2. Mock document object creation and interactions
    dummyAnchor = {
      href: "",
      download: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag) => {
        if (tag === "a") return dummyAnchor;
        return document.createElement(tag); // fallback
      });

    appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => dummyAnchor);
    removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation(() => dummyAnchor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadTeamJson", () => {
    const mockDecks: Team["decks"] = [INITIAL_DECK, INITIAL_DECK, INITIAL_DECK];

    it("should sanitize the filename to lowercase with hyphens instead of spaces and special chars", () => {
      downloadTeamJson(mockDecks, "My Awesome Team!");

      // The sanitization is a strict regex followed by lowercase and spacing replacements
      expect(dummyAnchor.download).toBe("my-awesome-team.json");
    });

    it("should handle empty filenames by defaulting to 'untitled-team.json'", () => {
      downloadTeamJson(mockDecks, "");

      expect(dummyAnchor.download).toBe("untitled-team.json");
    });

    it("should serialize data and construct a Blob", () => {
      // Use fake timers to lock down new Date()
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));

      downloadTeamJson(mockDecks, "test");

      // Check createObjectURL was called
      expect(createObjectURLSpy).toHaveBeenCalled();
      const blobArg = createObjectURLSpy.mock.calls[0][0];

      // Verify it's a blob-like object
      expect(blobArg.size).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it("should trigger a click on the dynamically created anchor", () => {
      downloadTeamJson(mockDecks, "test");

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(dummyAnchor.href).toBe("blob:test-url");
      expect(dummyAnchor.click).toHaveBeenCalled();
    });

    it("should append and immediately remove the anchor from the DOM", () => {
      downloadTeamJson(mockDecks, "test");

      expect(appendChildSpy).toHaveBeenCalledWith(dummyAnchor);
      expect(removeChildSpy).toHaveBeenCalledWith(dummyAnchor);
    });

    it("should revoke the local auto-generated URL to prevent memory leaks", () => {
      downloadTeamJson(mockDecks, "test");

      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:test-url");
    });
  });
});
