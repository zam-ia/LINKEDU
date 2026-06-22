import { VerificationCard } from "@/components/doce/VerificationCard";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function VerifyCredential({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data } = await supabase.rpc("verificar_credencial", { token });
  return <VerificationCard kind="credencial" code={token} data={(data as Record<string, unknown> | null) ?? null} />;
}
