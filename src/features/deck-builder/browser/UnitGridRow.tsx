import React from "react";

import { DraggableCard } from "@/features/shared/deck/ui/DraggableCard";
import { BrowserItem, ItemUsageState } from "@/types/browser";

interface UnitGridRowProps {
  items: BrowserItem[];
  columns: number;
  onSelectItem: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => void;
  priority?: boolean;
  itemStates?: Map<string, ItemUsageState>;
}

export const UnitGridRow = React.memo(function UnitGridRow({
  items,
  columns,
  onSelectItem,
  onQuickAdd,
  priority = false,
  itemStates,
}: UnitGridRowProps) {
  return (
    <div
      className="px-2 lg:px-4 py-1 grid gap-2 max-w-[1920px] mx-auto"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item) => {
        const state = itemStates?.get(item.entity_id);
        return (
          <DraggableCard
            key={item.entity_id}
            item={item}
            onClick={onSelectItem}
            onQuickAdd={onQuickAdd}
            priority={priority}
            isDimmed={state?.isActive}
            otherDeckIndices={state?.memberOfDecks}
          />
        );
      })}
    </div>
  );
});
