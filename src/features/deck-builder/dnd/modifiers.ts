import { Modifier } from "@dnd-kit/core";

// Modifier to center the overlay under the cursor
export const centerUnderCursor: Modifier = ({
  transform,
  activeNodeRect,
  draggingNodeRect,
  activatorEvent,
}) => {
  if (!activeNodeRect || !draggingNodeRect || !activatorEvent) {
    return transform;
  }

  const activatorE = activatorEvent as MouseEvent | TouchEvent;

  // Extract cursor coordinates
  const clientX =
    "touches" in activatorE
      ? activatorE.touches[0].clientX
      : (activatorE as MouseEvent).clientX;
  const clientY =
    "touches" in activatorE
      ? activatorE.touches[0].clientY
      : (activatorE as MouseEvent).clientY;

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
