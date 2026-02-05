import Image from "next/image";
import { useState } from "react";
import { UnifiedEntity } from "@/types/api";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface EntityImageProps {
  entity: UnifiedEntity;
  className?: string;
  alt?: string;
}

export function EntityImage({ entity, className, alt }: EntityImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If image_required is explicitly false, or if we've already detected an error
  // show the placeholder.
  const showPlaceholder = error || entity.image_required === false;

  const getImageUrl = (entity: UnifiedEntity) => {
    // Derive asset base URL from API URL environment variable
    // Remove /api/v1 suffix and append /assets
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://terribleturtle.github.io/spellcasters-community-api/api/v1";
    const assetBase = apiUrl.replace(/\/api\/v1$/, "/assets");

    let folder = "units";
    if ("hero_id" in entity) folder = "heroes";
    if ("consumable_id" in entity) folder = "consumables";

    const id = "hero_id" in entity ? entity.hero_id : 
               "consumable_id" in entity ? entity.consumable_id : 
               entity.entity_id;

    return `${assetBase}/${folder}/${id}_card.png`;
  };

  if (showPlaceholder) {
    return (
      <div className={cn("flex items-center justify-center bg-white/5 border border-white/10 rounded-lg", className)}>
        <ImageOff className="w-1/3 h-1/3 text-white/20" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface-card rounded-lg", className)}>
      <Image
        src={getImageUrl(entity)}
        alt={alt || entity.name}
        fill
        className={cn(
          "object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      
      {/* Loading Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
    </div>
  );
}
