"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface InspectorActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isSelected?: boolean;
}

export function InspectorActionButton({
    isSelected,
    className,
    children,
    disabled,
    ...props
}: InspectorActionButtonProps) {
    return (
        <button
            disabled={disabled || isSelected} 
            className={cn(
                "rounded transition-all duration-200 border",
                isSelected
                    ? "bg-white/10 border-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-white/5 hover:bg-brand-secondary/50 border-white/10 hover:border-brand-secondary text-white",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
