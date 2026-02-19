"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, ToastType } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-status-success-text" />,
  error: <AlertCircle className="w-5 h-5 text-status-danger-text" />,
  destructive: <AlertCircle className="w-5 h-5 text-status-danger-text" />,
  info: <Info className="w-5 h-5 text-status-info-text" />,
  default: <Info className="w-5 h-5 text-text-muted" />,
  warning: <AlertTriangle className="w-5 h-5 text-status-warning-text" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-surface-main border-status-success-border text-status-success-text",
  error: "bg-surface-main border-status-danger-border text-status-danger-text",
  destructive: "bg-status-danger-muted border-status-danger-border text-status-danger-text",
  info: "bg-surface-main border-status-info-border text-status-info-text",
  default: "bg-surface-main border-border-default text-text-primary",
};

export function Toaster() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed top-16 right-4 left-4 md:left-auto md:top-4 md:right-4 z-10000 flex flex-col gap-2 max-w-[420px] pointer-events-none">
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
            className="shrink-0 text-text-primary/50 hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
