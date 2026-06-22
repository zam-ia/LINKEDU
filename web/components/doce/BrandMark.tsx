import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandMark({ compact = false, className = "", priority = false }: BrandMarkProps) {
  if (compact) {
    return (
      <Image
        src="/brand/doce-icon.svg"
        width={40}
        height={40}
        alt="Doce"
        priority={priority}
        className={`h-10 w-10 object-contain ${className}`}
      />
    );
  }

  return (
    <Image
      src="/brand/doce-wordmark.png"
      width={355}
      height={140}
      alt="Doce"
      priority={priority}
      className={`h-auto w-[112px] object-contain ${className}`}
    />
  );
}
