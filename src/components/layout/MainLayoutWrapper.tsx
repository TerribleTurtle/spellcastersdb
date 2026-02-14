"use client";


import { cn } from "@/lib/utils";

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

export function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {


  return (
    <main 
      className={cn(
        "grow w-full px-0 flex flex-col transition-[padding] duration-300 ease-in-out"
      )}
    >
      <div className="w-full mx-auto flex flex-col grow">
        {children}
      </div>
    </main>
  );
}
