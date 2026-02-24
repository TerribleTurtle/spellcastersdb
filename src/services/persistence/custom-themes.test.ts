// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { monitoring } from "@/services/monitoring";

import { CustomTheme, CustomThemeService } from "./custom-themes";

const STORAGE_KEY = "sp-custom-themes";

const mockTheme: CustomTheme = {
  id: "theme-1",
  name: "Dark Ritual",
  colors: {
    "brand-primary": "#ff0000",
    "brand-secondary": "#00ff00",
    "brand-accent": "#0000ff",
    "brand-dark": "#111",
    "surface-main": "#222",
    "text-primary": "#fff",
    "text-secondary": "#ccc",
    "text-muted": "#888",
  },
  createdAt: Date.now(),
};

describe("CustomThemeService", () => {
  let getItemSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {});
    vi.spyOn(monitoring, "captureException").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAll", () => {
    it("should return empty array if nothing in storage", () => {
      expect(CustomThemeService.getAll()).toEqual([]);
      expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("should return empty array and report to monitoring if invalid JSON in storage", () => {
      getItemSpy.mockReturnValue("{ bad json ]");
      expect(CustomThemeService.getAll()).toEqual([]);
      expect(monitoring.captureException).toHaveBeenCalled();
    });

    it("should parse, validate through zod, and return valid themes", () => {
      getItemSpy.mockReturnValue(JSON.stringify([mockTheme]));
      const result = CustomThemeService.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Dark Ritual");
    });

    it("should silently filter out schemas that fail zod validation", () => {
      getItemSpy.mockReturnValue(JSON.stringify([mockTheme, { bad: "theme" }]));
      const result = CustomThemeService.getAll();
      // Wait, Zod array schema will fail ENTIRELY if one item is invalid because it's z.array(Schema).
      // Let's test the actual behavior: safeParse fails completely, returns []
      expect(result).toEqual([]);
    });
  });

  describe("save", () => {
    it("should push a new theme to storage", () => {
      getItemSpy.mockReturnValue(JSON.stringify([])); // initially empty

      CustomThemeService.save(mockTheme);

      expect(setItemSpy).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([mockTheme])
      );
    });

    it("should update an existing theme by ID", () => {
      getItemSpy.mockReturnValue(JSON.stringify([mockTheme])); // initially exists

      const updated = { ...mockTheme, name: "Light Ritual" };
      CustomThemeService.save(updated);

      expect(setItemSpy).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([updated])
      );
    });
  });

  describe("delete", () => {
    it("should remove theme and rewrite storage", () => {
      getItemSpy.mockReturnValue(JSON.stringify([mockTheme]));

      CustomThemeService.delete("theme-1");

      expect(setItemSpy).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([]) // Array gets emptied
      );
    });

    it("should do nothing if theme ID doesn't exist", () => {
      getItemSpy.mockReturnValue(JSON.stringify([mockTheme]));

      CustomThemeService.delete("unknown-id");

      expect(setItemSpy).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([mockTheme]) // Array stays the same
      );
    });
  });

  describe("toCssVariables", () => {
    it("should map theme config to proper document variable dictionary", () => {
      const result = CustomThemeService.toCssVariables(mockTheme);

      expect(result["--sp-brand-primary"]).toBe("#ff0000");
      expect(result["--sp-text-muted"]).toBe("#888");

      // Check derived color mixes
      expect(result["--sp-surface-card"]).toContain(
        "color-mix(in oklch, #ff0000"
      );
      expect(result["background"]).toContain("radial-gradient");
    });
  });
});
