import { VerificationCard } from "@/components/doce/VerificationCard";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function VerifyCertificate({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const { data } = await supabase.rpc("verificar_documento", { codigo_o_token: codigo });
  return <VerificationCard kind="documento" code={codigo} data={(data as Record<string, unknown> | null) ?? null} />;
}
