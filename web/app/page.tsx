"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  BookOpen,
  Building2,
  Calculator,
  CalendarCheck,
  Check,
  ChevronRight,
  CirclePlay,
  ClipboardCheck,
  CreditCard,
  FileBadge2,
  FileCheck2,
  Fingerprint,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { BrandMark, useBrandAsset } from "@/components/doce/BrandMark";
import { useAuthStore } from "@/lib/store/useAuthStore";

type LandingEventName =
  | "landing_view"
  | "hero_cta_click"
  | "demo_cta_click"
  | "pricing_view"
  | "pricing_calculator_used"
  | "whatsapp_click"
  | "demo_form_submit"
  | "role_demo_click"
  | "certificate_section_view"
  | "credential_section_view"
  | "faq_click";

type DemoForm = {
  nombre: string;
  cargo: string;
  institucion: string;
  tipoInstitucion: string;
  alumnos: string;
  celular: string;
  correo: string;
  intereses: string[];
  mensaje: string;
};

const navItems = [
  ["Problema", "#problema"],
  ["Solución", "#solucion"],
  ["Módulos", "#modulos"],
  ["Carnets y certificados", "#credenciales"],
  ["Demo", "#demo"],
  ["Precios", "#precios"],
  ["FAQ", "#faq"],
];

const painPoints = [
  "Pagos perdidos entre capturas de WhatsApp.",
  "Alumnos y docentes repartidos en Excel.",
  "Asistencia en cuadernos sin reportes reales.",
  "Carnets, constancias y certificados hechos a mano.",
  "Padres y alumnos preguntando lo mismo todos los días.",
  "Dirección sin visibilidad de morosidad, notas y operación.",
];

const journey = [
  ["Agenda demo", "El director solicita una revisión del flujo actual.", CalendarCheck],
  ["Creamos tu institución", "Configuramos marca, sedes, roles y módulos.", Building2],
  ["Cargamos datos", "Alumnos, docentes, personal y apoderados desde Excel.", Upload],
  ["Acceso por rol", "Dirección, docentes, padres y alumnos ven su portal.", Fingerprint],
  ["Gestión diaria", "Asistencia, notas, tareas, comunicados y pagos.", ClipboardCheck],
  ["Documentos QR", "Carnets, fotochecks, constancias y certificados.", QrCode],
  ["Reportes", "Morosidad, avance académico y alertas para dirección.", LayoutDashboard],
  ["Soporte", "Acompañamiento por WhatsApp durante implementación.", MessageCircle],
];

const modules = [
  { icon: Users, title: "Gestión de alumnos", text: "Ficha académica, tutor, salud, pagos, asistencia y documentos.", status: "Incluido" },
  { icon: GraduationCap, title: "Docentes y personal", text: "Contratos, cursos asignados, asistencia, fotochecks y accesos.", status: "Incluido" },
  { icon: CalendarCheck, title: "Asistencia", text: "Registro por docente, alertas por inasistencia y reportes por aula.", status: "Incluido" },
  { icon: Banknote, title: "Pagos y pensiones", text: "Morosidad, vouchers, cuentas bancarias, QR y conciliación manual.", status: "Incluido" },
  { icon: BellRing, title: "Comunicados", text: "Avisos por rol con prioridad, confirmación y trazabilidad.", status: "Incluido" },
  { icon: BookOpen, title: "Aula virtual", text: "Cursos, materiales, tareas, calificaciones y restricción por morosidad.", status: "Incluido" },
  { icon: WalletCards, title: "Carnets y fotochecks", text: "Plantillas, QR, vista previa, impresión y validación pública.", status: "Diferencial" },
  { icon: FileBadge2, title: "Certificados y diplomas", text: "Emisión, reemisión, anulación, PDF y QR verificable.", status: "Diferencial" },
  { icon: LayoutDashboard, title: "Reportes", text: "Panel para dirección con alertas académicas, financieras y operativas.", status: "Incluido" },
  { icon: MonitorSmartphone, title: "App móvil por rol", text: "Experiencia optimizada para padres, alumnos, docentes y dirección.", status: "Próximamente" },
  { icon: QrCode, title: "Verificación QR", text: "Consulta pública sin exponer DNI completo ni datos sensibles.", status: "Incluido" },
  { icon: ShieldCheck, title: "Soporte e implementación", text: "Diagnóstico, carga inicial, capacitación y acompañamiento.", status: "Incluido" },
];

