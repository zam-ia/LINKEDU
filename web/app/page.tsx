'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Pause, 
  CheckCircle2, 
  ChevronRight, 
  Monitor, 
  Smartphone, 
  BookOpen, 
  Users, 
  CreditCard, 
  Shield, 
  GraduationCap, 
  Clock, 
  Check, 
  HelpCircle, 
  Layers, 
  Settings, 
  FileSpreadsheet, 
  Lock, 
  AlertCircle, 
  MessageSquare,
  Volume2,
  VolumeX,
  Plus,
  Activity,
  Bell,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';

// Componente ScrollReveal premium para animaciones fluidas tipo motion graphics
function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 600, 
  animation = "fade-in-up" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number; 
  duration?: number; 
  animation?: "fade-in-up" | "slide-in-left" | "slide-in-right" | "scale-up";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getInitialStyle = () => {
    if (animation === "fade-in-up") return { opacity: 0, transform: "translateY(24px)" };
    if (animation === "slide-in-left") return { opacity: 0, transform: "translateX(-32px)" };
    if (animation === "slide-in-right") return { opacity: 0, transform: "translateX(32px)" };
    if (animation === "scale-up") return { opacity: 0, transform: "scale(0.96)" };
    return { opacity: 0 };
  };

  const getVisibleStyle = () => {
    return { opacity: 1, transform: "translateY(0) translateX(0) scale(1)" };
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transitionProperty: "all",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...(isVisible ? getVisibleStyle() : getInitialStyle())
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  // Redirigir al panel directamente si el usuario ya está autenticado,
  // pero evitar la redirección si la página se está visualizando en un iframe (como en la vista previa del superadmin).
  useEffect(() => {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (user && !loading && !isIframe) {
      window.location.href = `/${user.rol}`;
    }
  }, [user, loading]);

  // Navigation and Interactive States
  const [activePortalTab, setActivePortalTab] = useState<'director' | 'docente' | 'padre' | 'alumno'>('director');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(25); // Simulated progress in VSL
  
  // CTA Form States
  const [directorEmail, setDirectorEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // VSL Config loaded dynamically from LocalStorage (with SSR safety)
  // Default values set to the high-converting copy from the commercial dossier
  const [vslConfig, setVslConfig] = useState({
    // Section 1: Hero
    heroTitle: "Deja de administrar tu colegio entre",
    heroGradient: "Excel, WhatsApp y papeles.",
    heroTitleEnd: "",
    heroSubtitle: "Centraliza pensiones, notas, asistencias, tareas, comunicados y reportes en una sola plataforma con app móvil para dirección, docentes, padres y alumnos.",
    heroBullets: [
      "Control financiero de pensiones y morosidad.",
      "App móvil para padres y alumnos en tiempo real.",
      "Registro digital de notas, asistencia y boletines.",
      "Dashboard de control unificado para dirección.",
      "Demo personalizada para tu institución."
    ],
    videoUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    whatsappNumber: "51987088359",
    whatsappTemplate: 'Hola Linkedu! Vengo de la landing page. Me interesa agendar una demostración gratuita en vivo. Mi colegio es: "{schoolName}" y mi correo corporativo de contacto es: "{directorEmail}". ¿Cuándo podríamos programarla?',
    
    // Subtitles loop based on VSL Hook & Core script (Template 3 VSL Express)
    subtitles: [
      "¿Tu colegio todavía controla pensiones en Excel, notas en hojas sueltas, asistencias en cuadernos y comunicados por WhatsApp?",
      "Entonces presta atención, porque en esta demo te voy a mostrar cómo Linkedu puede ayudarte a centralizar la gestión de tu colegio.",
      "Linkedu es el panel de control que ordena tu colegio y mejora la experiencia de padres, docentes y dirección.",
      "En lugar de tener todo disperso, tu colegio trabaja desde un solo ecosistema digital con accesos independientes.",
      "Agenda una demo y mira cómo se vería tu colegio funcionando con Linkedu. ¡Escríbenos!",
      "Linkedu: el control de tu colegio en una sola plataforma."
    ],

    // Section 2: Problema
    problemTitle: "Tu colegio no necesita más papeles. Necesita más control.",
    problemSubtitle: "Cuando la información está repartida entre Excel, WhatsApp, cuadernos y hojas sueltas, el colegio pierde tiempo, claridad y autoridad frente a los padres.",
    problemMessage: "Linkedu fue creado justamente para resolver ese desorden.",

    // Section 3: Nueva Solución
    solutionTitle: "Todo tu colegio conectado en una sola plataforma.",
    solutionSubtitle: "Linkedu conecta a toda la comunidad educativa. La dirección controla finanzas, los profesores registran notas, los padres revisan pensiones y los alumnos consultan tareas.",

    // Section 5: Beneficios
    benefitsTitle: "Lo que cambia con Linkedu:",

    // Section 6: Prueba
    proofTitle: "Mira Linkedu funcionando con datos reales de prueba.",
    proofSubtitle: "En la demo personalizada podrás ver cómo se visualiza el panel de dirección, cómo un docente registra asistencia y notas, y cómo un padre revisa pensiones y calificaciones.",

    // Section 7: Oferta
    offerTitle: "Agenda una demo y mira cómo se vería tu colegio dentro de Linkedu.",

    // Section 9: Garantía
    guaranteeTitle: "No tienes que decidir nada hoy.",
    guaranteeText: "Primero mira la plataforma, revisamos tu caso y te mostramos cuál sería el mejor plan según el tamaño y necesidades de tu colegio de forma consultiva.",

    // Section 10: CTA Final
    ctaFinalTitle: "Tu colegio puede seguir administrándose con Excel… o puede dar el salto a una gestión moderna.",
    ctaFinalText: "Cada mes que pasa con información desordenada significa más tiempo perdido, más consultas repetidas, más riesgo de morosidad y menos control para dirección."
  });

  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linkedu_vsl_config');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setVslConfig(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (e) {
          console.error("Error loading VSL config from local storage", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress(prev => (prev >= 100 ? 0 : prev + 0.4));
        // Rotate subtitle simulation every 6 seconds
        setSubtitleIndex(prev => (prev >= vslConfig.subtitles.length - 1 ? 0 : prev + 1));
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, vslConfig.subtitles]);

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorEmail || !schoolName) return;
    setIsSubmitted(true);

    // Save lead to local storage dynamically
    if (typeof window !== 'undefined') {
      try {
        const { getStoredLeads, saveStoredLeads } = require('@/lib/supabase/client');
        const currentLeads = getStoredLeads();
        const newLead = {
          id: crypto.randomUUID(),
          nombre: 'Director de Colegio',
          email: directorEmail,
          colegio: schoolName,
          telefono: '+51 987 088 359',
          fecha: new Date().toISOString().split('T')[0],
          atendido: false
        };
        saveStoredLeads([newLead, ...currentLeads]);
      } catch (err) {
        console.error("Error saving lead to local storage", err);
      }
    }

    // Form pre-filled WhatsApp message replacing templates
    let message = vslConfig.whatsappTemplate
      .replace('{schoolName}', schoolName)
      .replace('{directorEmail}', directorEmail);
      
    const cleanNumber = vslConfig.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    // Smooth delay before redirecting to allow user to see success state
    setTimeout(() => {
      window.open(waUrl, '_blank');
      setIsSubmitted(false);
    }, 1200);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-gray-900 overflow-x-hidden font-sans">
      
      {/* --- ELITE GLASSMORPHIC HEADER --- */}
      <header className="sticky top-0 z-50 w-full glassmorphism border-b border-gray-200/40 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#01017b] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#01017b]/15 tracking-tighter">
              L
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#01017b] block">LINKEDU</span>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block -mt-1">Ecosistema EdTech</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-wider text-gray-500">
            <a href="#problema" className="hover:text-[#01017b] transition-colors">El Problema</a>
            <a href="#solucion" className="hover:text-[#01017b] transition-colors">La Solución</a>
            <a href="#portales" className="hover:text-[#01017b] transition-colors">Los 4 Portales</a>
            <a href="#beneficios" className="hover:text-[#01017b] transition-colors">Beneficios</a>
            <a href="#demo" className="hover:text-[#01017b] transition-colors">Agendar Demo</a>
            <a href="#precios" className="hover:text-[#01017b] transition-colors">Planes</a>
          </nav>

          {/* CTA Action Button */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#01017b] border-t-transparent"></div>
            ) : user ? (
              <button
                onClick={() => window.location.href = `/${user.rol}`}
                className="px-5 py-2.5 bg-[#EEF1FE] hover:bg-[#EEF1FE]/80 text-[#01017b] text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs border border-transparent hover:border-[#01017b]/10 hover:scale-102 active:scale-98"
              >
                Ir al Panel
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#01017b]/10 hover:scale-102 active:scale-98"
              >
                Acceso Intranet
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- SECCIÓN 1: HERO & VIDEO SALES LETTER (VSL) --- */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#EEF1FE]/50 via-white to-[#F8F9FA] overflow-hidden">
        {/* Soft Mesh Gradient Backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40 z-0">
          <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-[#7EC8C8]/20 blur-3xl animate-pulse duration-[8000ms]" />
          <div className="absolute top-36 right-10 w-[450px] h-[450px] rounded-full bg-[#9B7FD4]/15 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
          {/* Live Styled Badge (Not AI-sounding tagline) */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-full text-[10px] font-black text-red-650 uppercase tracking-widest shadow-xs animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            🔴 DEMOSTRACIÓN EN VIVO
          </div>

          {/* Dynamic Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 max-w-5xl mx-auto leading-[1.08] text-balance animate-fade-in-up">
            {vslConfig.heroTitle} <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#01017b] via-[#4F6AF0] to-[#9B7FD4] bg-clip-text text-transparent">
              {vslConfig.heroGradient}
            </span>
            {vslConfig.heroTitleEnd}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in-up">
            {vslConfig.heroSubtitle}
          </p>

          {/* Main Hero Grid: Video Player + Conversion Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 max-w-6xl mx-auto text-left">
            
            {/* Interactive VSL Video Player */}
            <div className="lg:col-span-7 premium-card p-3 bg-gray-900/5 border border-gray-200/50 rounded-3xl overflow-hidden shadow-2xl relative animate-float">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950">
                
                {/* Simulated Player Controls and Text Overlays */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 z-10 select-none bg-gradient-to-t from-black/85 via-black/20 to-black/60">
                  
                  {/* Top bar info */}
                  <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-xl border border-white/5 backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[9px] font-black text-white uppercase tracking-wider bg-red-650/90 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        DEMOSTRACIÓN EN VIVO
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-200 font-extrabold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md border border-white/5">
                      VSL Express • 3-5 Min
                    </span>
                  </div>

                  {/* Play Center Overlay */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="h-16 w-16 rounded-full bg-white/95 text-[#01017b] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-30 animate-pulse"
                      >
                        <Play className="w-6 h-6 fill-[#01017b] ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Dashboard Live Graphic inside player */}
                  <div className="flex-1 flex items-center justify-center p-3 opacity-90">
                    <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 shadow-2xl text-left scale-90 sm:scale-100 transition-transform">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-[8px] text-white/60 font-mono">
                        <span className="flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> LINKEDU Ecosistema Escolar</span>
                        <span>Multi-tenant</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-white">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <span className="text-[7px] text-white/50 block font-bold uppercase">Pensiones Cobradas</span>
                          <span className="text-xs font-black text-[#7EC8C8] block">S/. 142,500</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <span className="text-[7px] text-white/50 block font-bold uppercase">Eficiencia de Recaudo</span>
                          <span className="text-xs font-black text-green-300 block">96.8%</span>
                        </div>
                      </div>

                      <div className="mt-2 bg-[#EEF1FE]/10 border border-[#EEF1FE]/20 rounded-lg p-2 flex items-center justify-between text-[8px] text-white/90 font-bold">
                        <span className="flex items-center gap-1"><Bell className="w-2.5 h-2.5 text-[#7EC8C8]" /> Notificaciones de Deuda automáticas:</span>
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded uppercase font-black">Activas</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle simulation bar */}
                  <div className="w-full text-center">
                    <p className="inline-block text-[11px] sm:text-xs font-black text-white bg-black/70 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs min-h-[40px] leading-relaxed transition-all max-w-xl mx-auto text-center">
                      {vslConfig.subtitles[subtitleIndex]}
                    </p>
                  </div>

                  {/* Player bottom controls bar */}
                  <div className="flex items-center gap-2 border-t border-white/10 pt-2.5 mt-1.5 bg-black/45 p-2 rounded-xl backdrop-blur-xs">
                    <button 
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="text-white hover:text-[#7EC8C8] transition-colors cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    </button>

                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden relative cursor-pointer">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7EC8C8] to-[#9B7FD4] transition-all" 
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>

                    <div className="text-[8px] text-white font-mono">
                      {Math.floor((videoProgress * 4.8) / 60)}:{(Math.floor((videoProgress * 4.8) % 60)).toString().padStart(2, '0')} / 8:00
                    </div>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-[#7EC8C8] transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Simulated Backdrop Image or Real Video */}
                {vslConfig.videoUrl && (
                  vslConfig.videoUrl.endsWith('.mp4') || 
                  vslConfig.videoUrl.endsWith('.webm') || 
                  vslConfig.videoUrl.startsWith('data:video/')
                ) ? (
                  <video
                    src={vslConfig.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                  />
                ) : (
                  <div 
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ${
                      isVideoPlaying ? 'scale-110 rotate-1' : 'scale-100'
                    }`}
                    style={{ backgroundImage: `url(${vslConfig.videoUrl})` }}
                  />
                )}
              </div>
            </div>

            {/* Above the fold Form & Bullets */}
            <div className="lg:col-span-5 space-y-5 bg-white border border-gray-200 p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#7EC8C8]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  Agendar Demo Gratuita y Diagnóstico ➔
                </h3>
                
                <ul className="space-y-2">
                  {vslConfig.heroBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 font-semibold leading-relaxed">
                      <Check className="w-4 h-4 text-[#7EC8C8] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleCtaSubmit} className="space-y-3 pt-3 border-t border-gray-100">
                <div className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="Tu Correo Corporativo del Director"
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold text-gray-900 bg-gray-50/50"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nombre Oficial del Colegio"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold text-gray-900 bg-gray-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#01017b]/15 active:scale-98 cursor-pointer relative overflow-hidden"
                >
                  {isSubmitted ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Solicitar Demo por WhatsApp
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-center flex justify-center items-center gap-3">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-gray-400" /> Diagnóstico Incluido</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-gray-400 animate-pulse" /> Cero Costos Iniciales</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN 2: EL PROBLEMA --- */}
      <section id="problema" className="py-20 px-4 sm:px-6 bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <ScrollReveal animation="fade-in-up">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-extrabold bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase tracking-wider">
                Diagnóstico Operativo
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                {vslConfig.problemTitle}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto font-medium">
                {vslConfig.problemSubtitle}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scale-up" delay={100}>
            <div className="p-6 bg-red-50/40 border border-red-100 rounded-3xl flex items-center justify-center text-center max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm font-black text-red-700 uppercase tracking-wide flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                {vslConfig.problemMessage}
              </p>
            </div>
          </ScrollReveal>

          {/* 5 B2B Pain Points grid (Removed emojis, added glassmorphism Lucide icons) */}
          <ScrollReveal animation="fade-in-up" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { title: "Pensiones Difíciles", desc: "Conciliaciones manuales en Excel que generan morosidad silenciosa y faltas de caja.", icon: CreditCard, colorClass: "text-[#01017b]" },
                { title: "Padres Insistentes", desc: "Consultas telefónicas repetitivas preguntando notas y deudas vencidas.", icon: Clock, colorClass: "text-[#7EC8C8]" },
                { title: "Docentes Saturados", desc: "Profesores perdiendo horas en registrar asistencia y libretas de papel.", icon: FileSpreadsheet, colorClass: "text-[#9B7FD4]" },
                { title: "Dirección a Ciegas", desc: "Toma de decisiones con reportes financieros incompletos o desactualizados.", icon: Monitor, colorClass: "text-[#F5A623]" },
                { title: "WhatsApp Saturado", desc: "Comunicados y circulares perdidos en el mar de chats informales.", icon: MessageSquare, colorClass: "text-[#E07B6A]" }
              ].map((pain, idx) => {
                const IconComponent = pain.icon;
                return (
                  <div key={idx} className="premium-card p-5 bg-white border border-gray-150 rounded-2xl flex flex-col justify-between hover:border-red-200 hover:scale-103 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
                    <div className={`p-2 bg-gray-50 border border-gray-100 rounded-xl w-9 h-9 flex items-center justify-center mb-3 ${pain.colorClass}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider leading-tight">{pain.title}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-1">{pain.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- SECCIÓN 3: LA NUEVA SOLUCIÓN --- */}
      <section id="solucion" className="py-20 px-4 sm:px-6 bg-[#F8F9FA] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <ScrollReveal animation="slide-in-left">
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold bg-[#EEF1FE] text-[#01017b] px-3 py-1 rounded-full uppercase tracking-wider">
                Ecosistema Integral SaaS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                {vslConfig.solutionTitle}
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {vslConfig.solutionSubtitle}
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0 text-xs">✓</div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Control centralizado y auditable</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">Dirección y tesorería conectadas en vivo con padres, docentes y alumnos.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0 text-xs">✓</div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Despliegue Multi-tenant en 60 segundos</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">Configuración automática de base de datos PostgreSQL y logotipos de tu colegio.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a 
                  href="#demo"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#01017b]/10 hover:scale-102 active:scale-98"
                >
                  Quiero ver cómo funciona
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="slide-in-right" delay={150}>
            {/* Interactive Screen Dashboard Showcase */}
            <div className="premium-card p-4 bg-white border border-gray-150 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B7FD4]/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#01017b] flex items-center justify-center text-white text-[8px] font-black">✓</span>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Simulación Intranet Linkedu</span>
                </div>
                <span className="text-[9px] text-[#7EC8C8] font-black uppercase bg-[#7EC8C8]/10 px-2 py-0.5 rounded">VIP 2026</span>
              </div>

              {/* Comparison graphic */}
              <div className="space-y-4 text-xs font-semibold text-gray-600">
                <div className="p-3 bg-gray-50 border rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-gray-400 uppercase tracking-wider">Matrícula y Cobranza Manual</span>
                    <span className="font-bold text-red-500">12% Pérdidas</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-250 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 w-[60%] rounded-full" />
                  </div>
                  <span className="text-[9px] text-gray-400 font-semibold block">Errores de cuadratura, pensiones olvidadas, recibos en papel.</span>
                </div>

                <div className="p-3 bg-[#EEF1FE]/30 border border-[#01017b]/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-black text-[#01017b] uppercase tracking-wider">Ecosistema LINKEDU</span>
                    <span className="font-black text-green-600">1.8% Morosidad</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#01017b] to-[#7EC8C8] w-[95%] rounded-full" />
                  </div>
                  <span className="text-[9px] text-gray-500 font-semibold block">Conciliación bancaria al día, recordatorios automatizados, app unificada.</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* --- SECCIÓN 4: PORTALES (MÓDULOS DEL SAAS) --- */}
      <section id="portales" className="py-20 px-4 sm:px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <ScrollReveal animation="fade-in-up">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold bg-[#9B7FD4]/10 text-[#9B7FD4] px-3 py-1 rounded-full uppercase tracking-wider">
                Disección de Roles
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Todo tu colegio conectado desde 4 portales
              </h2>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
                Segmentación dinámica de accesos y permisos. El sistema detecta el rol del usuario tras el inicio de sesión y adapta instantáneamente la interfaz.
              </p>
            </div>
          </ScrollReveal>

          {/* Portal selectors (Replaced emojis with premium Lucide icons) */}
          <ScrollReveal animation="fade-in-up" delay={100}>
            <div className="flex border border-gray-200/50 bg-gray-50 p-1.5 rounded-2xl max-w-4xl mx-auto overflow-x-auto scrollbar-none gap-1">
              {[
                { id: 'director', label: 'Dirección', icon: Monitor },
                { id: 'docente', label: 'Docente', icon: BookOpen },
                { id: 'padre', label: 'Familia', icon: Users },
                { id: 'alumno', label: 'Estudiante', icon: Smartphone }
              ].map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePortalTab(tab.id as any)}
                    className={`flex-1 min-w-[125px] py-3 px-2 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activePortalTab === tab.id
                        ? 'bg-[#01017b] text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scale-up" delay={200}>
            {/* Tab display card */}
            <div className="max-w-5xl mx-auto premium-card bg-white p-6 sm:p-8 border rounded-3xl text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[440px]">
              
              {/* Tab content */}
              <div className="lg:col-span-5 space-y-4 animate-fade-in-up" key={`content-${activePortalTab}`}>
              {activePortalTab === 'director' && (
                <>
                  <div className="inline-flex items-center gap-1 bg-[#EEF1FE] text-[#01017b] px-2.5 py-1 rounded text-[9px] font-black uppercase">
                    Portal 1 • Cerebro Financiero
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Control financiero y administrativo absoluto
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    El centro de control del colegio. Monitorea morosidades en vivo, ingresos frente a gastos, matrículas, expedientes médicos de alumnos y asignación salarial docente.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-700">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Gráfico de morosidad escolar en tiempo real.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Edición completa de expedientes y tutores.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Motor HSL VIP de colores adaptativos.</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'docente' && (
                <>
                  <div className="inline-flex items-center gap-1 bg-[#EAF7F7] text-[#7EC8C8] px-2.5 py-1 rounded text-[9px] font-black uppercase">
                    Portal 2 • Alivio Burocrático
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Menos papeleo, más tiempo de enseñanza
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Diseñado para reducir el agotamiento docente. Facilita el cálculo automático de promedios ponderados, cargas de asistencia interactiva en un toque y casillero virtual.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-700">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Cálculo en vivo de notas bimestrales ponderadas.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Cargador y medidor real de bytes de materiales.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Ajustes personales seguros (Correo bloqueado).</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'padre' && (
                <>
                  <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded text-[9px] font-black uppercase">
                    Portal 3 • Transparencia Familiar
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Tranquilidad y fidelización de las familias
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Ofrece transparencia inmediata a los tutores. Pueden revisar libremente estados de cuenta, promedios de cursos en vivo y enviar justificaciones médicas digitales en segundos.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-700">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Estados de cuenta con semáforos de pago.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Visualización interactiva de libretas escolares.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Buzón directo de justificaciones médicas.</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'alumno' && (
                <>
                  <div className="inline-flex items-center gap-1 bg-[#F3EFFE] text-[#9B7FD4] px-2.5 py-1 rounded text-[9px] font-black uppercase">
                    Portal 4 • Aula Autónoma
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Autogestión académica para estudiantes
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Una agenda digital interactiva para que los alumnos controlen sus responsabilidades con total autonomía. Horarios visuales, entregables y registro de promedios históricos.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-700">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Módulo de entrega de tareas directo al profesor.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Horarios en cuadrícula interactiva premium.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500">Control de calificaciones y metas académicas.</span></li>
                  </ul>
                </>
              )}
            </div>

            {/* Tab Graphic Preview */}
            <div className="lg:col-span-7 bg-gray-50 border border-gray-150 rounded-2xl p-5 relative overflow-hidden min-h-[300px] flex flex-col justify-between animate-fade-in-up" key={`preview-${activePortalTab}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#01017b]/5 rounded-full blur-xl pointer-events-none" />
              
              {activePortalTab === 'director' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-bold text-gray-450 border-b pb-2">
                    <span>CONTROL DE DIRECCIÓN (COLEGIO ACTIVO)</span>
                    <span className="text-[#01017b]">Director</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 border rounded-lg text-center">
                      <span className="text-[7px] text-gray-400 font-bold uppercase block">Cobradas</span>
                      <span className="text-xs font-black text-gray-900 block">S/. 92,400</span>
                    </div>
                    <div className="bg-white p-2 border rounded-lg text-center">
                      <span className="text-[7px] text-gray-400 font-bold uppercase block">Pendientes</span>
                      <span className="text-xs font-black text-[#01017b] block">S/. 8,300</span>
                    </div>
                    <div className="bg-white p-2 border rounded-lg text-center">
                      <span className="text-[7px] text-gray-400 font-bold uppercase block">Morosidad</span>
                      <span className="text-xs font-black text-red-500 block">2.8%</span>
                    </div>
                  </div>
                  <div className="p-2 bg-[#EEF1FE]/40 border border-[#01017b]/10 rounded-lg text-[10px] font-semibold flex justify-between text-[#01017b]">
                    <span>🎨 Color VIP Temático Armonizado HSL:</span>
                    <span className="font-extrabold uppercase bg-white px-2 py-0.5 rounded border border-[#01017b]/10">Royal Blue</span>
                  </div>
                </div>
              )}

              {activePortalTab === 'docente' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-bold text-gray-450 border-b pb-2">
                    <span>CALIFICACIONES Y REGISTROS</span>
                    <span className="text-[#7EC8C8]">Matemáticas • 5to B</span>
                  </div>
                  <div className="bg-white border rounded-lg overflow-hidden text-[9px] shadow-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b text-[8px] font-bold text-gray-450">
                        <tr>
                          <th className="p-2 border-r">Estudiante</th>
                          <th className="p-2 text-center border-r">Examen (40%)</th>
                          <th className="p-2 text-center">Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 border-r font-bold">Carlos Quispe</td>
                          <td className="p-2 text-center border-r font-semibold">18</td>
                          <td className="p-2 text-center font-black text-green-600">17.2</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r font-bold">Sofía Benítez</td>
                          <td className="p-2 text-center border-r font-semibold">12</td>
                          <td className="p-2 text-center font-black text-yellow-600">13.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-[#EAF7F7]/50 p-2 rounded-lg border border-[#7EC8C8]/10 text-[9px] flex justify-between items-center">
                    <span>📂 Guía de Álgebra Lineal.pdf uploaded:</span>
                    <span className="px-1.5 py-0.5 bg-[#7EC8C8] text-white rounded font-bold">3.2 MB</span>
                  </div>
                </div>
              )}

              {activePortalTab === 'padre' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-bold text-gray-450 border-b pb-2">
                    <span>INTRANET DE FAMILIAS</span>
                    <span className="text-amber-600">Tutor Activo</span>
                  </div>
                  <div className="bg-white p-3 border rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[7px] text-gray-400 font-bold block uppercase">Mensualidad Mayo 2026</span>
                      <span className="text-xs font-black text-gray-900 block mt-0.5">S/. 450.00</span>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-black text-[9px] uppercase">Cancelado</span>
                  </div>
                  <div className="p-2 bg-amber-50/50 border border-amber-200/50 rounded-lg flex items-center justify-between text-[9px]">
                    <span className="font-bold text-gray-700 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      Justificación Médica (Gripe de Alumno):
                    </span>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-extrabold uppercase">Enviada</span>
                  </div>
                </div>
              )}

              {activePortalTab === 'alumno' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-bold text-gray-450 border-b pb-2">
                    <span>AULA VIRTUAL Y TAREAS</span>
                    <span className="text-[#9B7FD4]">Estudiante</span>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-gray-800 block flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#9B7FD4]" />
                        Tarea: Ecuaciones de 2do Grado
                      </span>
                      <span className="text-red-500 font-extrabold text-[9px]">Vence Mañana</span>
                    </div>
                    <div className="py-2 bg-gray-50 border border-dashed rounded-lg text-center text-[9px] font-bold text-gray-450 cursor-pointer flex items-center justify-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Subir archivo entregable (PDF/Base64)
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
      {/* --- SECCIÓN 5: BENEFICIOS PRINCIPALES --- */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto space-y-12">
          <ScrollReveal animation="fade-in-up">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-extrabold bg-[#7EC8C8]/10 text-[#7EC8C8] px-3 py-1 rounded-full uppercase tracking-wider">
                Beneficios de Alto Impacto
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                {vslConfig.benefitsTitle}
              </h2>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
                Diseñado matemáticamente para simplificar operaciones, eliminar dolores de cabeza y rentabilizar tu institución.
              </p>
            </div>
          </ScrollReveal>

          {/* 6 Conversion Cards */}
          <ScrollReveal animation="scale-up" delay={150}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Control de Pensiones sin Fricción", desc: "Te revelamos una nueva manera de controlar pensiones sin perseguir manualmente a cada padre por WhatsApp.", color: "border-blue-100 bg-white" },
                { title: "Información en un Solo Lugar", desc: "Descubre cómo centralizar notas, asistencias y comunicados sin depender de papeles, cuadernos o archivos perdidos.", color: "border-teal-100 bg-white" },
                { title: "Prestigio y Modernidad", desc: "Implementa una app móvil que mejora la percepción de modernidad de tu colegio frente a los padres.", color: "border-purple-100 bg-white" },
                { title: "Dashboard en Tiempo Real", desc: "Dale a dirección un dashboard financiero para tomar decisiones con información actualizada.", color: "border-amber-100 bg-white" },
                { title: "Alivio para los Profesores", desc: "Ayuda a tus docentes a ahorrar tiempo registrando asistencia y calificaciones desde un entorno digital.", color: "border-green-100 bg-white" },
                { title: "Tranquilidad para las Familias", desc: "Dale a los padres la tranquilidad de revisar pagos, notas y justificaciones desde un solo lugar.", color: "border-indigo-100 bg-white" }
              ].map((item, idx) => (
                <div key={idx} className={`premium-card p-6 border rounded-3xl ${item.color} shadow-xs hover:shadow-xl hover:shadow-[#01017b]/5 hover:scale-103 transition-all duration-300`}>
                  <div className="h-6 w-6 rounded-full bg-[#EEF1FE] text-[#01017b] flex items-center justify-center font-black text-xs mb-3">
                    {idx + 1}
                  </div>
                  <h4 className="text-xs font-black text-gray-955 uppercase tracking-wider mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- SECCIÓN 6: PRUEBA / DEMOSTRACIÓN EN ACCIÓN --- */}
      <section className="py-20 px-4 sm:px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <ScrollReveal animation="slide-in-left">
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold bg-[#7EC8C8]/10 text-[#7EC8C8] px-3 py-1 rounded-full uppercase tracking-wider">
                Prueba de Concepto
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                {vslConfig.proofTitle}
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {vslConfig.proofSubtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1.5">
                  <span className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <span className="p-1 bg-[#EEF1FE] rounded-md border border-[#01017b]/10 inline-flex items-center text-[#01017b]"><Smartphone className="w-3.5 h-3.5" /></span>
                    Mockup de App Móvil
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium block">Expo React Native multi-perfil unificado.</span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1.5">
                  <span className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <span className="p-1 bg-[#EAF7F7] rounded-md border border-[#7EC8C8]/10 inline-flex items-center text-[#7EC8C8]"><TrendingUp className="w-3.5 h-3.5" /></span>
                    Dashboard Financiero
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium block">Estado de morosidad y egresos bimestrales.</span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1.5">
                  <span className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <span className="p-1 bg-amber-50 rounded-md border border-amber-200/50 inline-flex items-center text-amber-600"><CreditCard className="w-3.5 h-3.5" /></span>
                    Estado de Cuenta
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium block">Historial de mensualidades canceladas y vencidas.</span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1.5">
                  <span className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <span className="p-1 bg-[#F3EFFE] rounded-md border border-[#9B7FD4]/10 inline-flex items-center text-[#9B7FD4]"><Clock className="w-3.5 h-3.5" /></span>
                    Registro en 1-Tap
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium block">Asistencias rápidas sin papeleo docente.</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Live Interactive Mockup Dashboard Area */}
          <ScrollReveal animation="slide-in-right" delay={150}>
            <div className="premium-card p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#01017b]/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-[8px] text-white/50 font-mono">Consola de Simulación Activa</span>
              </div>

              {/* Simulated Live chart of school income increase */}
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold uppercase text-gray-400">Incremento de Recaudación Anual</span>
                    <span className="text-[#7EC8C8] font-black">+14.5% Recuperado</span>
                  </div>
                  {/* Visual bar graph block */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] text-gray-300">
                      <span>Ene-Abr (Cobro Manual)</span>
                      <span>S/. 78,500</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-[55%]" />
                    </div>

                    <div className="flex justify-between text-[9px] text-white pt-1">
                      <span>May-Dic (Con LINKEDU)</span>
                      <span className="font-black text-[#7EC8C8]">S/. 124,500</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#01017b] to-[#7EC8C8] w-[95%]" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-[9.5px]">
                  <span className="text-gray-300"><Smartphone className="w-3.5 h-3.5 inline mr-1 text-[#7EC8C8]" /> Recorte Circular de fotos, DNI institucional y SIAGIE compatible:</span>
                  <span className="px-2 py-0.5 bg-green-400/20 text-green-300 border border-green-400/30 rounded font-black">Activo</span>
                </div>
              </div>

              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider text-center pt-4 border-t border-white/5 mt-4">
                <ShieldCheck className="w-3 h-3 inline mr-1 text-[#7EC8C8]" /> Datos encriptados con tecnología PostgreSQL SSL
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* --- SECCIÓN 7: LA OFERTA DE DEMO B2B --- */}
      <section id="demo" className="py-20 px-4 sm:px-6 bg-[#F8F9FA]">
        <ScrollReveal animation="scale-up">
          <div className="max-w-4xl mx-auto bg-white border border-gray-250 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl space-y-8">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#7EC8C8]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold bg-[#EEF1FE] text-[#01017b] px-3 py-1 rounded-full uppercase tracking-wider">
              Diagnóstico Sin Compromiso
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {vslConfig.offerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Revisamos contigo los cuellos de botella de tu institución y te entregamos un plan de digitalización escolar gratuito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Inclusions */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-gray-450 uppercase tracking-wider block">¿Qué Incluye esta Sesión Comercial?</span>
              
              <div className="space-y-3 text-xs font-semibold text-gray-700">
                {[
                  "Revisión completa de tus procesos de gestión actuales.",
                  "Diagnóstico de digitalización escolar y áreas de fuga.",
                  "Demo en vivo del portal de dirección y contabilidad.",
                  "Demostración del cuaderno digital y asistencia docente.",
                  "Demo del portal de consulta y app móvil para padres.",
                  "Recomendación honesta del plan de suscripción ideal."
                ].map((inc, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Catch form */}
            <div className="bg-gray-50 border rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block text-center">Completa los Datos</span>
              
              <form onSubmit={handleCtaSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="director@colegio.edu.pe"
                  value={directorEmail}
                  onChange={(e) => setDirectorEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs text-gray-900 bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Nombre de tu Colegio"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs text-gray-900 bg-white"
                />

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow shadow-[#01017b]/10 cursor-pointer active:scale-98"
                >
                  Solicitar Demo Gratis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* --- SECCIÓN 8: PLANES Y FIJACIÓN DE PRECIOS SAAS B2B --- */}
      <section id="precios" className="py-20 px-4 sm:px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-extrabold bg-[#01017b] text-white px-3 py-1 rounded uppercase tracking-widest">
              Fijación de Precios Claros
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Planes Adaptados al Tamaño de tu Colegio
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
              Sin sorpresas ni contratos de desarrollo pesados. Elige el plan que más encaje con el volumen de tu alumnado.
            </p>
          </div>

          {/* Subscription Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Basico */}
            <ScrollReveal animation="fade-in-up" delay={100} className="flex flex-col h-full">
              <div className="premium-card bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl relative flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <span className="text-[9px] font-black bg-gray-150 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">Plan Básico</span>
                  <h3 className="text-base font-black text-gray-900">Instituciones Iniciales</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Ideal para colegios pequeños que inician su transformación digital.
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-3xl font-black text-[#01017b]">S/. 399</span>
                    <span className="text-xs text-gray-400 font-extrabold uppercase block">al mes (Plano)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Hasta 150 estudiantes</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Matrícula y Cobranza básica</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Portal del Docente y Notas</span></li>
                    <li className="flex items-center gap-2">✕ <span className="text-gray-400 line-through">Color VIP Temático</span></li>
                  </ul>
                </div>
                <a 
                  href="#demo"
                  className="w-full py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-800 font-black text-xs rounded-xl transition-all uppercase tracking-wider mt-6 text-center cursor-pointer"
                >
                  Agendar e Implementar
                </a>
              </div>
            </ScrollReveal>

            {/* Plan Estandar (Recommended) */}
            <ScrollReveal animation="fade-in-up" delay={200} className="flex flex-col h-full">
              <div className="premium-card bg-white border-2 border-[#01017b] p-6 sm:p-8 rounded-3xl relative flex flex-col justify-between shadow-2xl scale-102 h-full">
                <div className="absolute top-0 right-0 bg-[#01017b] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  Recomendado
                </div>
                <div className="space-y-4">
                  <span className="text-[9px] font-black bg-[#EEF1FE] text-[#01017b] px-2 py-0.5 rounded uppercase tracking-wider">Plan Estándar</span>
                  <h3 className="text-base font-black text-gray-900">Colegios en Crecimiento</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Perfecto para instituciones consolidadas que requieren predictibilidad y soporte.
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-3xl font-black text-[#01017b]">S/. 799</span>
                    <span className="text-xs text-gray-400 font-extrabold uppercase block">al mes (Plano)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Hasta 400 estudiantes</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Justificaciones y Ficha Médica</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Soporte Técnico de confianza</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Exportador compatible SIAGIE</span></li>
                  </ul>
                </div>
                <a 
                  href="#demo"
                  className="w-full py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider mt-6 text-center cursor-pointer shadow-md shadow-[#01017b]/20"
                >
                  Agendar e Implementar
                </a>
              </div>
            </ScrollReveal>

            {/* Plan Premium VIP */}
            <ScrollReveal animation="fade-in-up" delay={300} className="flex flex-col h-full">
              <div className="premium-card bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl relative flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <span className="text-[9px] font-black bg-purple-50 text-[#9B7FD4] px-2 py-0.5 rounded uppercase tracking-wider">Plan Premium VIP</span>
                  <h3 className="text-base font-black text-gray-900">Alto Rendimiento</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Para corporaciones que exigen control absoluto de su marca y soporte 24/7 B2B prioritario.
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-3xl font-black text-[#01017b]">S/. 1,199</span>
                    <span className="text-xs text-gray-400 font-extrabold uppercase block">al mes (Plano)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Alumnos Ilimitados</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Motor HSL de Colores VIP</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Soporte 24/7 B2B prioritario</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Métricas y Reportes de IA</span></li>
                  </ul>
                </div>
                <a 
                  href="#demo"
                  className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider mt-6 text-center cursor-pointer"
                >
                  Agendar e Implementar
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Model 2: Pay per use block */}
          <ScrollReveal animation="scale-up" delay={150}>
            <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center relative overflow-hidden shadow-md">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF1FE] text-[#01017b] rounded-full text-[9px] font-black uppercase tracking-wider">
                  Modelo por Alumno Registrado
                </span>
                <h4 className="text-base font-black text-gray-900">
                  Pago por Alumno Activo
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  ¿Prefieres pagar por volumen real? Cobramos de <strong className="text-gray-900 font-black">S/. 2.00 a S/. 5.00 mensuales por alumno</strong>. Sin costos fijos rígidos, adaptado orgánicamente al crecimiento de tus matrículas.
                </p>
              </div>

              <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2">
                <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">Onboarding e Inducción</span>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Setup Fee Único: S/. 500</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Este cobro único cubre el onboarding guiado, capacitación intensiva presencial o virtual a tu cuerpo docente, y la migración total de bases de datos desde tus planillas Excel heredadas de manera gratuita.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- SECCIÓN 9: GARANTÍA / REVERSIÓN DE RIESGO --- */}
      <section className="py-16 px-4 sm:px-6 bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#EEF1FE]/30 to-[#EAF7F7]/30 border border-[#01017b]/10 p-8 rounded-3xl text-center space-y-4 shadow-xl">
          <Shield className="w-10 h-10 text-[#7EC8C8] mx-auto animate-pulse" />
          <h3 className="text-xl sm:text-2xl font-black text-gray-950">
            {vslConfig.guaranteeTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto font-medium">
            {vslConfig.guaranteeText}
          </p>
        </div>
      </section>

      {/* --- SECCIÓN 10: CTA FINAL --- */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#01017b] to-slate-950 text-white relative overflow-hidden">
        {/* Soft Background mesh */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7EC8C8] blur-3xl animate-pulse" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <span className="text-[10px] font-black bg-white/10 text-[#7EC8C8] px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
            ⏳ Etapa de Expansión Limitada
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {vslConfig.ctaFinalTitle}
          </h2>

          <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            {vslConfig.ctaFinalText}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a 
              href={`https://wa.me/${vslConfig.whatsappNumber.replace(/\D/g, '')}?text=Hola!%20Vengo%20de%20la%20landing%20page%20de%20Linkedu.%20Me%20interesa%20agendar%20mi%20demo%20personalizada%20de%20inmediato.`}
              target="_blank"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-green-500/20 flex items-center gap-2 hover:scale-103 active:scale-97 cursor-pointer transition-all border border-green-400"
            >
              <MessageSquare className="w-5 h-5" />
              Agendar Demo por WhatsApp
            </a>
            
            <a 
              href="#demo"
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl cursor-pointer hover:scale-103 active:scale-97 transition-all"
            >
              Comenzar Diagnóstico Gratis
            </a>
          </div>

          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-6">
            📞 Soporte WhatsApp Directo: +51 987 088 359
          </div>
        </div>
      </section>

      {/* --- ELITE PREMIUM FOOTER --- */}
      <footer className="bg-slate-950 text-gray-500 py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
          
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white text-[#01017b] flex items-center justify-center font-black text-lg shadow-sm">
              L
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">LINKEDU</span>
              <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest block -mt-1">Ecosistema EdTech</span>
            </div>
          </div>

          <div className="text-xs font-semibold flex flex-wrap justify-center gap-6">
            <a href="#problema" className="hover:text-white transition-colors">El Problema</a>
            <a href="#solucion" className="hover:text-white transition-colors">La Solución</a>
            <a href="#portales" className="hover:text-white transition-colors">Los 4 Portales</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
            <a href="#demo" className="hover:text-white transition-colors">Agendar Demo</a>
          </div>

          <div className="text-xs font-bold text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            Hecho con orgullo en Perú para toda América Latina
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-medium text-center">
          <p>© 2026 LINKEDU Ecosistema Escolar SaaS. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Términos de Servicio</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad de Datos Escolares</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
