"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, QrCode, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/doce/BrandMark";

export default function CertificateLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!value) return;
    router.push(`/verificar/certificado/${encodeURIComponent(value)}`);
  };

  return (
    <main className="min-h-screen bg-[#f4f4f1] p-5 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[34px] border border-black/[.07] bg-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.4)] lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-black p-8 text-white sm:p-12">
            <Link href="/" aria-label="Volver a Doce"><BrandMark className="invert" /></Link>
            <BadgeCheck className="mt-16 h-10 w-10 text-[#ff2432]" />
            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-5xl">Verifica un certificado, constancia o diploma.</h1>
            <p className="mt-5 text-sm font-medium leading-6 text-white/55">Ingresa el código del documento o escanea el QR impreso. La consulta no expone datos sensibles completos.</p>
          </div>
          <form onSubmit={submit} className="p-8 sm:p-12">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff2432]">Verificación pública</p>
            <label className="mt-8 block text-xs font-black uppercase tracking-[.12em] text-black/45">Código de certificado</label>
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej. CERT-DOCE-2026-001" className="mt-3 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-4 text-sm font-bold outline-none focus:border-black" />
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-bold text-white hover:bg-[#ff2432]">Verificar documento <ArrowRight className="h-4 w-4" /></button>
            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl bg-[#f8f8f6] p-4"><QrCode className="h-5 w-5 text-[#ff2432]" /><p className="mt-3 text-xs font-bold">También puedes escanear el QR desde la cámara de tu celular.</p></div>
              <div className="rounded-2xl bg-[#f8f8f6] p-4"><ShieldCheck className="h-5 w-5 text-[#ff2432]" /><p className="mt-3 text-xs font-bold">Si el documento fue anulado o venció, el resultado lo indicará.</p></div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
