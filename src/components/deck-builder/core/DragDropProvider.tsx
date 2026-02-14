"use client";

import { ReactNode } from "react";
import { DndContext, DragOverlay, Modifier, pointerWithin, useDndMonitor, rectIntersection } from "@dnd-kit/core";
import { useDragDrop } from "@/features/deck-builder/hooks/domain/useDragDrop";
import { GameImage } from "@/components/ui/GameImage";
import { getCardImageUrl } from "@/services/assets/asset-helpers";

// Modifier to center the overlay under the cursor
const centerUnderCursor: Modifier = ({ transform, activeNodeRect, draggingNodeRect, activatorEvent }) => {
  if (!activeNodeRect || !draggingNodeRect || !activatorEvent) {
    return transform;
  }

  const activatorE = activatorEvent as MouseEvent | TouchEvent;
  
  // Extract cursor coordinates
  const clientX = 'touches' in activatorE ? activatorE.touches[0].clientX : (activatorE as MouseEvent).clientX;
  const clientY = 'touches' in activatorE ? activatorE.touches[0].clientY : (activatorE as MouseEvent).clientY;

  if (clientX === undefined || clientY === undefined) return transform;

  // Calculate the shift needed to center the dragging node (overlay) under the cursor
  // Currently, the overlay is positioned at: activeNodeRect.left + transform.x
  // We want the center (activeNodeRect.left + width/2) to be at clientX.
  // So we need to shift by: clientX - (activeNodeRect.left + width/2)
  
  // However, the transform is applied to the initial position (activeNodeRect).
  // TargetX = clientX - draggingNodeRect.width / 2;
  // DeltaX = TargetX - activeNodeRect.left;
  
  const width = draggingNodeRect.width;
  const height = draggingNodeRect.height;
  
  const targetX = clientX - width / 2;
  const targetY = clientY - height / 2;
  
  const deltaX = targetX - activeNodeRect.left;
  const deltaY = targetY - activeNodeRect.top;

  return {
    ...transform,
    x: deltaX + transform.x,
    y: deltaY + transform.y,
  };
};

interface DragDropProviderProps {
  children: ReactNode;
}

// Internal component to consume DndContext


export function DragDropProvider({ children }: DragDropProviderProps) {
  const { sensors, activeDragItem, handleDragStart, handleDragEnd } = useDragDrop();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={false}
    >

      {children}

      <DragOverlay zIndex={100} dropAnimation={null} modifiers={[centerUnderCursor]}>
        {activeDragItem ? (
          <div className="w-[110px] aspect-3/4 rounded-lg border-2 border-brand-secondary/50 bg-slate-800 flex flex-col overflow-hidden shadow-2xl relative cursor-grabbing pointer-events-none">
             {/* Image Area */}
            <div className="relative flex-1 overflow-hidden">
              <GameImage
                src={getCardImageUrl(activeDragItem)}
                alt={activeDragItem.name || "Card Image"}
                fill
                className="object-cover object-top opacity-90"
              />
            </div>
            {/* Name Banner */}
            <div className="min-h-[24px] bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 py-0.5 shrink-0">
               <span className="text-[10px] font-bold text-gray-200 text-center leading-tight line-clamp-2">
                 {activeDragItem.name}
               </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
