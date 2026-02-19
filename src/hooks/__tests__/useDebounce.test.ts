
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce("initial", 500));
        expect(result.current).toBe("initial");
    });

    it('should update value after delay', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 }
        });

        // Update value
        rerender({ value: "updated", delay: 500 });
        
        // Still initial because delay hasn't passed
        expect(result.current).toBe("initial");

        // Fast forward
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe("updated");
    });

    it('should cancel previous timer on rapid updates', () => {
       const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 }
        });

        rerender({ value: "update1", delay: 500 });
        
        act(() => {
            vi.advanceTimersByTime(200); // Not enough time
        });
        expect(result.current).toBe("initial");

        rerender({ value: "update2", delay: 500 }); // Retrigger
        
        act(() => {
            vi.advanceTimersByTime(300); // 300 more ms (total 500 from start, but reset happened)
        });
        
        // Should still be initial because timer reset at update2
        expect(result.current).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(200); // Reach 500 for update2
        });

        expect(result.current).toBe("update2");
    });
});
