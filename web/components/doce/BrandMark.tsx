"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { defaultBrandAssetUrls, type BrandAssetKind } from "@/lib/brand-assets";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function useBrandAsset(kind: BrandAssetKind) {
  const [source, setSource] = useState(defaultBrandAssetUrls[kind]);
  useEffect(() => {
    let active = true;
    fetch("/api/brand-assets")
      .then((response) => response.json())
      .then((payload) => { if (active && payload.assets?.[kind]?.url) setSource(payload.assets[kind].url); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [kind]);
  return source;
}

export function BrandMark({ compact = false, className = "", priority = false }: BrandMarkProps) {
  const kind: BrandAssetKind = compact ? "icon" : "wordmark";
  const source = useBrandAsset(kind);

  if (compact) {
    return (
      <Image
        src={source}
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
      src={source}
      width={355}
      height={140}
      alt="Doce"
      priority={priority}
      className={`h-auto w-[112px] object-contain ${className}`}
    />
  );
}
