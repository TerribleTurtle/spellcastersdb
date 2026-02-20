"use client";

import { EntityDisplayItem } from "@/components/entity-card/types";

import { InspectorContent } from "./InspectorContent";
import { InspectorEmptyState } from "./InspectorEmptyState";

export type InspectorItem = EntityDisplayItem;

interface CardInspectorProps {
  item: InspectorItem | null;
  onBack?: () => void;
  onClose?: () => void;
}

export function CardInspector({ item, onBack, onClose }: CardInspectorProps) {
  if (!item) {
    return <InspectorEmptyState />;
  }

  return <InspectorContent item={item} onBack={onBack} onClose={onClose} />;
}
