import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const MAX_TEXT = 900;

function clean(value: unknown, max = MAX_TEXT) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hhauwkcnpfithuqnyhss.supabase.co";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole) return null;
  return createClient(new URL(url).origin, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      nombre: clean(body.nombre, 160),
      cargo: clean(body.cargo, 140),
      institucion: clean(body.institucion, 180),
      tipo_institucion: clean(body.tipoInstitucion, 80),
      alumnos: Number.parseInt(clean(body.alumnos, 12), 10) || null,
      celular: clean(body.celular, 60),
      correo: clean(body.correo, 180).toLowerCase(),
      intereses: Array.isArray(body.intereses) ? body.intereses.map((item: unknown) => clean(item, 80)).filter(Boolean).slice(0, 12) : [],
      mensaje: clean(body.mensaje, 1200),
      source: "landing",
    };

    if (!payload.nombre || !payload.institucion || !payload.correo) {
      return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ ok: true, persisted: false, reason: "missing_service_role" });

    const { error } = await admin.from("landing_leads").insert(payload);
    if (error) {
      console.error("landing_leads_insert_error", error.message);
      return NextResponse.json({ ok: true, persisted: false, reason: "insert_failed" });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (error) {
    console.error("landing_leads_error", error);
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
}
