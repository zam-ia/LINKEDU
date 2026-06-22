"use client";

import { useState } from "react";
import { KeyRound, Plus, ShieldCheck, UserCog, Users } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, primaryButton } from "@/components/doce/WorkspacePrimitives";

const resources = [
  { name: "Aula virtual", code: "learning", actions: ["Ver", "Crear", "Editar", "Evaluar"] },
  { name: "Usuarios", code: "users", actions: ["Ver", "Crear", "Editar", "Desactivar"] },
  { name: "Credenciales", code: "credentials", actions: ["Ver", "Diseñar", "Emitir", "Anular"] },
  { name: "Documentos", code: "documents", actions: ["Ver", "Diseñar", "Emitir", "Anular"] },
  { name: "Finanzas", code: "finance", actions: ["Ver", "Registrar", "Conciliar", "Exportar"] },
];

const defaults: Record<string, string[]> = { director: resources.flatMap((r) => r.actions.map((a) => `${r.code}.${a}`)), coordinador: ["learning.Ver","learning.Crear","learning.Editar","learning.Evaluar","users.Ver","credentials.Ver","credentials.Emitir","documents.Ver","documents.Emitir"], docente: ["learning.Ver","learning.Editar","learning.Evaluar","users.Ver","credentials.Ver","documents.Ver"] };

export default function RolesPermissions() {
  const [role, setRole] = useState("director");
  const [permissions, setPermissions] = useState(defaults);
  const selected = permissions[role] ?? [];
  const toggle = (key: string) => setPermissions((current) => ({ ...current, [role]: selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key] }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader eyebrow="Seguridad y acceso" title="Roles y permisos" description="Define capacidades por institución y aplica excepciones directas por usuario. La autorización se replica en Row Level Security." action={<button className={primaryButton}><Plus className="h-4 w-4" /> Crear rol</button>} />
      <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Roles activos" value="8" detail="5 de sistema · 3 personalizados" icon={<UserCog className="h-5 w-5" />} /><StatCard label="Permisos" value="42" detail="Agrupados en 11 recursos" icon={<KeyRound className="h-5 w-5" />} /><StatCard label="Usuarios asignados" value="1,596" detail="7 excepciones individuales" icon={<Users className="h-5 w-5" />} /></div>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[24px] border border-black/[.07] bg-white p-4 shadow-sm"><p className="px-2 text-[10px] font-black uppercase tracking-[.14em] text-black/35">Roles de la institución</p><div className="mt-3 space-y-1">{[["director","Director","12 usuarios"],["coordinador","Coordinador académico","4 usuarios"],["docente","Docente","86 usuarios"],["alumno","Alumno","1,284 usuarios"],["padre","Padre / apoderado","1,119 usuarios"]].map(([code, name, count]) => <button key={code} onClick={() => setRole(code)} className={`w-full rounded-xl px-3 py-3 text-left transition ${role === code ? "bg-black text-white" : "hover:bg-black/[.03]"}`}><div className="flex items-center justify-between"><span className="text-xs font-black">{name}</span>{code === "director" && <ShieldCheck className="h-4 w-4 text-[#ff2432]" />}</div><span className={`mt-1 block text-[9px] font-semibold ${role === code ? "text-white/40" : "text-black/35"}`}>{count}</span></button>)}</div></aside>
        <section className="overflow-hidden rounded-[24px] border border-black/[.07] bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-black/[.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h2 className="text-lg font-black capitalize">{role}</h2><StatusBadge tone={role === "director" ? "accent" : "neutral"}>{role === "director" ? "Sistema" : "Editable"}</StatusBadge></div><p className="mt-1 text-xs text-black/40">Selecciona exactamente qué acciones puede ejecutar este rol.</p></div><button className={primaryButton}>Guardar permisos</button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-[#f8f8f6] text-[9px] font-black uppercase tracking-[.12em] text-black/35"><tr><th className="px-5 py-3">Módulo</th>{["Ver","Crear / Diseñar","Editar / Emitir","Acción crítica"].map((label) => <th key={label} className="px-3 text-center">{label}</th>)}</tr></thead><tbody>{resources.map((resource) => <tr key={resource.code} className="border-t border-black/[.05]"><td className="px-5 py-4"><p className="text-xs font-black">{resource.name}</p><p className="mt-1 font-mono text-[9px] text-black/30">{resource.code}</p></td>{resource.actions.map((action) => { const key = `${resource.code}.${action}`; return <td key={key} className="px-3 text-center"><button onClick={() => toggle(key)} aria-label={`${action} ${resource.name}`} className={`mx-auto flex h-6 w-10 items-center rounded-full p-0.5 transition ${selected.includes(key) ? "justify-end bg-[#ff2432]" : "justify-start bg-black/10"}`}><span className="h-5 w-5 rounded-full bg-white shadow-sm" /></button></td>; })}</tr>)}</tbody></table></div><div className="border-t border-black/[.06] bg-amber-50 px-5 py-4 text-[10px] font-semibold leading-4 text-amber-800">Las acciones críticas deben validarse también en servidor y en políticas RLS. Ocultar un botón no constituye autorización.</div></section>
      </div>
    </div>
  );
}
