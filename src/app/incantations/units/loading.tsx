import { UnitArchiveSkeleton } from "@/components/skeletons/UnitArchiveSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 md:pt-28 p-4 md:p-8">
      <div className="max-w-page-grid mx-auto">
         {/* Reusing the same skeleton as Database/UnitArchive */}
        <UnitArchiveSkeleton />
      </div>
    </div>
  );
}
