"use client";

import { useState, memo } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { getCardAltText } from "@/services/assets/asset-helpers";
import { UnifiedEntity } from "@/types/api";

interface OptimizedCardImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt?: string;
  entity?: UnifiedEntity; // Optional: Pass entity to auto-generate alt
  className?: string;
  priority?: boolean;
  quality?: number;
}

/**
 * A lightweight wrapper around next/image for card displays.
 * Re-enabled next/image to leverage Vercel's Edge Global Cache (1 Year TTL).
 */
export const OptimizedCardImage = memo(function OptimizedCardImage({
  src,
  alt,
  entity,
  className,
  priority = false,
  quality = 45,
  ...props
}: OptimizedCardImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Track previous src to trigger reset during render
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src);
    setHasError(false);
    setRetryCount(0);
  }

  const handleError = () => {
    if (!imgSrc) {
        setHasError(true);
        return;
    }

    // Toggle Extension Fallback
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
  };

  if (hasError) {
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

  // Remote images (GitHub Pages) are already WebP-optimized.
  // Bypass Vercel's optimizer to avoid intermittent 400 errors.
  const isRemote = imgSrc.startsWith("http");

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={imgSrc}
        alt={alt || (entity ? getCardAltText(entity) : "")}
        fill
        sizes="(max-width: 768px) 33vw, 200px"
        priority={priority}
        quality={quality}
        className="object-cover"
        onError={handleError}
        unoptimized={isRemote}
        {...props}
      />
    </div>
  );
});
