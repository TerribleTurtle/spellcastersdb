import Image from "next/image";

interface KnowledgeIconProps {
  className?: string;
  size?: number;
}

export function KnowledgeIcon({ className, size = 18 }: KnowledgeIconProps) {
  // Multiply the incoming size to make the WebP asset visually match the
  // SVG bounding boxes of lucide-icons, as requested by the user.
  const visualSize = Math.round(size * 1.5);

  return (
    <Image
      src="https://terribleturtle.github.io/spellcasters-community-api/assets/currencies/knowledge.webp"
      alt="Knowledge Cost"
      width={visualSize}
      height={visualSize}
      className={className}
      unoptimized
    />
  );
}
