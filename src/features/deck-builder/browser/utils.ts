import { GroupedContent } from "@/services/domain/sorting";
import { VirtualRow } from "@/types/browser";

export function prepareVirtualizationRows(
  groupedContent: GroupedContent[] | null,
  columns: number,
  collapsedSections?: Set<string>
): VirtualRow[] {
  if (!groupedContent) return [];

  const rows: VirtualRow[] = [];

  groupedContent.forEach((group) => {
    const isCollapsed = collapsedSections?.has(group.title);

    // Header
    rows.push({
      type: "header",
      title: group.title,
      count: group.items.length,
      isCollapsed,
    });

    // Skip items if collapsed
    if (isCollapsed) return;

    // Chunk Items into Rows
    for (let i = 0; i < group.items.length; i += columns) {
      rows.push({
        type: "row",
        items: group.items.slice(i, i + columns),
        startIndex: i,
      });
    }
  });

  return rows;
}
