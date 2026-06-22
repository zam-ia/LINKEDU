"use client";

import { useState } from "react";
import { Download, Eye, Grid2X2, Printer, QrCode, Settings2, Upload, Users, WalletCards } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, primaryButton, secondaryButton } from "@/components/doce/WorkspacePrimitives";

const optionalFields = ["DNI", "Código interno", "Grado y sección", "Periodo", "Fecha de vencimiento"];

export default function CredentialsModule() {
  const [color, setColor] = useState("#ff2432");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [visibleFields, setVisibleFields] = useState(optionalFields);

  const toggleField = (field: string) => setVisibleFields((current) => current.includes(field) ? current.filter((item) => item !== field) : [...current, field]);
  const isVisible = (field: string) => visibleFields.includes(field);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader eyebrow="Identidad institucional" title="Credenciales y carnets" description="Diseña, emite y controla carnets físicos y digitales con QR verificable para alumnos, docentes, personal e invitados." action={<div className="flex gap-2"><button className={secondaryButton}><Upload className="h-4 w-4" /> Importar</button><button className={primaryButton}><WalletCards className="h-4 w-4" /> Emitir lote</button></div>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Credenciales activas" value="1,284" detail="Periodo académico 2026" icon={<WalletCards className="h-5 w-5" />} /><StatCard label="Por emitir" value="42" detail="Nuevos alumnos y personal" icon={<Users className="h-5 w-5" />} /><StatCard label="Verificaciones" value="318" detail="Últimos 30 días" icon={<QrCode className="h-5 w-5" />} /><StatCard label="Plantillas" value="6" detail="3 alumnos · 3 personal" icon={<Grid2X2 className="h-5 w-5" />} /></div>

      <div className="grid gap-5 xl:grid-cols-[320px_1fr_310px]">
        <aside className="rounded-[24px] border border-black/[.07] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-[#ff2432]" /><h2 className="text-sm font-black">Configuración</h2></div>
          <label className="mt-6 block text-[10px] font-black uppercase tracking-[.12em] text-black/35">Plantilla</label><select className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-xs font-bold"><option>Alumno · Minimal</option><option>Docente · Institucional</option><option>Evento · Acceso</option></select>
          <label className="mt-5 block text-[10px] font-black uppercase tracking-[.12em] text-black/35">Orientación</label><div className="mt-2 grid grid-cols-2 gap-2">{(["vertical", "horizontal"] as const).map((item) => <button key={item} onClick={() => setOrientation(item)} className={`rounded-xl border px-3 py-2.5 text-[11px] font-bold capitalize ${orientation === item ? "border-black bg-black text-white" : "border-black/10"}`}>{item}</button>)}</div>
          <label className="mt-5 block text-[10px] font-black uppercase tracking-[.12em] text-black/35">Color institucional</label><div className="mt-2 flex items-center gap-3 rounded-xl border border-black/10 p-2"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" /><input value={color} onChange={(e) => setColor(e.target.value)} className="w-full text-xs font-bold uppercase outline-none" /></div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[.12em] text-black/35">Campos visibles</p><div className="mt-3 space-y-2">{optionalFields.map((field) => <label key={field} className="flex cursor-pointer items-center justify-between rounded-xl bg-[#f8f8f6] px-3 py-2.5 text-[11px] font-bold"><span>{field}</span><input type="checkbox" checked={isVisible(field)} onChange={() => toggleField(field)} className="accent-[#ff2432]" /></label>)}</div>
        </aside>

        <section className="flex min-h-[620px] items-center justify-center rounded-[24px] border border-black/[.07] bg-[#eaeae6] p-8 shadow-inner">
          <div className={`relative overflow-hidden rounded-[22px] bg-white shadow-[0_30px_70px_-25px_rgba(0,0,0,.45)] transition-all ${orientation === "vertical" ? "h-[500px] w-[315px]" : "h-[315px] w-[500px]"}`}>
            <div className="absolute inset-x-0 top-0 h-24" style={{ backgroundColor: color }} /><div className="absolute -right-12 -top-10 h-40 w-40 rounded-full border-[28px] border-white/15" />
            <div className={`relative flex h-full ${orientation === "vertical" ? "flex-col items-center px-7 pt-14 text-center" : "items-center gap-8 px-10 pt-8 text-left"}`}>
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border-4 border-white bg-[#ecece8] text-2xl font-black shadow-md">VC</div>
              <div className={orientation === "vertical" ? "mt-6" : "mt-8 flex-1"}><p className="text-[9px] font-black uppercase tracking-[.2em]" style={{ color }}>Estudiante</p><h3 className="mt-2 text-2xl font-black tracking-[-.03em]">Valeria Castro</h3>{isVisible("Grado y sección") && <p className="mt-1 text-xs font-bold text-black/45">5.º Primaria · A</p>}<div className={`mt-6 grid gap-x-5 gap-y-3 text-[10px] ${orientation === "vertical" ? "grid-cols-2 text-left" : "grid-cols-2"}`}>{isVisible("DNI") && <div><span className="block font-black uppercase text-black/30">DNI</span><strong>75421896</strong></div>}{isVisible("Código interno") && <div><span className="block font-black uppercase text-black/30">Código</span><strong>ALU-2026-0184</strong></div>}{isVisible("Periodo") && <div><span className="block font-black uppercase text-black/30">Periodo</span><strong>2026</strong></div>}{isVisible("Fecha de vencimiento") && <div><span className="block font-black uppercase text-black/30">Válido hasta</span><strong>31 dic. 2026</strong></div>}</div></div>
              <div className={orientation === "vertical" ? "mt-auto mb-7" : "ml-auto mt-8"}><div className="flex h-20 w-20 items-center justify-center rounded-xl bg-black text-white"><QrCode className="h-14 w-14" /></div><p className="mt-2 text-[7px] font-bold uppercase tracking-[.12em] text-black/35">Verificación segura</p></div>
            </div>
          </div>
        </section>

        <aside className="rounded-[24px] border border-black/[.07] bg-white p-5 shadow-sm"><h2 className="text-sm font-black">Producción</h2><p className="mt-1 text-xs leading-5 text-black/40">La plantilla se aplica a uno o varios registros.</p><div className="mt-6 space-y-2"><button className={`${secondaryButton} w-full !justify-start`}><Eye className="h-4 w-4 text-[#ff2432]" /> Vista previa masiva</button><button className={`${secondaryButton} w-full !justify-start`}><Download className="h-4 w-4 text-[#ff2432]" /> Exportar PDF</button><button className={`${secondaryButton} w-full !justify-start`}><Printer className="h-4 w-4 text-[#ff2432]" /> Preparar hoja A4</button></div><div className="mt-7 rounded-2xl bg-black p-5 text-white"><p className="text-[9px] font-black uppercase tracking-[.14em] text-white/40">Salida de impresión</p><p className="mt-3 text-2xl font-black">10 carnets</p><p className="mt-1 text-[10px] text-white/45">CR80 · A4 vertical · con reverso</p><button className="mt-5 w-full rounded-xl py-3 text-xs font-black text-black" style={{ backgroundColor: color }}>Generar lote</button></div></aside>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-black/[.07] bg-white"><div className="flex items-center justify-between border-b border-black/[.06] p-5"><div><h2 className="text-base font-black">Emisiones recientes</h2><p className="mt-1 text-xs text-black/40">Historial auditable de credenciales.</p></div><button className={secondaryButton}>Ver historial</button></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-[#f8f8f6] text-[9px] font-black uppercase tracking-[.12em] text-black/35"><tr><th className="px-5 py-3">Titular</th><th>Tipo</th><th>Código</th><th>Emisión</th><th>Estado</th><th></th></tr></thead><tbody>{[["Luciana Pérez","Alumno","ALU-2026-0183","22 jun. 2026"],["Marco Salazar","Docente","DOC-2026-0042","21 jun. 2026"],["Ana Torres","Invitada","EVT-2026-0318","21 jun. 2026"]].map((row) => <tr key={row[2]} className="border-t border-black/[.05]"><td className="px-5 py-4 font-black">{row[0]}</td><td>{row[1]}</td><td className="font-mono text-[11px]">{row[2]}</td><td>{row[3]}</td><td><StatusBadge tone="success">Activa</StatusBadge></td><td><button className="font-black">Ver</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
