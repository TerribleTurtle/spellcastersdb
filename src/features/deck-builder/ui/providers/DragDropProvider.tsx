import { ReactNode, memo } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import { useDragDrop } from "@/features/deck-builder/hooks/domain/useDragDrop";
import { useScrollLock } from "@/features/deck-builder/hooks/ui/useScrollLock";
import { DragOverlayContainer } from "./DragOverlayContainer";
import { useDeckStore } from "@/store/index";

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider = memo(function DragDropProvider({ children }: DragDropProviderProps) {
  // Only subscribe to handlers, NOT activeDragItem
  const { sensors, handleDragStart, handleDragEnd } = useDragDrop();
  
  // Mobile Scroll Lock - needs to know if dragging, but we can get that from store if needed
  // Or better, let useScrollLock handle its own subscription if it doesn't already.
  // Checking useScrollLock implementation... it takes a boolean.
  // We can subscribe deeply here just for the lock, OR move lock to container.
  // For now, let's subscribe to *just* presence of drag item for lock, but ensure we don't re-render children.
  // Actually, DndContext re-renders when props change. handleDragStart creates new closures? 
  // usage of useDragDrop suggests they are stable (useCallback).
  
  const isDragging = useDeckStore(state => !!state.activeDragItem);
  useScrollLock(isDragging);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={false}
    >
      {/* Children are passed through. If this component re-renders (due to isDragging), 
          React normally drills down. But since children prop is stable from parent, 
          wrapping this component in memo should help, OR ensuring we don't pass changing props to children.
          DndContext consumes children.
      */}
      {children}
      <DragOverlayContainer />
    </DndContext>
  );
});
