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
    <svg
      viewBox="0 0 355 118"
      role="img"
      aria-label="Doce"
      className={`h-auto w-[112px] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Doce</title>
      <text
        x="0"
        y="91"
        fill="#000"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="96"
        fontWeight="900"
        letterSpacing="-9"
      >
        d
      </text>
      <text
        x="14"
        y="87"
        fill="#ff2432"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="74"
        fontWeight="900"
        letterSpacing="-7"
      >
        d
      </text>
      <text
        x="78"
        y="91"
        fill="#000"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="96"
        fontWeight="900"
        letterSpacing="-8"
      >
        oce
      </text>
    </svg>
  );
}
