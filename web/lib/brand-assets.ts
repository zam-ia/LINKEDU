export type BrandAssetKind = "wordmark" | "icon" | "hero";

export type BrandAsset = {
  url: string;
  path: string;
  mimeType: string;
  originalName?: string;
  updatedAt: string;
};

export type BrandAssetsConfig = Partial<Record<BrandAssetKind, BrandAsset>>;

export const defaultBrandAssetUrls: Record<BrandAssetKind, string> = {
  wordmark: "/brand/doce-wordmark.png",
  icon: "/brand/doce-icon.svg",
  hero: "",
};
