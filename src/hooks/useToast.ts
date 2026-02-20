import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "destructive"
  | "default";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message, type = "default") => {
    const id = uuidv4();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const { showToast, toasts, dismissToast } = useToastStore();
  return { showToast, toasts, dismissToast };
}
