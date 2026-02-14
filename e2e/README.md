# E2E Testing Strategy

> **CRITICAL RULE:** Do NOT attempt to implement "Drag and Drop" tests without explicit user instruction.
> **CRITICAL RULE:** Do NOT implement Mobile tests yet. Focus on **Desktop** coverage first.

## Current Status

- **Sanity Checks**: ✅ Running on Desktop.
- **Mobile**: ⏸️ PAUSED.
- **Complex Interactions**: 🛑 DEFERRED.

## Why?

We have established that `dnd-kit` is difficult to test reliably with Playwright in this specific environment (React 19 + Hydration).

## Allowed Scope

- Navigation tests.
- Static visibility checks.
- Simple clicks/taps.
- **NO** complex gestures or drag simulations.
