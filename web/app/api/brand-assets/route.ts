import { NextResponse } from "next/server";
import { defaultBrandAssetUrls, type BrandAssetsConfig } from "@/lib/brand-assets";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return NextResponse.json({ assets: {}, defaults: defaultBrandAssetUrls });

  try {
    const response = await fetch(`${baseUrl}/storage/v1/object/public/brand-assets/platform/config.json`, { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ assets: {}, defaults: defaultBrandAssetUrls });
    const assets = await response.json() as BrandAssetsConfig;
    return NextResponse.json({ assets, defaults: defaultBrandAssetUrls });
  } catch {
    return NextResponse.json({ assets: {}, defaults: defaultBrandAssetUrls });
  }
}
