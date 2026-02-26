import { PageSkeleton } from "@/features/deck-builder/ui/root/PageSkeleton";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden z-40 bg-surface-main shadow-2xl">
      <PageSkeleton />
    </div>
  );
}
