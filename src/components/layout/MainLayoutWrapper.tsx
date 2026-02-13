"use client";

import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

export function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <main 
      className={cn(
        "grow w-full px-0 flex flex-col transition-[padding] duration-300 ease-in-out",
        // Mobile: No padding (Sidebar hidden/drawer)
        // Desktop: Padding dependent on state
        "md:pl-0", // Reset base
        isSidebarOpen ? "md:pl-64" : "md:pl-16"
      )}
    >
      <div className="w-full mx-auto px-0 md:px-4 sm:px-6 lg:px-8 flex flex-col grow">
        {children}
      </div>
    </main>
  );
}
