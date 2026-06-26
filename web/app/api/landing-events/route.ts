import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const allowedEvents = new Set([
  "landing_view",
  "hero_cta_click",
  "demo_cta_click",
  "pricing_view",
  "pricing_calculator_used",
  "whatsapp_click",
  "demo_form_submit",
  "role_demo_click",
  "certificate_section_view",
  "credential_section_view",
  "faq_click",
  "login_attempt",
  "demo_login_success",
]);

function clean(value: unknown, max = 300) {
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
    const event = clean(body.event, 80);
    if (!allowedEvents.has(event)) return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ ok: true, persisted: false, reason: "missing_service_role" });

    const { error } = await admin.from("landing_events").insert({
      event_name: event,
      path: clean(body.path, 240),
      referrer: clean(body.referrer, 500) || null,
      payload: typeof body.payload === "object" && body.payload !== null ? body.payload : {},
      user_agent: clean(request.headers.get("user-agent"), 500),
    });

    if (error) {
      console.error("landing_events_insert_error", error.message);
      return NextResponse.json({ ok: true, persisted: false, reason: "insert_failed" });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (error) {
    console.error("landing_events_error", error);
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
}
