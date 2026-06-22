import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { BrandAsset, BrandAssetKind, BrandAssetsConfig } from "@/lib/brand-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bucket = "brand-assets";
const allowedKinds = new Set<BrandAssetKind>(["wordmark", "icon", "hero"]);
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/svg+xml", "svg"],
]);

function clients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishable || !serviceRole) return null;
  return {
    url,
    auth: createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } }),
    admin: createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } }),
  };
}

async function authorize(request: NextRequest) {
  const configured = clients();
  if (!configured) return { error: NextResponse.json({ error: "Supabase no está configurado en el servidor." }, { status: 503 }) };
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Sesión requerida." }, { status: 401 }) };
  const { data, error } = await configured.auth.auth.getUser(token);
  if (error || !data.user) return { error: NextResponse.json({ error: "Sesión inválida." }, { status: 401 }) };
  const { data: profile } = await configured.admin.from("usuarios").select("rol, activo").eq("id", data.user.id).single();
  if (!profile?.activo || profile.rol !== "superadmin") return { error: NextResponse.json({ error: "Solo Super Admin puede administrar la marca." }, { status: 403 }) };
  return { ...configured, user: data.user };
}

async function ensureBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.getBucket(bucket);
  if (!data) {
    const { error } = await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: 8 * 1024 * 1024, allowedMimeTypes: [...allowedTypes.keys(), "application/json"] });
    if (error && !error.message.toLowerCase().includes("already exists")) throw error;
  }
}

async function readConfig(admin: SupabaseClient): Promise<BrandAssetsConfig> {
  const { data } = await admin.storage.from(bucket).download("platform/config.json");
  if (!data) return {};
  try { return JSON.parse(await data.text()) as BrandAssetsConfig; } catch { return {}; }
}

async function writeConfig(admin: SupabaseClient, config: BrandAssetsConfig) {
  const body = new TextEncoder().encode(JSON.stringify(config, null, 2));
  const { error } = await admin.storage.from(bucket).upload("platform/config.json", body, { contentType: "application/json", upsert: true, cacheControl: "60" });
  if (error) throw error;
}

export async function GET(request: NextRequest) {
  const authorized = await authorize(request);
  if ("error" in authorized) return authorized.error;
  await ensureBucket(authorized.admin);
  return NextResponse.json({ assets: await readConfig(authorized.admin), project: new URL(authorized.url).hostname });
}

export async function POST(request: NextRequest) {
  const authorized = await authorize(request);
  if ("error" in authorized) return authorized.error;
  const form = await request.formData();
  const kind = form.get("kind") as BrandAssetKind | null;
  const file = form.get("file");
  if (!kind || !allowedKinds.has(kind) || !(file instanceof File)) return NextResponse.json({ error: "Archivo o tipo de recurso inválido." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Usa JPG, PNG o SVG." }, { status: 415 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "El archivo supera 8 MB." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type === "image/svg+xml") {
    const svg = new TextDecoder().decode(bytes);
    if (!/<svg[\s>]/i.test(svg) || /<script|javascript:|on\w+\s*=|<foreignObject/i.test(svg)) return NextResponse.json({ error: "El SVG contiene elementos no permitidos." }, { status: 422 });
  }

  await ensureBucket(authorized.admin);
  const extension = allowedTypes.get(file.type)!;
  const alternatives = ["jpg", "png", "svg"].map((ext) => `platform/${kind}.${ext}`);
  await authorized.admin.storage.from(bucket).remove(alternatives);
  const path = `platform/${kind}.${extension}`;
  const { error: uploadError } = await authorized.admin.storage.from(bucket).upload(path, bytes, { contentType: file.type, upsert: true, cacheControl: "3600" });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
  const { data: publicUrl } = authorized.admin.storage.from(bucket).getPublicUrl(path);
  const config = await readConfig(authorized.admin);
  const asset: BrandAsset = { url: `${publicUrl.publicUrl}?v=${Date.now()}`, path, mimeType: file.type, originalName: file.name, updatedAt: new Date().toISOString() };
  config[kind] = asset;
  await writeConfig(authorized.admin, config);
  return NextResponse.json({ asset, assets: config });
}

export async function DELETE(request: NextRequest) {
  const authorized = await authorize(request);
  if ("error" in authorized) return authorized.error;
  const kind = new URL(request.url).searchParams.get("kind") as BrandAssetKind | null;
  if (!kind || !allowedKinds.has(kind)) return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  await ensureBucket(authorized.admin);
  const config = await readConfig(authorized.admin);
  if (config[kind]?.path) await authorized.admin.storage.from(bucket).remove([config[kind]!.path]);
  delete config[kind];
  await writeConfig(authorized.admin, config);
  return NextResponse.json({ assets: config });
}
