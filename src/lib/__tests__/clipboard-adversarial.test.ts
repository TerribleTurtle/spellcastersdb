import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard } from "../clipboard";

describe("copyToClipboard — Adversarial", () => {
  let mockWriteText: any;
  let mockExecCommand: any;

  beforeEach(() => {
    mockWriteText = vi.fn();
    mockExecCommand = vi.fn().mockReturnValue(true);

    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    document.execCommand = document.execCommand || vi.fn();
    vi.spyOn(document, "execCommand").mockImplementation(mockExecCommand);
    vi.spyOn(HTMLTextAreaElement.prototype, "focus").mockImplementation(
      vi.fn()
    );
    vi.spyOn(HTMLTextAreaElement.prototype, "select").mockImplementation(
      vi.fn()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Empty String ──────────────────────────────────────────────────
  it("should copy an empty string without crashing", async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard("");
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith("");
  });

  // ─── XSS / HTML Payloads ──────────────────────────────────────────
  it("should copy HTML/XSS payloads as plain text", async () => {
    const xss = "<img src=x onerror=alert(1)>";
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard(xss);
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(xss);
  });

  // ─── Unicode / Emoji ──────────────────────────────────────────────
  it("should copy emoji text correctly", async () => {
    const emoji = "🔥🎮✨ deck url: /deck/123";
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard(emoji);
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(emoji);
  });

  it("should copy multi-byte unicode characters", async () => {
    const unicode = "日本語テスト 🇯🇵";
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard(unicode);
    expect(result).toBe(true);
  });

  // ─── Very Long String ─────────────────────────────────────────────
  it("should handle a 100KB string without crashing", async () => {
    const huge = "X".repeat(100_000);
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard(huge);
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(huge);
  });

  // ─── Multiline / Newlines ──────────────────────────────────────────
  it("should copy multiline text with various newline styles", async () => {
    const multiline = "line1\nline2\r\nline3\rline4";
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard(multiline);
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(multiline);
  });

  // ─── Null bytes / Control Characters ──────────────────────────────
  it("should handle null bytes embedded in the string", async () => {
    const nullByte = "before\x00after";
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyToClipboard(nullByte);
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(nullByte);
  });

  // ─── Fallback: execCommand returns false ──────────────────────────
  it("should return false when fallback execCommand returns false", async () => {
    // Modern API fails
    mockWriteText.mockRejectedValueOnce(new Error("denied"));
    // Fallback returns false (copy failed)
    mockExecCommand.mockReturnValueOnce(false);

    const result = await copyToClipboard("test");
    expect(result).toBe(false);
  });

  // ─── Fallback: textarea cleanup after failure ─────────────────────
  it("should clean up the textarea even if execCommand throws", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("denied"));
    mockExecCommand.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const childCountBefore = document.body.childNodes.length;
    await copyToClipboard("test");
    // The textarea should NOT be left in the DOM
    // (it's in the try block, and the catch doesn't remove it —
    // this is actually a potential bug!)
    const childCountAfter = document.body.childNodes.length;

    // If this assertion passes, there's no leaked textarea.
    // If it fails, we found a real DOM leak bug.
    expect(childCountAfter).toBeLessThanOrEqual(childCountBefore);
  });

  // ─── Concurrent Copies ────────────────────────────────────────────
  it("should handle multiple concurrent copy calls", async () => {
    mockWriteText.mockResolvedValue(undefined);

    const results = await Promise.all([
      copyToClipboard("copy1"),
      copyToClipboard("copy2"),
      copyToClipboard("copy3"),
    ]);

    expect(results).toEqual([true, true, true]);
    expect(mockWriteText).toHaveBeenCalledTimes(3);
  });
});
