import Link from "next/link";
import { BadgeCheck, Calendar, CircleX, Clock3, GraduationCap, ShieldCheck } from "lucide-react";
import { BrandMark } from "./BrandMark";

type VerificationData = {
  encontrado?: boolean;
  estado?: string;
  codigo?: string;
  tipo?: string;
  institucion?: string;
  titular?: string;
  programa?: string;
  rol?: string;
  periodo?: string;
  horas?: string;
  creditos?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
};

export function VerificationCard({ kind, data, code }: { kind: "documento" | "credencial"; data: VerificationData | null; code: string }) {
  const validStates = ["emitido", "activa"];
  const isValid = Boolean(data?.encontrado && data.estado && validStates.includes(data.estado));
  const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value)) : "—";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f1] p-5 text-black">
      <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-black/[.07] bg-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.4)]">
        <div className="flex items-center justify-between border-b border-black/[.06] px-6 py-5"><Link href="/"><BrandMark /></Link><span className="text-[9px] font-black uppercase tracking-[.16em] text-black/30">Verificación pública</span></div>
        <div className="p-7 sm:p-10">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isValid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{isValid ? <BadgeCheck className="h-7 w-7" /> : <CircleX className="h-7 w-7" />}</div>
          <p className={`mt-6 text-[10px] font-black uppercase tracking-[.18em] ${isValid ? "text-emerald-600" : "text-red-600"}`}>{isValid ? `${kind} auténtico` : data?.estado === "anulado" || data?.estado === "anulada" ? `${kind} anulado` : "No se pudo validar"}</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] sm:text-4xl">{isValid ? data?.titular || "Titular verificado" : "Verificación no válida"}</h1>
          <p className="mt-3 text-sm leading-6 text-black/45">{isValid ? `La información coincide con el registro oficial de ${data?.institucion}.` : "El código no existe, está vencido o fue revocado por la institución emisora."}</p>

          {data?.encontrado && <div className="mt-8 grid gap-4 rounded-[22px] bg-[#f7f7f5] p-5 sm:grid-cols-2">{[
            [GraduationCap, "Institución", data.institucion],
            [ShieldCheck, kind === "documento" ? "Programa" : "Rol", kind === "documento" ? data.programa : data.rol],
            [Calendar, "Fecha de emisión", formatDate(data.fecha_emision)],
            [Clock3, kind === "documento" ? "Código" : "Vigencia", kind === "documento" ? data.codigo : data.periodo || formatDate(data.fecha_vencimiento)],
          ].map(([Icon, label, value]) => { const I = Icon as typeof ShieldCheck; return <div key={label as string} className="flex gap-3"><I className="mt-0.5 h-4 w-4 shrink-0 text-[#ff2432]" /><div><p className="text-[9px] font-black uppercase tracking-[.12em] text-black/30">{label as string}</p><p className="mt-1 text-xs font-bold">{(value as string) || "—"}</p></div></div>; })}</div>}
          <div className="mt-8 flex items-center gap-2 border-t border-black/[.06] pt-6 text-[10px] font-semibold leading-4 text-black/35"><ShieldCheck className="h-4 w-4 shrink-0 text-[#ff2432]" /> Esta consulta muestra únicamente información necesaria para comprobar autenticidad y no expone datos sensibles.</div>
          <p className="mt-5 font-mono text-[9px] text-black/25">Consulta: {code}</p>
        </div>
      </div>
    </main>
  );
}
