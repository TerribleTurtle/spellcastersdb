import { renderHook } from '@testing-library/react';
import { useTeamEditor } from '../useTeamEditor';
import { useDeckStore } from '@/store/index';

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies (none active)

// Mock useTeamBuilder to return a specific activeSlot
vi.mock('@/features/team-builder/hooks/useTeamBuilder', () => ({
  useTeamBuilder: vi.fn(() => ({
    activeSlot: 2, // Simulate deck 3 selected
    setActiveSlot: vi.fn(),
    teamName: 'Test Team',
    teamDecks: [{}, {}, {}],
  })),
}));

describe('useTeamEditor Drawer Focus', () => {
  beforeEach(() => {
    useDeckStore.setState({ 
      activeSlot: 2,
    });
    vi.clearAllMocks();
  });

  it('should match accordion state to activeSlot on mount', () => {
    // 1. Arrange & Act
    const { result } = renderHook(() => useTeamEditor());

    // 3. Assert
    // Expect index 2 to be true (expanded)
    expect(result.current.accordion.expandedState[2]).toBe(true);
    // Expect others to be false
    expect(result.current.accordion.expandedState[0]).toBe(false);
    expect(result.current.accordion.expandedState[1]).toBe(false);
  });
});
