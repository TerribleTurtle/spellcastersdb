import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard } from "../clipboard";

describe("clipboard utils", () => {
  let mockWriteText: any;
  let mockExecCommand: any;
  let mockFocus: any;
  let mockSelect: any;

  beforeEach(() => {
    mockWriteText = vi.fn();
    mockExecCommand = vi.fn();
    mockFocus = vi.fn();
    mockSelect = vi.fn();

    // Stub navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    // JSDOM doesn't implement document.execCommand by default
    document.execCommand = document.execCommand || vi.fn();
    // Spy on document.execCommand
    vi.spyOn(document, "execCommand").mockImplementation(mockExecCommand);

    // Mock HTMLTextAreaElement methods
    vi.spyOn(HTMLTextAreaElement.prototype, "focus").mockImplementation(
      mockFocus
    );
    vi.spyOn(HTMLTextAreaElement.prototype, "select").mockImplementation(
      mockSelect
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("copyToClipboard", () => {
    it("should use navigator.clipboard.writeText if available and successful", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);

      const result = await copyToClipboard("test modern copy");

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith("test modern copy");
      expect(mockExecCommand).not.toHaveBeenCalled();
    });

    it("should fallback to execCommand if navigator.clipboard.writeText fails", async () => {
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard API failed"));
      mockExecCommand.mockReturnValueOnce(true);

      const result = await copyToClipboard("test fallback copy");

      // It should try modern first, fail, and succeed with fallback
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockExecCommand).toHaveBeenCalledWith("copy");
      expect(mockFocus).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledTimes(1);
    });

    it("should fallback to execCommand if navigator.clipboard is not available", async () => {
      // Temporarily remove clipboard API
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });

      mockExecCommand.mockReturnValueOnce(true);

      const result = await copyToClipboard("test no api copy");

      expect(result).toBe(true);
      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith("copy");
    });

    it("should return false if both methods fail", async () => {
      // Modern API fails
      mockWriteText.mockRejectedValueOnce(new Error("Modern failed"));

      // Fallback API throws an exception (e.g., execCommand throws)
      mockExecCommand.mockImplementationOnce(() => {
        throw new Error("Fallback failed");
      });

      const result = await copyToClipboard("test total failure");

      expect(result).toBe(false);
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockExecCommand).toHaveBeenCalledTimes(1);
    });
  });
});
