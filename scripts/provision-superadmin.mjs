import fs from "node:fs";
import path from "node:path";
import { createClient } from "../web/node_modules/@supabase/supabase-js/dist/index.mjs";

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
      }),
  );
}

const localEnv = { ...readEnvFile(path.resolve(".env")), ...readEnvFile(path.resolve("web/.env.local")) };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;

if (!url || !publishableKey || !serviceRoleKey || !email || !password) {
  throw new Error("Faltan variables de Supabase o SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD.");
}

const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const publicClient = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: brandBucket } = await admin.storage.getBucket("brand-assets");
if (!brandBucket) {
  const { error: bucketError } = await admin.storage.createBucket("brand-assets", {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "application/json"],
  });
  if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) throw bucketError;
}

const brandConfig = {};
for (const asset of [
  { kind: "wordmark", localPath: "web/public/brand/doce-wordmark.png", remotePath: "platform/wordmark.png", mimeType: "image/png" },
  { kind: "icon", localPath: "web/public/brand/doce-icon.svg", remotePath: "platform/icon.svg", mimeType: "image/svg+xml" },
]) {
  const bytes = fs.readFileSync(path.resolve(asset.localPath));
  const { error: uploadError } = await admin.storage.from("brand-assets").upload(asset.remotePath, bytes, { contentType: asset.mimeType, upsert: true, cacheControl: "3600" });
  if (uploadError) throw uploadError;
  const { data: publicUrl } = admin.storage.from("brand-assets").getPublicUrl(asset.remotePath);
  brandConfig[asset.kind] = { url: publicUrl.publicUrl, path: asset.remotePath, mimeType: asset.mimeType, originalName: path.basename(asset.localPath), updatedAt: new Date().toISOString() };
}
const { error: configError } = await admin.storage.from("brand-assets").upload(
  "platform/config.json",
  new TextEncoder().encode(JSON.stringify(brandConfig, null, 2)),
  { contentType: "application/json", upsert: true, cacheControl: "60" },
);
if (configError) throw configError;

const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

let authUser = usersPage.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
const metadata = { nombre: "Administrador", apellido: "Doce", dni: "00000001", rol: "superadmin" };

if (authUser) {
  const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true,
    user_metadata: { ...authUser.user_metadata, ...metadata },
    app_metadata: { ...authUser.app_metadata, rol: "superadmin", role: "superadmin" },
  });
  if (error) throw error;
  authUser = data.user;
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: { rol: "superadmin", role: "superadmin" },
  });
  if (error) throw error;
  authUser = data.user;
}

const { error: profileError } = await admin.from("usuarios").upsert({
  id: authUser.id,
  colegio_id: null,
  rol: "superadmin",
  nombre: "Administrador",
  apellido: "Doce",
  dni: "00000001",
  foto_url: "/brand/doce-icon.svg",
  activo: true,
}, { onConflict: "id" });
if (profileError) throw profileError;

const { data: loginData, error: loginError } = await publicClient.auth.signInWithPassword({ email, password });
if (loginError || loginData.user?.id !== authUser.id) throw loginError || new Error("La verificación de inicio de sesión no coincidió.");
await publicClient.auth.signOut();

console.log(`Super Admin verificado: ${email} (${authUser.id})`);
