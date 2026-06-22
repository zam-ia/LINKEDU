"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronRight, CirclePlay, Clock3, GraduationCap, Plus, Search, Users } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, primaryButton, secondaryButton } from "@/components/doce/WorkspacePrimitives";

const initialPrograms = [
  { id: 1, name: "Gestión educativa digital", type: "Diplomado", students: 86, modules: 8, progress: 62, state: "En curso", next: "Hoy · 7:00 p. m." },
  { id: 2, name: "Evaluación por competencias", type: "Curso", students: 124, modules: 5, progress: 81, state: "En curso", next: "Mañana · 6:30 p. m." },
  { id: 3, name: "Convivencia y tutoría escolar", type: "Taller", students: 48, modules: 4, progress: 100, state: "Finalizado", next: "Sin clases pendientes" },
];

export default function VirtualClassroomAdmin() {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const programs = useMemo(() => initialPrograms.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader eyebrow="Aprendizaje" title="Aula virtual" description="Administra cursos, módulos, clases, materiales, evaluaciones y progreso sin salir del panel institucional." action={<button onClick={() => setShowCreate(true)} className={primaryButton}><Plus className="h-4 w-4" /> Nuevo programa</button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Programas activos" value="12" detail="3 inician este mes" icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Participantes" value="428" detail="91% con actividad reciente" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Progreso promedio" value="74%" detail="+6% frente al mes anterior" icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard label="Clases esta semana" value="18" detail="5 sesiones en vivo" icon={<CalendarDays className="h-5 w-5" />} />
      </div>

      <section className="overflow-hidden rounded-[24px] border border-black/[.07] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-black/[.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-black tracking-tight">Programas de aprendizaje</h2><p className="mt-1 text-xs font-medium text-black/40">Cursos, talleres, diplomados y eventos activos.</p></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar programa" className="w-full rounded-xl border border-black/10 bg-[#f8f8f6] py-2.5 pl-10 pr-3 text-xs font-medium outline-none focus:border-black/30" /></div>
        </div>
        <div className="divide-y divide-black/[.05]">
          {programs.map((program) => (
            <article key={program.id} className="grid gap-5 p-5 transition hover:bg-black/[.015] lg:grid-cols-[1.4fr_.6fr_.65fr_auto] lg:items-center">
              <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white"><CirclePlay className="h-5 w-5 text-[#ff2432]" /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black text-black">{program.name}</h3><StatusBadge tone={program.state === "Finalizado" ? "success" : "accent"}>{program.state}</StatusBadge></div><p className="mt-1 text-[11px] font-semibold text-black/40">{program.type} · {program.modules} módulos</p></div></div>
              <div><p className="text-[10px] font-black uppercase tracking-[.12em] text-black/30">Participantes</p><p className="mt-1 text-sm font-bold">{program.students} matriculados</p></div>
              <div><div className="flex justify-between text-[10px] font-bold"><span>Progreso</span><span>{program.progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#ff2432]" style={{ width: `${program.progress}%` }} /></div></div>
              <button className="flex items-center gap-2 text-xs font-black">Gestionar <ChevronRight className="h-4 w-4" /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[24px] bg-black p-6 text-white sm:p-8"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff5965]">Próxima sesión</p><h2 className="mt-3 text-2xl font-black">Evaluación por competencias</h2><p className="mt-2 text-sm text-white/45">Módulo 4 · Instrumentos y evidencias de aprendizaje</p><div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-white/70"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#ff2432]" /> Mañana, 6:30 p. m.</span><span className="flex items-center gap-2"><Users className="h-4 w-4 text-[#ff2432]" /> 124 participantes</span></div><button className="mt-7 rounded-xl bg-white px-4 py-3 text-xs font-black text-black">Abrir sala docente</button></div>
        <div className="rounded-[24px] border border-black/[.07] bg-white p-6"><h2 className="text-base font-black">Acciones rápidas</h2><div className="mt-5 grid gap-2"><button className={`${secondaryButton} !justify-start`}><Plus className="h-4 w-4 text-[#ff2432]" /> Agregar módulo o clase</button><button className={`${secondaryButton} !justify-start`}><Users className="h-4 w-4 text-[#ff2432]" /> Importar participantes</button><button className={`${secondaryButton} !justify-start`}><GraduationCap className="h-4 w-4 text-[#ff2432]" /> Revisar progreso y notas</button></div></div>
      </section>

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[26px] bg-white p-7 shadow-2xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">Nuevo contenido</p><h2 className="mt-2 text-2xl font-black">Crear programa</h2><div className="mt-6 grid gap-4"><label className="text-xs font-bold">Nombre<input autoFocus className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-medium outline-none focus:border-black" placeholder="Ej. Diplomado en gestión educativa" /></label><label className="text-xs font-bold">Tipo<select className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-medium"><option>Curso</option><option>Taller</option><option>Diplomado</option><option>Evento</option></select></label></div><div className="mt-7 flex justify-end gap-3"><button onClick={() => setShowCreate(false)} className={secondaryButton}>Cancelar</button><button onClick={() => setShowCreate(false)} className={primaryButton}>Crear borrador</button></div></div></div>}
    </div>
  );
}
