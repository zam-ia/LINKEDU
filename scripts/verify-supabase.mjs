import fs from "node:fs";
import path from "node:path";
import { createClient } from "../web/node_modules/@supabase/supabase-js/dist/index.mjs";

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
  }));
}

const env = { ...readEnv(path.resolve(".env")), ...readEnv(path.resolve("web/.env.local")) };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) throw new Error("Falta la configuración local de Supabase.");

const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
const checks = [];
for (const table of ["colegios", "usuarios", "roles", "programas_aprendizaje", "plantillas_documento", "credenciales"]) {
  const { error } = await admin.from(table).select("*", { count: "exact", head: true });
  checks.push({ resource: table, ok: !error, detail: error?.message });
}
const { data: bucket, error: bucketError } = await admin.storage.getBucket("brand-assets");
checks.push({ resource: "storage:brand-assets", ok: Boolean(bucket) && !bucketError, detail: bucketError?.message });
const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
checks.push({ resource: "auth:superadmin", ok: !usersError && users.users.some((user) => user.email === "admin@test.com"), detail: usersError?.message });

for (const check of checks) console.log(`${check.ok ? "OK" : "ERROR"} ${check.resource}${check.detail ? ` - ${check.detail}` : ""}`);
if (checks.some((check) => !check.ok)) process.exit(1);
