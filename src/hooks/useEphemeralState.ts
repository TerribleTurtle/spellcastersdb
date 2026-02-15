
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * A hook to manage ephemeral state (like "Copied!" or "Saved!" messages) that automatically 
 * resets after a specified duration.
 * 
 * @param durationMs Duration in milliseconds before the state resets (default: 2000)
 * @returns [isActive, trigger, reset]
 */
export function useEphemeralState(durationMs: number = 2000) {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const trigger = useCallback(() => {
    setIsActive(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, durationMs);
  }, [durationMs]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    setIsActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isActive, trigger, reset };
}
