import { vi } from 'vitest';
import '@testing-library/react';

// Polyfill window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, // Default to mobile-first/false, but tests can override.
                      // Actually, let's make it smart enough to match "min-width" if we assume a large screen.
                      // For simplicity in JSDOM, false is usually safer unless we specifically test responsive hooks.
                      // But the User asked for specific fix for "xl:contents".
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Polyfill ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
