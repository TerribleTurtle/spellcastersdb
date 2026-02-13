import React from "react";
import { BrowserItem } from "@/types/browser";
import { DraggableCard } from "../../shared/ui/DraggableCard";

interface UnitGridRowProps {
  items: BrowserItem[];
  columns: number;
  onSelectItem: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => void;
}

export const UnitGridRow = React.memo(function UnitGridRow({
  items,
  columns,
  onSelectItem,
  onQuickAdd,
}: UnitGridRowProps) {
  return (
    <div
      className="px-4 py-1 grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item) => (
        <DraggableCard
          key={item.entity_id}
          item={item}
          onClick={onSelectItem}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
});
