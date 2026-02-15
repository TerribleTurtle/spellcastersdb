"use client";

import { useState, SyntheticEvent, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedCardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * A lightweight image component for high-frequency lists.
 * Bypasses next/image overhead in favor of raw <img> for better scroll performance.
 */
export const OptimizedCardImage = memo(function OptimizedCardImage({
  src,
  alt,
  className,
  onError,
  ...props
}: OptimizedCardImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Track previous src to trigger reset during render (avoids double-render effect)
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src as string);
    setHasError(false);
    setRetryCount(0);
  }

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imgSrc) {
        setHasError(true);
        return;
    }

    // Attempt Fallback Logic: Toggle Extension (same logic as GameImage but lighter)
    if (retryCount === 0) {
      if (imgSrc.endsWith(".png")) {
        setImgSrc(imgSrc.replace(/\.png$/, ".webp"));
        setRetryCount(1);
        return;
      } else if (imgSrc.endsWith(".webp")) {
        setImgSrc(imgSrc.replace(/\.webp$/, ".png"));
        setRetryCount(1);
        return;
      }
    }

    setHasError(true);
    if (onError) onError(e);
  };

  if (hasError) {
      // Fallback placeholder
      return (
          <div 
            className={cn(className, "bg-gray-800 flex items-center justify-center text-white/20")}
            role="img"
            aria-label="No image available"
          >
              <span className="text-[10px]">No Image</span>
          </div>
      );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img

        fetchPriority={props.fetchPriority}
        loading="lazy"
        {...props}
        src={imgSrc}
        alt={alt || ""}
        decoding="async"
        className={cn(className, "object-cover")}
        onError={handleError}
      />
    </>
  );
});