const roleDemos = [
  { role: "director", title: "Demo Director", path: "/login?demo=director", items: ["Morosidad", "Asistencia", "Reportes", "Alumnos", "Comunicados", "Certificados"] },
  { role: "docente", title: "Demo Docente", path: "/login?demo=docente", items: ["Cursos asignados", "Asistencia", "Notas", "Tareas", "Alumnos"] },
  { role: "padre", title: "Demo Padre", path: "/login?demo=padre", items: ["Hijos", "Pagos", "Notas", "Comunicados", "Asistencia"] },
  { role: "alumno", title: "Demo Alumno", path: "/login?demo=alumno", items: ["Cursos", "Tareas", "Notas", "Carnet", "Certificados"] },
];

const plans = [
  { name: "Inicial", price: 5, label: "S/ 5", description: "Para ordenar la operación académica esencial.", features: ["Gestión de alumnos", "Gestión de docentes", "Asistencia básica", "Comunicados", "Portal director", "Soporte estándar"] },
  { name: "Gestión", price: 7, label: "S/ 7", description: "Para sumar control financiero y portal familiar.", features: ["Todo lo del Inicial", "Pagos y pensiones", "Reportes", "Portal de padres", "App móvil", "Importación desde Excel"] },
  { name: "Profesional", price: 10, label: "S/ 10", popular: true, description: "Para instituciones que necesitan documentos verificables.", features: ["Todo lo de Gestión", "Carnets", "Fotochecks", "Certificados", "Constancias", "QR verificable", "Exportación PDF"] },
  { name: "Institucional", price: 0, label: "A medida", description: "Para sedes, integraciones o marca institucional avanzada.", features: ["Marca institucional", "Dominio personalizado", "Integraciones", "Múltiples sedes", "API", "Migración de datos", "Soporte prioritario"] },
];

const interestOptions = ["Gestión académica", "Pagos", "App móvil", "Carnets/fotochecks", "Certificados/constancias", "Aula virtual", "Todo el sistema"];

const faqs = [
  ["¿Doce se compra o se alquila?", "Doce se alquila como plataforma SaaS. Pagas una mensualidad según cantidad de alumnos, módulos y nivel de implementación."],
  ["¿Cuánto cuesta?", "El plan inicial parte desde S/ 5 por alumno al mes. El precio final depende del plan, módulos, cantidad de alumnos y necesidades de soporte."],
  ["¿Puedo empezar con pocos alumnos?", "Sí. La plataforma está pensada para colegios, academias, institutos y centros de capacitación que quieren crecer sin contratar equipo técnico propio."],
  ["¿Puedo importar alumnos desde Excel?", "Sí. La implementación contempla carga inicial desde plantillas de Excel para alumnos, docentes, apoderados y datos operativos."],
  ["¿Sirve para colegios, academias e institutos?", "Sí. La estructura por institución, roles y módulos permite adaptarlo a colegios, academias, institutos, universidades pequeñas y capacitación corporativa."],
  ["¿Puedo emitir certificados con QR?", "Sí. Doce contempla certificados, constancias y diplomas con código verificable públicamente."],
  ["¿Puedo generar carnets o fotochecks?", "Sí. Puedes trabajar carnets de alumnos, fotochecks de docentes/personal y credenciales verificables."],
  ["¿Los padres y alumnos tienen acceso?", "Sí. Cada rol ve su propio portal: dirección, docente, padre y alumno."],
  ["¿Puedo usar mi logo y colores?", "Sí. La marca institucional se configura por cliente para que la plataforma se sienta propia."],
  ["¿Qué pasa si dejo de pagar?", "El acceso puede restringirse según contrato. La disponibilidad histórica y la verificación de documentos se define en la propuesta de servicio."],
  ["¿Los certificados siguen siendo verificables?", "La verificación puede mantenerse según el plan y las condiciones del servicio, incluso si el acceso operativo queda suspendido."],
  ["¿Puedo agendar una demo antes de decidir?", "Sí. La demo sirve para ver cómo quedaría configurada tu institución antes de contratar."],
];

const whatsappOptions = [
  ["Quiero agendar una demo", "Hola Doce. Quiero agendar una demo para ver cómo quedaría configurada mi institución."],
  ["Quiero saber precios", "Hola Doce. Quiero conocer precios según cantidad de alumnos y módulos."],
  ["Certificados con QR", "Hola Doce. Me interesa emitir certificados, constancias o diplomas con QR verificable."],
  ["Carnets para mi institución", "Hola Doce. Quiero información sobre carnets y fotochecks con QR para mi institución."],
  ["Consulta técnica", "Hola Doce. Tengo una consulta técnica sobre implementación, datos o permisos."],
];

