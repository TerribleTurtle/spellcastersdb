"use client";

import { MessageSquare } from "lucide-react";

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: any) => void;
    };
  }
}

interface FeedbackButtonProps {
  variant?: "fab" | "icon";
  className?: string;
}

export function FeedbackButton({ variant = "fab", className = "" }: FeedbackButtonProps) {
  const openFeedback = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    
    if (typeof window !== "undefined" && window.Tally) {
      window.Tally.openPopup("Bz7MdK", {
        layout: "modal",
        width: 700,
        emoji: {
          text: "👋",
          animation: "wave",
        },
        hiddenFields: {
          deck_url: currentUrl,
        },
      });
    } else {
      // Fallback if script hasn't loaded yet or fails
      window.open(`https://tally.so/r/Bz7MdK?deck_url=${encodeURIComponent(currentUrl)}`, "_blank");
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={openFeedback}
        className={`text-slate-400 hover:text-brand-accent hover:bg-white/5 p-2 rounded-md transition-colors flex items-center justify-center ${className}`}
        aria-label="Give Feedback"
        title="Give Feedback"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={openFeedback}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 font-medium ${className}`}
      aria-label="Give Feedback"
    >
      <MessageSquare size={20} />
      <span>Feedback</span>
    </button>
  );
}
