import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  hasManuallyToggled: boolean; // Track if user has overridden auto-logic
}

export const useUIStore = create<SidebarState>()(
  persist(
    (set) => ({
      isSidebarOpen: true, // Default
      hasManuallyToggled: false,

      toggleSidebar: () =>
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
          hasManuallyToggled: true,
        })),

      setSidebarOpen: (open) =>
        set((state) => {
          // If we are setting it to what it already is, do nothing
          if (state.isSidebarOpen === open) return state;
          return { isSidebarOpen: open };
        }),
    }),
    {
      name: "ui-storage",
      // Only persist manual preference? Or strictly auto?
      // For now, let's PERSIST it so user preference sticks,
      // but we might override on first load if screen is small.
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        hasManuallyToggled: state.hasManuallyToggled,
      }),
    }
  )
);
