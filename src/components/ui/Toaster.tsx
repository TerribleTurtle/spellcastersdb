"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, ToastType } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  destructive: <AlertCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  default: <Info className="w-5 h-5 text-gray-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-gray-900 border-green-500/20 text-green-100",
  error: "bg-gray-900 border-red-500/20 text-red-100",
  destructive: "bg-red-950 border-red-500/50 text-red-100",
  info: "bg-gray-900 border-blue-500/20 text-blue-100",
  default: "bg-gray-900 border-white/10 text-gray-100",
};

export function Toaster() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed top-16 right-4 left-4 md:left-auto md:top-4 md:right-4 z-[10000] flex flex-col gap-2 max-w-[420px] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all animate-in slide-in-from-right-full duration-300",
            styles[toast.type] || styles.default
          )}
          role="alert"
        >
          <div className="shrink-0 pt-0.5">
            {icons[toast.type as keyof typeof icons] || icons.default}
          </div>
          <div className="flex-1 text-sm font-medium leading-tight">
            {toast.message}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