const initialForm: DemoForm = {
  nombre: "",
  cargo: "",
  institucion: "",
  tipoInstitucion: "Colegio",
  alumnos: "150",
  celular: "",
  correo: "",
  intereses: ["Todo el sistema"],
  mensaje: "",
};

function trackEvent(event: LandingEventName, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const body = {
    event,
    payload,
    path: window.location.pathname,
    referrer: document.referrer || null,
  };
  window.dispatchEvent(new CustomEvent("doce:landing-event", { detail: body }));
  void fetch("/api/landing-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined);
}

function openWhatsApp(message: string, context: string) {
  trackEvent("whatsapp_click", { context });
  const number = process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "51987088359";
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#ff2432]">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-.045em] text-black sm:text-6xl">{title}</h2>
      {text && <p className="mt-5 text-base font-medium leading-7 text-black/52">{text}</p>}
    </div>
  );
}

function MiniDashboard({ heroAsset }: { heroAsset?: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-[#ff2432]/10 blur-3xl" />
      {heroAsset && <div aria-hidden className="absolute -inset-3 -z-10 rounded-[38px] bg-cover bg-center opacity-20 blur-[2px]" style={{ backgroundImage: `url(${JSON.stringify(heroAsset).slice(1, -1)})` }} />}
      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_35px_120px_-48px_rgba(0,0,0,.48)]">
        <div className="flex h-11 items-center gap-2 border-b border-black/[.06] px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff2432]" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="ml-auto text-[10px] font-black uppercase tracking-[.18em] text-black/30">Doce OS</span>
        </div>
        <div className="grid min-h-[420px] grid-cols-[116px_1fr] bg-[#f8f8f6] sm:grid-cols-[160px_1fr]">
          <aside className="border-r border-black/[.06] bg-white p-4">
            <BrandMark className="mb-8 !w-[78px]" />
            {["Resumen", "Pagos", "Alumnos", "Carnets", "Certificados"].map((item, index) => (
              <div key={item} className={`mb-2 rounded-2xl px-3 py-2.5 text-[10px] font-black sm:text-xs ${index === 0 ? "bg-black text-white" : "text-black/42"}`}>{item}</div>
            ))}
          </aside>
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff2432]">Dirección general</p>
                <h3 className="mt-1 text-xl font-black tracking-[-.035em] sm:text-3xl">Colegio ordenado en tiempo real</h3>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] text-emerald-600">Activo</div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[["1,284", "alumnos"], ["S/ 38k", "por cobrar"], ["98%", "asistencia"]].map(([value, label]) => (
                <div key={label} className="rounded-[22px] border border-black/[.06] bg-white p-3 sm:p-4">
                  <p className="text-lg font-black tracking-[-.035em] sm:text-2xl">{value}</p>
                  <p className="text-[9px] font-semibold text-black/38 sm:text-[11px]">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_150px]">
              <div className="rounded-[24px] bg-black p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-white/42">Flujo del día</p>
                    <p className="mt-1 text-sm font-bold">Pagos, asistencia y certificados</p>
                  </div>
                  <CirclePlay className="h-8 w-8 text-[#ff2432]" />
                </div>
                <div className="mt-5 space-y-3">
                  {["Docente registró asistencia", "Padre adjuntó voucher", "Dirección emitió certificado"].map((item, idx) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">{idx + 1}</span>
                      <span className="text-xs font-semibold text-white/72">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-black/[.06] bg-white p-4">
                <QrCode className="h-6 w-6 text-[#ff2432]" />
                <p className="mt-6 text-xs font-black">QR verificable</p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-black/42">Carnet y certificado sin falsificación manual.</p>
                <div className="mt-4 grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, index) => <span key={index} className={`h-2 rounded-[2px] ${index % 3 === 0 || index % 7 === 0 ? "bg-black" : "bg-black/[.06]"}`} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CredentialMockups() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-[30px] border border-black/[.07] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/35">Carnet alumno</p>
        <div className="mt-5 overflow-hidden rounded-[22px] bg-gradient-to-br from-black to-[#292929] p-5 text-white">
          <div className="flex items-center justify-between"><BrandMark className="invert" /><QrCode className="h-7 w-7 text-[#ff2432]" /></div>
          <div className="mt-10 h-14 w-14 rounded-2xl bg-white/18" />
          <p className="mt-4 text-xl font-black">Mateo Castro</p>
          <p className="text-xs font-semibold text-white/50">1ro Primaria · Sección A</p>
          <p className="mt-6 font-mono text-[10px] text-white/35">ID DOCE-ALU-2026-001</p>
        </div>
      </div>
      <div className="rounded-[30px] border border-black/[.07] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/35">Fotocheck docente</p>
        <div className="mt-5 rounded-[22px] border border-black/[.06] bg-[#f8f8f6] p-5">
          <div className="mx-auto h-24 w-24 rounded-full bg-[#ffe4e6]" />
          <p className="mt-5 text-center text-xl font-black">María Gutiérrez</p>
          <p className="text-center text-xs font-semibold text-black/42">Docente · Matemática</p>
          <div className="mt-5 rounded-2xl bg-white p-3 text-center font-mono text-[10px] text-black/45">DOC-QR-8K21-PE</div>
        </div>
      </div>
      <div className="rounded-[30px] border border-black/[.07] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/35">Certificado QR</p>
        <div className="mt-5 rounded-[22px] border border-black/[.08] bg-white p-6 shadow-[inset_0_0_0_8px_#f8f8f6]">
          <BadgeCheck className="h-8 w-8 text-[#ff2432]" />
          <p className="mt-8 text-[10px] font-black uppercase tracking-[.18em] text-black/35">Certificado</p>
          <p className="mt-1 text-2xl font-black tracking-[-.035em]">Gestión educativa digital</p>
          <p className="mt-3 text-xs leading-5 text-black/45">Emitido, descargable, anulable y verificable por QR público.</p>
          <div className="mt-6 flex items-end justify-between">
            <div className="h-px w-28 bg-black/20" />
            <QrCode className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {open && (
        <div className="mb-3 w-[300px] rounded-[26px] border border-black/[.08] bg-white p-3 shadow-[0_30px_80px_-35px_rgba(0,0,0,.55)]">
          <div className="px-2 py-2">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">WhatsApp Doce</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-black/45">Elige el motivo y abrimos un mensaje listo.</p>
          </div>
          <div className="mt-2 space-y-1">
            {whatsappOptions.map(([label, message]) => (
              <button key={label} onClick={() => openWhatsApp(message, label)} className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-xs font-black text-black transition hover:bg-[#f8f8f6]">
                {label}<ArrowRight className="h-3.5 w-3.5 text-[#ff2432]" />
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen((current) => !current)} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_-18px_rgba(37,211,102,.9)]" aria-label="Abrir opciones de WhatsApp">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<DemoForm>(initialForm);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [students, setStudents] = useState(150);
  const [selectedPlan, setSelectedPlan] = useState("Inicial");
  const [openFaq, setOpenFaq] = useState(0);
  const heroAsset = useBrandAsset("hero");
  const activePlan = plans.find((plan) => plan.name === selectedPlan) ?? plans[0];
  const estimated = activePlan.price * students;

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  useEffect(() => {
    if (user && !loading && window.self === window.top) router.replace(`/${user.rol}`);
  }, [user, loading, router]);

  const toggleInterest = (interest: string) => {
    setForm((current) => {
      const exists = current.intereses.includes(interest);
      const intereses = exists ? current.intereses.filter((item) => item !== interest) : [...current.intereses, interest];
      return { ...current, intereses: intereses.length ? intereses : [interest] };
    });
  };

  const submitDemo = async (event: FormEvent) => {
    event.preventDefault();
    setFormStatus("sending");
    trackEvent("demo_form_submit", { institucion: form.institucion, alumnos: form.alumnos, intereses: form.intereses });
    await fetch("/api/landing-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => undefined);
    setFormStatus("sent");
    const message = [
      "Hola Doce. Quiero agendar una demo.",
      `Nombre: ${form.nombre}`,
      `Cargo: ${form.cargo}`,
      `Institución: ${form.institucion}`,
      `Tipo: ${form.tipoInstitucion}`,
      `Alumnos: ${form.alumnos}`,
      `Correo: ${form.correo}`,
      `Intereses: ${form.intereses.join(", ")}`,
      form.mensaje ? `Mensaje: ${form.mensaje}` : "",
    ].filter(Boolean).join("\n");
    openWhatsApp(message, "demo_form_submit");
  };

  const handlePricingChange = (nextStudents: number, nextPlan = selectedPlan) => {
    setStudents(nextStudents);
    if (nextPlan !== selectedPlan) setSelectedPlan(nextPlan);
    trackEvent("pricing_calculator_used", { students: nextStudents, plan: nextPlan });
  };

  const demoClick = (role: string, path: string) => {
    trackEvent("role_demo_click", { role });
    router.push(path);
  };

  const heroDemoClick = () => {
    trackEvent("hero_cta_click");
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  const pricingSection = useMemo(() => (
    <section id="precios" className="px-5 py-24 lg:px-8 lg:py-32" onMouseEnter={() => trackEvent("pricing_view")}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Precios" title="Alquila Doce desde S/ 5 por alumno al mes." text="No compras un sistema. Alquilas una plataforma educativa que se adapta al tamaño, módulos y operación de tu institución." />
          <div className="rounded-[28px] border border-black/[.07] bg-white p-5 shadow-sm lg:w-[360px]">
            <div className="flex items-center gap-3"><Calculator className="h-5 w-5 text-[#ff2432]" /><p className="text-xs font-black uppercase tracking-[.16em] text-black/45">Calculadora referencial</p></div>
            <label className="mt-5 block text-[10px] font-black uppercase tracking-[.12em] text-black/40">Cantidad de alumnos</label>
            <input type="range" min={20} max={1200} step={10} value={students} onChange={(event) => handlePricingChange(Number(event.target.value))} className="mt-3 w-full accent-[#ff2432]" />
            <div className="mt-2 flex items-center justify-between text-xs font-bold text-black/45"><span>20</span><span>{students} alumnos</span><span>1200</span></div>
            <select value={selectedPlan} onChange={(event) => handlePricingChange(students, event.target.value)} className="mt-5 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold outline-none">
              {plans.filter((plan) => plan.price > 0).map((plan) => <option key={plan.name}>{plan.name}</option>)}
            </select>
            <div className="mt-5 rounded-2xl bg-black p-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-white/40">Inversión estimada</p>
              <p className="mt-1 text-3xl font-black tracking-[-.04em]">S/ {estimated.toLocaleString("es-PE")}</p>
              <p className="text-[11px] font-medium text-white/45">al mes en plan {selectedPlan}. Referencial, sujeto a demo.</p>
            </div>
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex flex-col rounded-[28px] border p-7 ${plan.popular ? "border-black bg-black text-white" : "border-black/[.08] bg-white"}`}>
              {plan.popular && <span className="absolute right-5 top-5 rounded-full bg-[#ff2432] px-3 py-1 text-[9px] font-black uppercase tracking-[.16em]">Recomendado</span>}
              <h3 className="text-lg font-black">{plan.name}</h3>
              <p className="mt-5 text-4xl font-black tracking-[-.04em]">{plan.label}</p>
              {plan.price > 0 && <p className={`text-xs font-semibold ${plan.popular ? "text-white/45" : "text-black/40"}`}>por alumno / mes</p>}
              <p className={`mt-5 text-sm leading-6 ${plan.popular ? "text-white/55" : "text-black/50"}`}>{plan.description}</p>
              <div className={`my-6 h-px ${plan.popular ? "bg-white/10" : "bg-black/[.06]"}`} />
              <ul className="flex-1 space-y-3 text-xs font-semibold">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#ff2432]" />{feature}</li>)}</ul>
              <a href="#demo" onClick={() => trackEvent("demo_cta_click", { source: `plan_${plan.name}` })} className={`mt-8 rounded-full py-3 text-center text-xs font-bold ${plan.popular ? "bg-white text-black" : "bg-[#f2f2ef]"}`}>Solicitar propuesta</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  ), [activePlan, estimated, selectedPlan, students]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f5] text-black">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[.06] bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#inicio" aria-label="Doce, inicio"><BrandMark priority /></a>
          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-black/55 lg:flex">
            {navItems.map(([label, href]) => <a key={href} href={href} className="hover:text-black">{label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => router.push("/login")} className="rounded-full px-5 py-2.5 text-sm font-bold hover:bg-black/5">Acceso demo</button>
            <a href="#demo" onClick={() => trackEvent("demo_cta_click", { source: "header" })} className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff2432]">Agendar demo</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2 lg:hidden" aria-label="Abrir menú">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="border-t border-black/5 bg-white p-5 lg:hidden">
            <div className="grid gap-3 text-sm font-bold">
              {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-2xl bg-[#f8f8f6] px-4 py-3">{label}</a>)}
              <button onClick={() => router.push("/login")} className="rounded-full bg-black py-3 text-white">Acceso demo</button>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="relative px-5 pb-20 pt-34 lg:px-8 lg:pb-32 lg:pt-44">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[.15em] shadow-sm"><Sparkles className="h-3.5 w-3.5 text-[#ff2432]" /> SaaS educativo alquilable</div>
            <h1 className="mt-7 max-w-[780px] text-[44px] font-black leading-[.96] tracking-[-.058em] sm:text-[66px] lg:text-[78px]">Administra tu institución sin Excel, sin papeles y sin perseguir información por WhatsApp.</h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-7 text-black/55 sm:text-lg">Doce centraliza alumnos, docentes, pagos, asistencia, carnets, certificados y reportes en una sola plataforma alquilada por alumno.</p>
            <div className="mt-7 grid gap-2 text-sm font-bold text-black/62 sm:grid-cols-2">
              {["Control académico y administrativo en tiempo real.", "Portal para dirección, docentes, padres y alumnos.", "Carnets, fotochecks y certificados con QR verificable.", "Desde S/ 5 por alumno al mes."].map((item) => <span key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff2432]" />{item}</span>)}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={heroDemoClick} className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ff2432]">Agendar demo gratuita <ArrowRight className="h-4 w-4" /></button>
              <a href="#recorrido" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold">Ver cómo funciona <ChevronRight className="h-4 w-4" /></a>
            </div>
          </div>
          <MiniDashboard heroAsset={heroAsset} />
        </div>
      </section>

      <section className="border-y border-black/[.06] bg-white px-5 py-7">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center text-xs font-black uppercase tracking-[.18em] text-black/35">
          <span>Colegios</span><span>Academias</span><span>Institutos</span><span>Universidades</span><span>Capacitación corporativa</span>
        </div>
      </section>

      <section id="problema" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <SectionTitle eyebrow="Problema real" title="El cliente no compra tecnología. Compra orden operativo." text="La institución pierde tiempo buscando datos, validando pagos, respondiendo mensajes y armando documentos manualmente." />
          <div className="grid gap-3 sm:grid-cols-2">
            {painPoints.map((point, index) => <div key={point} className="rounded-[24px] border border-black/[.07] bg-white p-5"><span className="text-[10px] font-black text-[#ff2432]">0{index + 1}</span><p className="mt-4 text-sm font-bold leading-6">{point}</p></div>)}
          </div>
        </div>
      </section>

      <section id="recorrido" className="bg-white px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Así funciona Doce" title="Un recorrido completo antes de entrar a la demo." text="Copiamos la lógica que reduce incertidumbre: mostrar paso a paso cómo se vive la plataforma, pero aplicado a gestión educativa completa." />
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {journey.map(([title, text, Icon], index) => {
              const I = Icon as typeof Building2;
              return (
                <article key={title as string} className="group rounded-[28px] border border-black/[.07] bg-[#f8f8f6] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white"><I className="h-5 w-5 text-[#ff2432]" /></div>
                    <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] text-black/35">Paso {index + 1}</span>
                  </div>
                  <h3 className="mt-7 text-lg font-black tracking-[-.02em]">{title as string}</h3>
                  <p className="mt-2 text-xs font-medium leading-5 text-black/50">{text as string}</p>
                  <div className="mt-6 h-1.5 rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-[#ff2432]" style={{ width: `${((index + 1) / journey.length) * 100}%` }} /></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="solucion" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="No es solo aula virtual" title="Una aula virtual enseña. Doce también administra." text="La competencia puede entregar cursos y certificados. Doce combina gestión institucional, aula virtual, pagos y documentos verificables." />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[32px] border border-black/[.07] bg-white p-8">
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-black/35">Aula virtual tradicional</p>
              <ul className="mt-8 space-y-4 text-sm font-semibold text-black/50">
                {["Cursos", "Clases grabadas", "Evaluaciones", "Certificados básicos"].map((item) => <li key={item} className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-black/20" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-[32px] bg-black p-8 text-white">
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#ff2432]">Doce</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Alumnos", "Docentes", "Padres", "Pagos", "Morosidad", "Asistencia", "Comunicados", "Carnets", "Fotochecks", "Certificados con QR", "Reportes", "Multi-institución"].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/7 px-3 py-3 text-xs font-bold"><Check className="h-4 w-4 text-[#ff2432]" />{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modulos" className="bg-white px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Módulos" title="Todo lo necesario para operar una institución moderna." />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((module) => (
              <article key={module.title} className="rounded-[28px] border border-black/[.07] bg-[#f8f8f6] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white"><module.icon className="h-5 w-5 text-[#ff2432]" /></div>
                  <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] ${module.status === "Próximamente" ? "bg-amber-50 text-amber-700" : module.status === "Diferencial" ? "bg-[#fff1f2] text-[#ff2432]" : "bg-white text-black/35"}`}>{module.status}</span>
                </div>
                <h3 className="mt-6 text-lg font-black tracking-[-.02em]">{module.title}</h3>
                <p className="mt-2 text-xs font-medium leading-5 text-black/50">{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="credenciales" className="px-5 py-24 lg:px-8 lg:py-32" onMouseEnter={() => { trackEvent("certificate_section_view"); trackEvent("credential_section_view"); }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <SectionTitle eyebrow="Diferencial comercial" title="Genera carnets, fotochecks y certificados sin depender de diseño manual." text="Crea documentos para alumnos, docentes, personal o participantes con QR verificable y vista previa lista para imprimir." />
            <div className="grid gap-3 text-xs font-bold text-black/58 sm:grid-cols-2">
              {["Plantillas editables", "QR automático", "Código de barras opcional", "Exportación PDF", "Impresión A4", "Generación masiva", "Validación pública", "Anulación y reemisión"].map((item) => <span key={item} className="flex gap-2"><Check className="h-4 w-4 text-[#ff2432]" />{item}</span>)}
            </div>
          </div>
          <div className="mt-14"><CredentialMockups /></div>
          <a href="#demo" onClick={() => trackEvent("demo_cta_click", { source: "credentials" })} className="mt-10 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white hover:bg-[#ff2432]">Quiero ver esta función en la demo <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>

      <section id="verificacion" className="bg-black px-5 py-24 text-white lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#ff2432]">Verificación pública</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-6xl">Cualquier persona puede validar un certificado o carnet por QR.</h2>
            <p className="mt-5 text-base font-medium leading-7 text-white/55">La consulta pública muestra únicamente información necesaria: institución, titular parcialmente identificable, programa o rol, fecha y estado.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/verificar/certificado" className="rounded-full bg-white px-6 py-3.5 text-center text-sm font-bold text-black">Verificar certificado</a>
              <a href="/verificar/carnet" className="rounded-full border border-white/15 px-6 py-3.5 text-center text-sm font-bold text-white">Verificar carnet</a>
            </div>
          </div>
          <div className="rounded-[32px] bg-white p-6 text-black">
            <div className="rounded-[26px] border border-black/[.07] bg-[#f8f8f6] p-6">
              <div className="flex items-center gap-3"><BadgeCheck className="h-8 w-8 text-emerald-600" /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">Documento válido</p><h3 className="text-2xl font-black tracking-[-.035em]">Juan P.</h3></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[["Institución", "Colegio Demo Doce"], ["Programa", "Diplomado en Gestión"], ["Emisión", "26/06/2026"], ["Estado", "Vigente"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-4"><p className="text-[9px] font-black uppercase tracking-[.14em] text-black/30">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>)}
              </div>
              <div className="mt-6 rounded-2xl border border-black/[.07] bg-white p-4 text-[10px] font-semibold leading-4 text-black/38">DNI protegido: 7•••••42. No se exponen datos sensibles completos.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo-roles" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Demo por rol" title="Prueba la plataforma como la verá cada usuario." text="La demo pública no expone credenciales reales. Cada acceso se presenta como experiencia aislada para entender el valor por rol." />
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleDemos.map((demo) => (
              <article key={demo.role} className="rounded-[28px] border border-black/[.07] bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#ff2432]"><Users className="h-5 w-5" /></div>
                <h3 className="mt-6 text-xl font-black tracking-[-.02em]">{demo.title}</h3>
                <ul className="mt-5 space-y-2 text-[11px] font-bold text-black/58">{demo.items.map((item) => <li key={item} className="flex gap-2"><Check className="h-4 w-4 text-[#ff2432]" />{item}</li>)}</ul>
                <button onClick={() => demoClick(demo.role, demo.path)} className="mt-7 w-full rounded-full bg-black py-3 text-xs font-bold text-white hover:bg-[#ff2432]">Probar demo</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {pricingSection}

      <section id="implementacion" className="bg-white px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <SectionTitle eyebrow="Implementación" title="No tienes que empezar desde cero. Nosotros ordenamos contigo." text="El miedo al cambio se reduce con diagnóstico, carga inicial, personalización y capacitación por rol." />
          <div className="grid gap-3">
            {["Diagnóstico de institución", "Configuración de cuenta", "Carga de alumnos y docentes", "Personalización de logo y colores", "Activación de módulos", "Capacitación del equipo", "Lanzamiento interno"].map((step, index) => <div key={step} className="flex items-center gap-4 rounded-[22px] border border-black/[.07] bg-[#f8f8f6] p-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-black text-white">{index + 1}</span><p className="text-sm font-black">{step}</p></div>)}
          </div>
        </div>
      </section>

      <section id="seguridad" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Confianza" title="Seguridad comprensible para dirección, administración y familias." />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Accesos por rol", "Información separada por institución", "Backups", "Control de permisos", "Historial de acciones", "QR verificable", "Soporte", "Almacenamiento seguro"].map((item) => <div key={item} className="rounded-[24px] border border-black/[.07] bg-white p-5"><ShieldCheck className="h-5 w-5 text-[#ff2432]" /><p className="mt-4 text-sm font-black">{item}</p></div>)}
          </div>
        </div>
      </section>

      <section id="demo" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[36px] bg-[#ff2432] lg:grid-cols-[.9fr_1.1fr]">
          <div className="p-8 text-white sm:p-12 lg:p-16">
            <GraduationCap className="h-9 w-9" />
            <h2 className="mt-8 text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-6xl">Agenda una demo y mira cómo quedaría configurada tu institución.</h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/75">Usaremos tus datos para armar una conversación concreta: alumnos, módulos, pagos, documentos y flujo por rol.</p>
          </div>
          <form onSubmit={submitDemo} className="m-3 rounded-[30px] bg-white p-6 sm:p-8 lg:m-5 lg:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Cargo<input required value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Institución<input required value={form.institucion} onChange={(e) => setForm({ ...form, institucion: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Tipo<select value={form.tipoInstitucion} onChange={(e) => setForm({ ...form, tipoInstitucion: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none"><option>Colegio</option><option>Academia</option><option>Instituto</option><option>Universidad</option><option>Centro de capacitación</option></select></label>
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Cantidad de alumnos<input required value={form.alumnos} onChange={(e) => setForm({ ...form, alumnos: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Celular<input required value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45 sm:col-span-2">Correo<input required type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.12em] text-black/45">Módulos de interés</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {interestOptions.map((interest) => <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`rounded-full px-3 py-2 text-[10px] font-black ${form.intereses.includes(interest) ? "bg-black text-white" : "bg-[#f8f8f6] text-black/55"}`}>{interest}</button>)}
            </div>
            <label className="mt-5 block text-[10px] font-black uppercase tracking-[.12em] text-black/45">Mensaje opcional<textarea value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="mt-2 min-h-24 w-full rounded-2xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none" /></label>
            <button disabled={formStatus === "sending"} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-bold text-white disabled:opacity-60">{formStatus === "sending" ? "Enviando..." : "Solicitar diagnóstico"} <ArrowRight className="h-4 w-4" /></button>
            {formStatus === "sent" && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">Solicitud registrada. También abrimos WhatsApp con el mensaje prellenado.</p>}
          </form>
        </div>
      </section>

      <section id="faq" className="bg-white px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <SectionTitle eyebrow="Preguntas frecuentes" title="Respuestas directas antes de agendar." />
          <div className="space-y-3">
            {faqs.map(([question, answer], index) => (
              <button key={question} onClick={() => { setOpenFaq(openFaq === index ? -1 : index); trackEvent("faq_click", { question }); }} className="w-full rounded-[22px] border border-black/[.07] bg-[#f8f8f6] p-5 text-left">
                <div className="flex items-center justify-between gap-5"><p className="text-sm font-black">{question}</p><ChevronRight className={`h-4 w-4 shrink-0 transition ${openFaq === index ? "rotate-90 text-[#ff2432]" : "text-black/35"}`} /></div>
                {openFaq === index && <p className="mt-4 text-sm font-medium leading-6 text-black/52">{answer}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[.06] bg-white px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><BrandMark /><p className="mt-2 text-xs text-black/35">Sistema operativo educativo: gestión, aula virtual y documentos verificables.</p></div>
          <p className="text-xs text-black/35">© 2026 Doce. Plataforma SaaS educativa alquilable.</p>
        </div>
      </footer>
      <WhatsAppLauncher />
    </main>
  );
}
