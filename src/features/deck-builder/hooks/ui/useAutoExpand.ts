import { useEffect, useRef } from "react";

/**
 * Hook to trigger an action after a draggable item hovers over a component for a specified duration.
 * 
 * @param isOver - Boolean indicating if a valid drag item is currently hovering.
 * @param onExpand - Callback to execute when the hover duration is met.
 * @param delay - Time in ms to wait before triggering (default 500ms).
 */
export function useAutoExpand(isOver: boolean, onExpand: () => void, delay: number = 500) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        if (isOver) {
            if (!hasTriggeredRef.current) {
                // Start timer
                timeoutRef.current = setTimeout(() => {
                    onExpand();
                    hasTriggeredRef.current = true;
                }, delay);
            }
        } else {
            // Cancel timer
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            hasTriggeredRef.current = false;
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isOver, delay, onExpand]);
}
