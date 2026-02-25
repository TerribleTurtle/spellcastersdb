import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useShareErrorHandler } from "../useShareErrorHandler";

// --- Mocks ---
const mockShowToast = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/deck-builder",
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe("useShareErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("does nothing when no error param is present", () => {
    renderHook(() => useShareErrorHandler());

    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("shows correct message for 'link-expired' and strips param from URL", () => {
    mockSearchParams = new URLSearchParams("error=link-expired");

    renderHook(() => useShareErrorHandler());

    expect(mockShowToast).toHaveBeenCalledWith(
      "This short link has expired or doesn't exist.",
      "error"
    );
    expect(mockReplace).toHaveBeenCalledWith("/deck-builder", {
      scroll: false,
    });
  });

  it("shows correct message for 'redis-offline'", () => {
    mockSearchParams = new URLSearchParams("error=redis-offline");

    renderHook(() => useShareErrorHandler());

    expect(mockShowToast).toHaveBeenCalledWith(
      "The short link service is temporarily unavailable.",
      "error"
    );
  });

  it("shows a generic fallback message for unmapped error codes", () => {
    mockSearchParams = new URLSearchParams("error=some-unknown-code");

    renderHook(() => useShareErrorHandler());

    expect(mockShowToast).toHaveBeenCalledWith(
      "An error occurred with the share link.",
      "error"
    );
    expect(mockReplace).toHaveBeenCalledWith("/deck-builder", {
      scroll: false,
    });
  });

  it("preserves other query params when stripping the error param", () => {
    mockSearchParams = new URLSearchParams("d=abc123&error=invalid-link");

    renderHook(() => useShareErrorHandler());

    expect(mockShowToast).toHaveBeenCalledWith(
      "This link appears to be invalid.",
      "error"
    );
    // Should keep `d=abc123` but remove `error`
    expect(mockReplace).toHaveBeenCalledWith("/deck-builder?d=abc123", {
      scroll: false,
    });
  });
});
