"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  CirclePlay,
  FileBadge2,
  Fingerprint,
  GraduationCap,
  LayoutDashboard,
  Menu,
  QrCode,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/doce/BrandMark";
import { useAuthStore } from "@/lib/store/useAuthStore";

const modules = [
  { icon: BookOpen, label: "Aula virtual", title: "Aprendizaje que sí se puede gestionar", text: "Cursos, módulos, clases en vivo, materiales, tareas, evaluaciones y progreso en una sola experiencia." },
  { icon: WalletCards, label: "Credenciales", title: "Carnets y fotochecks verificables", text: "Diseña, genera por lotes, imprime en CR80 y valida cada identidad mediante un QR seguro." },
  { icon: FileBadge2, label: "Documentos", title: "Certificados que tienen valor real", text: "Diplomas, constancias y certificados con plantillas, emisión masiva, revocación y verificación pública." },
  { icon: LayoutDashboard, label: "Gestión", title: "La operación educativa bajo control", text: "Alumnos, docentes, asistencia, notas, pagos, comunicaciones y reportes por institución." },
];

const plans = [
  { name: "Básico", price: "S/ 5", description: "La operación académica esencial.", features: ["Alumnos y docentes", "Asistencia y comunicados", "Panel del director", "App básica"] },
  { name: "Gestión", price: "S/ 7", description: "Control académico y financiero.", features: ["Todo lo del Básico", "Pagos y pensiones", "Reportes académicos", "Carnets digitales"] },
  { name: "Profesional", price: "S/ 10", description: "El ecosistema documental completo.", popular: true, features: ["Todo lo de Gestión", "Certificados con QR", "Fotochecks imprimibles", "Generación masiva"] },
  { name: "Enterprise", price: "A medida", description: "Para operaciones complejas.", features: ["Marca blanca", "Múltiples sedes", "API e integraciones", "Migración y soporte prioritario"] },
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-12 -z-10 rounded-full bg-[#ff2432]/10 blur-3xl" />
      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.45)]">
        <div className="flex h-11 items-center gap-2 border-b border-black/5 px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff2432]" /><span className="h-2.5 w-2.5 rounded-full bg-black/15" /><span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="ml-auto text-[10px] font-bold uppercase tracking-[.2em] text-black/35">Doce workspace</span>
        </div>
        <div className="grid min-h-[370px] grid-cols-[110px_1fr] sm:grid-cols-[150px_1fr]">
          <aside className="border-r border-black/5 bg-[#fafafa] p-3 sm:p-4">
            <BrandMark className="mb-7 !w-[72px]" />
            {["Resumen", "Aula virtual", "Alumnos", "Credenciales", "Documentos"].map((item, index) => (
              <div key={item} className={`mb-2 rounded-xl px-3 py-2.5 text-[10px] font-bold sm:text-xs ${index === 1 ? "bg-black text-white" : "text-black/45"}`}>{item}</div>
            ))}
          </aside>
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#ff2432]">Aula virtual</p><h3 className="mt-1 text-lg font-black tracking-tight sm:text-2xl">Buenos días, Valeria</h3></div>
              <div className="h-9 w-9 rounded-full bg-[#ffe4e6]" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[["4", "cursos"], ["78%", "avance"], ["2", "entregas"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-black/5 bg-[#fafafa] p-3 sm:p-4"><p className="text-lg font-black sm:text-2xl">{value}</p><p className="text-[9px] font-semibold text-black/40 sm:text-[11px]">{label}</p></div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-black p-4 text-white sm:p-5">
              <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/45">Continúa aprendiendo</p><p className="mt-1 text-sm font-bold sm:text-base">Gestión educativa digital</p></div><CirclePlay className="h-8 w-8 text-[#ff2432]" /></div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[68%] rounded-full bg-[#ff2432]" /></div>
              <div className="mt-2 flex justify-between text-[9px] text-white/45"><span>Módulo 4 de 6</span><span>68%</span></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-black/5 p-4"><QrCode className="h-5 w-5 text-[#ff2432]" /><p className="mt-3 text-xs font-bold">Carnet digital</p></div>
              <div className="rounded-2xl border border-black/5 p-4"><BadgeCheck className="h-5 w-5 text-[#ff2432]" /><p className="mt-3 text-xs font-bold">Mis certificados</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user && !loading && window.self === window.top) router.replace(`/${user.rol}`);
  }, [user, loading, router]);

  const requestDemo = (event: FormEvent) => {
    event.preventDefault();
    if (!school.trim() || !email.trim()) return;
    const number = process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "51987088359";
    const message = `Hola Doce. Quiero una demostración para ${school}. Mi correo es ${email}.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f5] text-black">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[.06] bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#inicio" aria-label="Doce, inicio"><BrandMark priority /></a>
          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-black/55 md:flex"><a href="#plataforma" className="hover:text-black">Plataforma</a><a href="#diferenciales" className="hover:text-black">Qué resuelve</a><a href="#precios" className="hover:text-black">Planes</a></nav>
          <div className="hidden items-center gap-3 md:flex"><button onClick={() => router.push("/login")} className="rounded-full px-5 py-2.5 text-sm font-bold hover:bg-black/5">Ingresar</button><a href="#demo" className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff2432]">Solicitar demo</a></div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2 md:hidden" aria-label="Abrir menú">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-black/5 bg-white p-5 md:hidden"><div className="flex flex-col gap-4 text-sm font-bold"><a href="#plataforma" onClick={() => setMenuOpen(false)}>Plataforma</a><a href="#precios" onClick={() => setMenuOpen(false)}>Planes</a><button onClick={() => router.push("/login")} className="rounded-full bg-black py-3 text-white">Ingresar a Doce</button></div></div>}
      </header>

      <section id="inicio" className="relative px-5 pb-24 pt-36 lg:px-8 lg:pb-32 lg:pt-44">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.92fr_1.08fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] shadow-sm"><Sparkles className="h-3.5 w-3.5 text-[#ff2432]" /> Sistema operativo educativo</div>
            <h1 className="mt-7 max-w-[720px] text-[48px] font-black leading-[.96] tracking-[-.055em] sm:text-[68px] lg:text-[76px]">Todo lo que enseñas, gestionas y acreditas. <span className="text-[#ff2432]">En un solo lugar.</span></h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-7 text-black/55 sm:text-lg">Doce conecta el aula virtual, la gestión institucional y los documentos verificables de colegios, institutos y centros de capacitación.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#demo" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ff2432]">Ver Doce en acción <ArrowRight className="h-4 w-4" /></a><a href="#plataforma" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold">Explorar plataforma <ChevronRight className="h-4 w-4" /></a></div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-black/45">{["Multi-tenant real", "Permisos por usuario", "QR verificable"].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#ff2432]" />{item}</span>)}</div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-black/[.06] bg-white px-5 py-7"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center text-xs font-bold uppercase tracking-[.18em] text-black/35"><span>Colegios</span><span>Academias</span><span>Institutos</span><span>Universidades</span><span>Capacitación corporativa</span></div></section>

      <section id="plataforma" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#ff2432]">Una plataforma, cuatro sistemas</p><h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl">No es otro LMS. Es la infraestructura digital de tu institución.</h2></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {modules.map((module, index) => (
              <article key={module.label} className={`group rounded-[28px] border border-black/[.07] p-7 transition hover:-translate-y-1 hover:shadow-xl sm:p-9 ${index === 0 ? "bg-black text-white" : "bg-white"}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 0 ? "bg-[#ff2432]" : "bg-[#ffe9eb] text-[#ff2432]"}`}><module.icon className="h-5 w-5" /></div>
                <p className={`mt-8 text-[11px] font-black uppercase tracking-[.18em] ${index === 0 ? "text-white/40" : "text-black/35"}`}>{module.label}</p><h3 className="mt-2 text-2xl font-black tracking-[-.025em]">{module.title}</h3><p className={`mt-3 max-w-xl text-sm font-medium leading-6 ${index === 0 ? "text-white/55" : "text-black/50"}`}>{module.text}</p><div className="mt-8 inline-flex items-center gap-2 text-xs font-bold">Conocer el módulo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciales" className="bg-black px-5 py-24 text-white lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#ff2432]">Confianza por diseño</p><h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl">Cada usuario ve lo que necesita. Cada documento demuestra lo que vale.</h2></div>
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              { icon: Fingerprint, title: "Permisos granulares", text: "Roles por institución y permisos directos por usuario. La seguridad también se aplica en base de datos." },
              { icon: QrCode, title: "Verificación pública", text: "Tokens únicos, revocables y sin exposición innecesaria de datos personales." },
              { icon: ShieldCheck, title: "Trazabilidad", text: "Auditoría de cambios, emisiones, anulaciones, accesos y verificaciones." },
              { icon: Building2, title: "Multi-institución", text: "Marca, módulos, plan, sedes, periodos y reglas independientes para cada cliente." },
            ].map((item) => <div key={item.title}><item.icon className="h-6 w-6 text-[#ff2432]" /><h3 className="mt-4 text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p></div>)}
          </div>
        </div>
      </section>

      <section id="precios" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-[#ff2432]">Planes claros</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Desde S/ 5 por alumno al mes.</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-black/50">Alquiler mensual con acceso a la plataforma, gestión académica y credenciales digitales según el plan contratado.</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.name} className={`relative flex flex-col rounded-[26px] border p-7 ${plan.popular ? "border-black bg-black text-white" : "border-black/[.08] bg-white"}`}>
                {plan.popular && <span className="absolute right-5 top-5 rounded-full bg-[#ff2432] px-3 py-1 text-[9px] font-black uppercase tracking-[.16em]">Recomendado</span>}<h3 className="text-lg font-black">{plan.name}</h3><p className="mt-5 text-4xl font-black tracking-[-.04em]">{plan.price}</p>{plan.price !== "A medida" && <p className={`text-xs font-semibold ${plan.popular ? "text-white/45" : "text-black/40"}`}>por alumno / mes</p>}<p className={`mt-5 text-sm ${plan.popular ? "text-white/55" : "text-black/50"}`}>{plan.description}</p><div className={`my-6 h-px ${plan.popular ? "bg-white/10" : "bg-black/[.06]"}`} /><ul className="flex-1 space-y-3 text-xs font-semibold">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#ff2432]" />{feature}</li>)}</ul><a href="#demo" className={`mt-8 rounded-full py-3 text-center text-xs font-bold ${plan.popular ? "bg-white text-black" : "bg-[#f2f2ef]"}`}>Solicitar propuesta</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="px-5 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[34px] bg-[#ff2432] lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-8 text-white sm:p-12 lg:p-16"><GraduationCap className="h-9 w-9" /><h2 className="mt-8 text-4xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl">Mira cómo funcionaría Doce en tu institución.</h2><p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/75">Revisamos tu operación, cantidad de alumnos y procesos críticos. Luego te mostramos el flujo exacto que usaría cada rol.</p></div>
          <form onSubmit={requestDemo} className="m-3 rounded-[28px] bg-white p-7 sm:p-10 lg:m-5 lg:p-12">
            <h3 className="text-2xl font-black tracking-tight">Solicita una demostración</h3><p className="mt-2 text-sm text-black/45">Respuesta comercial por WhatsApp.</p><label className="mt-8 block text-xs font-bold">Institución</label><input value={school} onChange={(e) => setSchool(e.target.value)} required placeholder="Nombre de tu colegio o instituto" className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3.5 text-sm outline-none focus:border-black" /><label className="mt-5 block text-xs font-bold">Correo de contacto</label><input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="direccion@institucion.edu.pe" className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3.5 text-sm outline-none focus:border-black" /><button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-bold text-white">Agendar demo <ArrowRight className="h-4 w-4" /></button><p className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-black/35"><ShieldCheck className="h-3.5 w-3.5" /> No compartimos tus datos con terceros.</p>
          </form>
        </div>
      </section>

      <footer className="border-t border-black/[.06] bg-white px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><BrandMark /><p className="mt-2 text-xs text-black/35">Sistema operativo educativo.</p></div><p className="text-xs text-black/35">© 2026 Doce. Gestión, aprendizaje y credenciales verificables.</p></div></footer>
    </main>
  );
}
