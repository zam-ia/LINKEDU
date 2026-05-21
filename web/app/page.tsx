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
  Plus
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  // Navigation and Interactive States
  const [activePortalTab, setActivePortalTab] = useState<'director' | 'docente' | 'padre' | 'alumno' | 'superadmin'>('director');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(15); // Simulated progress in VSL
  
  // CTA Form States
  const [directorEmail, setDirectorEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // VSL Config loaded dynamically from LocalStorage (with SSR safety)
  const [vslConfig, setVslConfig] = useState({
    titlePart1: "Elimine la Morosidad y el Caos de Excel.",
    titlePart2: "Recupere el Control de su Colegio",
    titlePart3: " en Tiempo Real",
    subheadline: "LINKEDU es el ecosistema All-in-One que integra la tesorería del colegio, las calificaciones docentes y la comunicación con las familias en una sola aplicación nativa. Despliegue automático en 60 segundos.",
    videoUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    whatsappNumber: "51987088359",
    whatsappTemplate: 'Hola! Vengo de la landing page de Linkedu. Me interesa agendar una demostración gratuita en vivo. Mi colegio es: "{schoolName}" y mi correo corporativo de contacto es: "{directorEmail}". ¿Cuándo podríamos programarla?',
    subtitles: [
      "Descubre cómo LINKEDU está eliminando el caos administrativo del Excel...",
      "El 85% de los colegios en América Latina reporta fugas de dinero por morosidad no detectada.",
      "Orquesta matrículas, pensiones, asistencias y libretas en un solo ecosistema integrado.",
      "Ahorra hasta 15 horas semanales a tus profesores y pacifica la comunicación con los padres.",
      "Registra hoy tu institución y despliega tu propia intranet escolar en 60 segundos."
    ]
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
        setVideoProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
        // Rotate subtitle simulation every 6 seconds
        setSubtitleIndex(prev => (prev >= vslConfig.subtitles.length - 1 ? 0 : prev + 1));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, vslConfig.subtitles]);

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorEmail || !schoolName) return;
    setIsSubmitted(true);

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
    <div className="bg-[#F4F5F7] min-h-screen text-gray-900 overflow-x-hidden font-sans">
      
      {/* --- PREMIUM GLASSMORPHIC HEADER --- */}
      <header className="sticky top-0 z-50 w-full glassmorphism border-b border-gray-200/50 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#01017b] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#01017b]/10 tracking-tighter">
              L
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#01017b] block">LINKEDU</span>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block -mt-1">Ecosistema EdTech</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-wider text-gray-500">
            <a href="#beneficios" className="hover:text-[#01017b] transition-colors">Beneficios</a>
            <a href="#portales" className="hover:text-[#01017b] transition-colors">Los 5 Portales</a>
            <a href="#comparativa" className="hover:text-[#01017b] transition-colors">Comparativa</a>
            <a href="#precios" className="hover:text-[#01017b] transition-colors">Planes VIP</a>
          </nav>

          {/* CTA Action Button */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#01017b] border-t-transparent"></div>
            ) : user ? (
              <button
                onClick={() => router.push(`/${user.rol}`)}
                className="px-5 py-2.5 bg-[#EEF1FE] hover:bg-[#EEF1FE]/80 text-[#01017b] text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs border border-transparent hover:border-[#01017b]/10"
              >
                Ir al Panel de Control
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

      {/* --- HERO SECTION & PROBLEM-FIRST COPY --- */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#EEF1FE]/40 via-white to-[#F4F5F7] overflow-hidden">
        {/* Decorative Grid and Blur Mesh */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-50 z-0">
          <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#7EC8C8]/15 blur-3xl animate-pulse" />
          <div className="absolute top-36 right-10 w-96 h-96 rounded-full bg-[#9B7FD4]/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#01017b]/10 rounded-full text-[10px] font-extrabold text-[#01017b] uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3 h-3 text-[#7EC8C8] animate-spin-slow" />
            Ecosistema Escolar SaaS VIP 2026
          </div>

          {/* High-Impact Headline B2B */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 max-w-5xl mx-auto leading-[1.08] text-balance">
            {vslConfig.titlePart1} <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#01017b] via-[#4F6AF0] to-[#9B7FD4] bg-clip-text text-transparent">
              {vslConfig.titlePart2}
            </span>{vslConfig.titlePart3}
          </h1>

          {/* Solution-oriented Subtitle */}
          <p className="text-sm sm:text-lg text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
            {vslConfig.subheadline}
          </p>

          {/* Dynamic VSL Player Block */}
          <div className="max-w-4xl mx-auto mt-10">
            <div className="premium-card p-2.5 bg-gray-900/5 border border-gray-200/60 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Custom Simulated Video Player UI with Glassmorphic controls */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 group">
                
                {/* Simulated Educational Background Loop / Video Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 select-none bg-gradient-to-t from-black/80 via-black/30 to-black/60">
                  {/* Top Bar Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider bg-black/45 px-2.5 py-1 rounded-md backdrop-blur-xs">
                        🔴 Demostración VIP en Vivo
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs">
                      VSL • 3 Minutos
                    </span>
                  </div>

                  {/* Center Play Big Button Overlay (Visible when paused) */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="h-16 w-16 rounded-full bg-white/95 text-[#01017b] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-30 animate-pulse"
                      >
                        <Play className="w-7 h-7 fill-[#01017b] ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Interactive Dashboard Graphic Mockup in the center (Dynamic visual placeholder) */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl text-left scale-90 sm:scale-100 transition-transform">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="text-[9px] text-white/70 font-mono">LINKEDU Contabilidad</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <span className="text-[8px] text-white/50 block font-bold uppercase">Pensiones Cobradas</span>
                          <span className="text-sm font-black text-[#7EC8C8] block mt-0.5">S/. 124,500</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <span className="text-[8px] text-white/50 block font-bold uppercase">Morosidad Actual</span>
                          <span className="text-sm font-black text-red-300 block mt-0.5">4.2%</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <span className="text-[8px] text-white/50 block font-bold uppercase">Eficiencia Recaudo</span>
                          <span className="text-sm font-black text-green-300 block mt-0.5">95.8%</span>
                        </div>
                      </div>

                      <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-[9px] text-white/80 font-semibold">📣 Alertas de morosidad automáticas</span>
                        <span className="text-[8px] bg-red-400/20 text-red-300 border border-red-400/30 px-2 py-0.5 rounded font-extrabold uppercase">Activas</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtitles Overlay Bar */}
                  <div className="w-full text-center">
                    <p className="inline-block text-xs sm:text-sm font-extrabold text-white bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-xs min-h-[40px] leading-relaxed transition-all max-w-2xl mx-auto">
                      📢 {vslConfig.subtitles[subtitleIndex]}
                    </p>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="flex items-center gap-3 border-t border-white/10 pt-3 mt-2 bg-black/40 p-2.5 rounded-xl backdrop-blur-xs">
                    <button 
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="text-white hover:text-[#7EC8C8] transition-colors cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    {/* Progress Bar Container */}
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative cursor-pointer">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7EC8C8] to-[#9B7FD4] transition-all" 
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>

                    <div className="text-[9px] text-white font-mono">
                      {Math.floor((videoProgress * 1.8) / 60)}:{(Math.floor((videoProgress * 1.8) % 60)).toString().padStart(2, '0')} / 3:00
                    </div>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-[#7EC8C8] transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Simulated Stock Video Image Backdrop */}
                <div 
                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ${
                    isVideoPlaying ? 'scale-110 rotate-1' : 'scale-100'
                  }`}
                  style={{ backgroundImage: `url(${vslConfig.videoUrl})` }}
                />
              </div>
            </div>
          </div>

          {/* --- HERO CTA ULTRA-SIMPLIFIED FORM (PROBLEM-FIRST BLOCK) --- */}
          <div className="max-w-xl mx-auto mt-12 bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7EC8C8]/10 rounded-full blur-2xl" />
            <h3 className="text-base sm:text-lg font-black text-gray-900 text-center flex items-center justify-center gap-2 mb-2">
              🔥 ¿Listo para pacificar la gestión escolar?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              Ingresa los datos para agendar tu demostración en vivo. Te redireccionaremos de inmediato a nuestro WhatsApp comercial.
            </p>

            <form onSubmit={handleCtaSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 text-left">
                    Correo del Director
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="director@colegio.edu.pe"
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold text-gray-900 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 text-left">
                    Nombre del Colegio
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Colegio San Ignacio"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold text-gray-900 bg-gray-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#01017b]/15 active:scale-98 cursor-pointer relative overflow-hidden"
              >
                {isSubmitted ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Agendar Demostración Gratuita Hoy
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-gray-450 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">🛡️ Sin Tarjeta</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Configuración en 1 Minuto</span>
              <span>•</span>
              <span className="flex items-center gap-1">📞 Soporte Directo B2B</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- ELIMINE EL TCO Y MOROSIDAD (MIGRATION SECTION) --- */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-extrabold bg-[#EEF1FE] text-[#01017b] px-3 py-1 rounded-full uppercase tracking-wider">
              Análisis de Costo Oculto (TCO)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              ¿Por qué seguir perdiendo dinero en hojas de cálculo "gratuitas"?
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Google Sheets y WhatsApp parecen gratuitos, pero su costo operativo oculto es devastador. La fragmentación administrativa causa errores de conciliación contable y morosidad de pensiones no reclamada a tiempo, costando miles de soles al año.
            </p>

            <div className="space-y-4">
              {[
                { title: "Doble digitación y errores humanos crónicos", desc: "El personal administrativo pierde horas transcribiendo del cuaderno al Excel y de ahí al SIAGIE del Minedu." },
                { title: "Morosidad asfixiante sin control en vivo", desc: "Sin alertas automáticas, la cobranza de mensualidades depende de llamadas telefónicas manuales e incómodas." },
                { title: "Fragmentación ruidosa en WhatsApp", desc: "Docentes saturados en grupos de chat desordenados, y comunicados que se extravían constantemente." },
                { title: "Desconexión e incertidumbre de las familias", desc: "Padres que solo se enteran de las notas desaprobadas o inasistencias en la entrega de libretas de fin de año." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0 mt-0.5">✕</div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Excel Migration Guarantee */}
            <div className="p-4 bg-gradient-to-r from-[#EEF1FE]/30 to-white border border-[#01017b]/10 rounded-2xl flex items-start gap-3 mt-6">
              <Sparkles className="w-5 h-5 text-[#01017b] shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Garantía de Migración Gratuita de Excel</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                  ¿Temes perder tus registros históricos? Nuestro equipo migrará, normalizará y cargará todas tus bases de datos de alumnos, docentes y pagos a LINKEDU de forma 100% gratuita y sin fricciones operativas.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Screen Dashboard Showcase */}
          <div className="premium-card p-4 bg-gray-50 border border-gray-150 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B7FD4]/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#01017b] flex items-center justify-center text-white font-extrabold text-[8px]">✓</span>
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">El Efecto Linkedu en tus Finanzas</span>
              </div>
              <span className="text-[9px] text-[#7EC8C8] font-black uppercase bg-[#7EC8C8]/10 px-2 py-0.5 rounded">Inteligente</span>
            </div>

            {/* Comparison graphic */}
            <div className="space-y-4">
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wider text-[9px]">Método Tradicional (Caos Excel)</span>
                  <span className="font-bold text-red-500">12% Morosidad</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 w-[65%] rounded-full" />
                </div>
                <span className="text-[9px] text-gray-400 font-semibold block">Cobros manuales incómodos y reportes fragmentados.</span>
              </div>

              <div className="p-3.5 bg-[#EEF1FE]/30 border border-[#01017b]/10 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#01017b] uppercase tracking-wider text-[9px]">Método LINKEDU (Automatizado)</span>
                  <span className="font-black text-green-600">1.8% Morosidad</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#01017b] to-[#7EC8C8] w-[92%] rounded-full" />
                </div>
                <span className="text-[9px] text-gray-500 font-semibold block">Recordatorios por email, estados de cuenta al día y visualización 100% móvil.</span>
              </div>

              {/* Value stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white border border-gray-150 rounded-xl text-center">
                  <span className="text-[8px] text-gray-400 font-black uppercase tracking-wider block">Tiempo Ahorrado</span>
                  <span className="text-xl font-black text-[#01017b] block mt-0.5">80% menos</span>
                  <span className="text-[8px] text-gray-500 font-semibold block">en digitación contable</span>
                </div>
                <div className="p-3 bg-white border border-gray-150 rounded-xl text-center">
                  <span className="text-[8px] text-gray-400 font-black uppercase tracking-wider block">Despliegue</span>
                  <span className="text-xl font-black text-[#7EC8C8] block mt-0.5">Instantáneo</span>
                  <span className="text-[8px] text-gray-500 font-semibold block">Instancia en 1 minuto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE 5 PORTALS INTERACTIVE DEMO (DISECCIÓN DE PORTALES) --- */}
      <section id="portales" className="py-20 px-4 sm:px-6 bg-[#F4F5F7]">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold bg-[#9B7FD4]/10 text-[#9B7FD4] px-3 py-1 rounded-full uppercase tracking-wider">
              Disección de Arquitectura de Negocios
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Un Ecosistema unificado de 5 Portales
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
              Elimine la fricción de instalar múltiples plataformas. LINKEDU integra roles dinámicos que se adaptan tras el inicio de sesión del usuario en cualquier dispositivo.
            </p>
          </div>

          {/* Elegant tab selectors for 5 Portals */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none max-w-4xl mx-auto gap-2 bg-white/60 p-2 rounded-2xl border border-gray-200/50">
            {[
              { id: 'superadmin', label: 'Súper Admin', icon: '🛠️' },
              { id: 'director', label: 'Dirección', icon: '📊' },
              { id: 'docente', label: 'Docente', icon: '👩‍🏫' },
              { id: 'padre', label: 'Familia', icon: '👨‍👩‍👦' },
              { id: 'alumno', label: 'Estudiante', icon: '🎒' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePortalTab(tab.id as any)}
                className={`flex-1 min-w-[110px] py-3.5 px-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                  activePortalTab === tab.id
                    ? 'bg-[#01017b] text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Portal Display Area */}
          <div className="max-w-5xl mx-auto premium-card bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[480px]">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-5">
              {activePortalTab === 'superadmin' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-700 uppercase tracking-widest">
                    Portal 0 • Centro de Control del SaaS
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Orquestación y escalamiento del negocio EdTech
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Diseñado para el operador corporativo de LINKEDU. Administra las instancias de colegios activos y controla el flujo del negocio desde una única pantalla global.
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-700 font-semibold">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Panel de Ingresos recurrentes mensuales (MRR).</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Autoprovisionamiento instantáneo de nuevos colegios por RUC.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Botón de suspensión de colegios morosos en un solo clic.</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'director' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-[#01017b] rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Portal 1 • Inteligencia Financiera
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Control financiero y operativo institucional absoluto
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    El centro neurálgico de la dirección del colegio. Facilita la toma de decisiones basada en datos empíricos y erradica los cobros manuales.
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-700 font-semibold">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Visualización de morosidad escolar en estricto tiempo real.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Wizard de matrícula directa con creación inteligente de ficha médica.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Administración de nómina y color temático VIP del colegio.</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'docente' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#7EC8C8] rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Portal 2 • Alivio Administrativo
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Menos burocracia, más tiempo para la enseñanza
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Construido para reducir el agotamiento de los profesores. Simplifica todas las tareas rutinarias en interfaces fluidas de toque rápido.
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-700 font-semibold">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Registro cíclico de asistencia diaria en 1-Tap.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Cuaderno de calificaciones interactivo con promedios automáticos.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Casillero virtual para subir materiales con lector de peso real.</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'padre' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Portal 3 • Vínculo y Confianza Familiar
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Tranquilidad y transparencia para las familias
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Conecta a los padres con la vida académica de sus hijos, incrementando la fidelidad escolar y el compromiso de pago.
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-700 font-semibold">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Monitoreo en vivo de libretas y comentarios bimestrales.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Estado de cuenta transparente y registro rápido de pagos.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Buzón digital para envío de justificaciones médicas en segundos.</span></li>
                  </ul>
                </>
              )}

              {activePortalTab === 'alumno' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-[#9B7FD4] rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Portal 4 • Aula Virtual Autónoma
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Autogestión de responsabilidades para el estudiante
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Una interfaz amigable y estimulante para que los estudiantes controlen sus quehaceres con total autonomía e inmediatez.
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-700 font-semibold">
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Visualización de horario y agenda escolar diaria en modo VIP.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Caja de entrega virtual para subir tareas directo al profesor.</span></li>
                    <li className="flex items-center gap-2">✓ <span className="text-gray-500 font-medium">Historial interactivo de promedios para incentivar la responsabilidad.</span></li>
                  </ul>
                </>
              )}
            </div>

            {/* Right Interactive Mockup Dashboard Drawing Column */}
            <div className="lg:col-span-7 bg-gray-50 border border-gray-200/80 rounded-2xl p-5 relative overflow-hidden min-h-[300px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#01017b]/5 rounded-full blur-xl" />
              
              {/* Render dynamic dashboard visual depending on tab */}
              {activePortalTab === 'superadmin' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs font-black text-gray-550 uppercase tracking-wider text-[9px]">
                    <span>Gestión de Tenants (Linkedu)</span>
                    <span className="text-green-600">Conectado</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-xl p-3 shadow-xs">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">SaaS MRR Global</span>
                      <span className="text-lg font-black text-[#01017b] block mt-0.5">S/. 45,900</span>
                      <span className="text-[8px] text-green-500 font-extrabold uppercase">+14% este mes</span>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Colegios Activos</span>
                      <span className="text-lg font-black text-gray-900 block mt-0.5">38 Colegios</span>
                      <span className="text-[8px] text-gray-400 font-semibold uppercase">375 alumnos prom.</span>
                    </div>
                  </div>
                  <div className="bg-white border rounded-xl p-3 shadow-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-gray-800">Colegio Innova School S.A.C.</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-black uppercase text-[8px]">Moroso</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-bold">Última Cuota: S/. 1,199 (Vencida)</span>
                      <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-black text-[8px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
                        Suspender Tenant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activePortalTab === 'director' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs font-black text-gray-550 uppercase tracking-wider text-[9px]">
                    <span>Consola Financiera Institucional</span>
                    <span className="text-[#01017b]">Director Activo</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border rounded-xl p-2.5 shadow-xs">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Pensiones Cobradas</span>
                      <span className="text-sm font-black text-gray-900 block">S/. 85,300</span>
                    </div>
                    <div className="bg-white border rounded-xl p-2.5 shadow-xs">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Por Cobrar (Pendiente)</span>
                      <span className="text-sm font-black text-[#01017b] block">S/. 12,400</span>
                    </div>
                    <div className="bg-white border rounded-xl p-2.5 shadow-xs">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Morosidad Crítica</span>
                      <span className="text-sm font-black text-red-500 block">3.1%</span>
                    </div>
                  </div>
                  <div className="bg-white border rounded-xl p-3 shadow-xs space-y-2">
                    <span className="text-[9px] text-gray-450 font-black uppercase tracking-wider block">Historial de Transacciones</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-600 border-b pb-1">
                        <span>Ficha Alumno: Juan Pérez (5to Secundaria)</span>
                        <span className="font-bold text-green-600">✓ S/. 450.00</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-600">
                        <span>Ficha Alumno: María Gómez (3er Grado)</span>
                        <span className="font-bold text-green-600">✓ S/. 400.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePortalTab === 'docente' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs font-black text-gray-550 uppercase tracking-wider text-[9px]">
                    <span>Spreadsheet de Notas Interactivas</span>
                    <span className="text-[#7EC8C8]">5to B • Matemática</span>
                  </div>
                  <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b font-black text-gray-400 uppercase tracking-wider text-[8px]">
                          <th className="p-2 border-r">Estudiante</th>
                          <th className="p-2 text-center border-r">Examen (40%)</th>
                          <th className="p-2 text-center border-r">Tareas (30%)</th>
                          <th className="p-2 text-center">Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 border-r font-bold">Juan Carlos Pérez</td>
                          <td className="p-2 text-center border-r font-semibold text-gray-800">16</td>
                          <td className="p-2 text-center border-r font-semibold text-gray-800">18</td>
                          <td className="p-2 text-center font-black text-green-600">16.8</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r font-bold">Ana María Gutiérrez</td>
                          <td className="p-2 text-center border-r font-semibold text-gray-800">11</td>
                          <td className="p-2 text-center border-r font-semibold text-gray-800">15</td>
                          <td className="p-2 text-center font-black text-yellow-600">12.2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-[#EEF1FE]/40 p-2.5 rounded-xl border border-[#01017b]/10 flex justify-between items-center">
                    <span className="text-[9px] text-[#01017b] font-bold">📂 Subida de Guía Ecuaciones de 2do Grado.pdf</span>
                    <span className="text-[8px] bg-[#01017b] text-white px-2 py-0.5 rounded uppercase font-black">2.4 MB</span>
                  </div>
                </div>
              )}

              {activePortalTab === 'padre' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs font-black text-gray-550 uppercase tracking-wider text-[9px]">
                    <span>Intranet del Tutor (Padre)</span>
                    <span className="text-amber-600">Familia Pérez</span>
                  </div>
                  <div className="p-3 bg-white border rounded-xl shadow-xs flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Estado de Pensión Escolar</span>
                      <h4 className="text-sm font-black text-gray-900 mt-0.5">Mes de Mayo: S/. 450.00</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-black text-[9px] uppercase">Cancelado</span>
                  </div>
                  <div className="p-3 bg-white border rounded-xl shadow-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-gray-800">✍️ Buzón de Justificaciones</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Formulario Rápido</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value="Inasistencia por cita odontológica preventiva." 
                        className="flex-1 bg-gray-50 border rounded-lg p-1.5 text-[9px] text-gray-650 font-semibold focus:outline-none" 
                      />
                      <button className="px-3 bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-default">
                        Enviado
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activePortalTab === 'alumno' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs font-black text-gray-550 uppercase tracking-wider text-[9px]">
                    <span>Mi Aula Escolar VIP</span>
                    <span className="text-[#9B7FD4]">Alumno: Juan Pérez</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white border rounded-xl shadow-xs">
                      <span className="text-[8px] text-[#9B7FD4] font-black uppercase tracking-wider">Clase de Hoy</span>
                      <span className="text-xs font-black text-gray-800 block mt-0.5">Matemática (8:00 AM)</span>
                    </div>
                    <div className="p-2.5 bg-white border rounded-xl shadow-xs">
                      <span className="text-[8px] text-red-400 font-black uppercase tracking-wider">Tarea Pendiente</span>
                      <span className="text-xs font-black text-gray-800 block mt-0.5">Álgebra: Tarea 3</span>
                    </div>
                  </div>
                  <div className="bg-[#9B7FD4]/10 border border-[#9B7FD4]/20 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎒</span>
                      <div>
                        <span className="text-[9px] text-[#9B7FD4] font-extrabold uppercase tracking-wider block">Entregar Trabajo</span>
                        <span className="text-[10px] font-black text-gray-800">Proyecto_Algebra_Final.pdf</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-green-600 text-white px-2 py-0.5 rounded font-black uppercase">Entregado</span>
                  </div>
                </div>
              )}

              {/* Bottom Visual Mockup Badge */}
              <div className="flex items-center justify-center gap-2 bg-white/40 p-2.5 border-t border-gray-150 text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-4">
                <Smartphone className="w-3.5 h-3.5" />
                Diseño Fluido Optimizado Móvil-Primero
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MARKET COMPARISON TABLE (OCEANO AZUL SECTION) --- */}
      <section id="comparativa" className="py-20 px-4 sm:px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-extrabold bg-[#7EC8C8]/10 text-[#7EC8C8] px-3 py-1 rounded-full uppercase tracking-wider">
              Análisis Competitivo EdTech B2B
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              ¿Por qué LINKEDU es Imbatible?
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
              Evaluamos la arquitectura técnica, la usabilidad y los tiempos de despliegue de las soluciones más representativas del mercado.
            </p>
          </div>

          {/* Premium responsive table container */}
          <div className="premium-card bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl max-w-5xl mx-auto">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <th className="p-4 sm:p-5">Plataforma / Funcionalidad</th>
                    <th className="p-4 sm:p-5 text-center bg-[#EEF1FE]/30 text-[#01017b] font-black border-x border-gray-100">
                      LINKEDU VIP
                    </th>
                    <th className="p-4 sm:p-5 text-center">SophIA (IA)</th>
                    <th className="p-4 sm:p-5 text-center">Sieweb (Corp.)</th>
                    <th className="p-4 sm:p-5 text-center">Cubicol (Trad.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-semibold text-gray-700">
                  <tr>
                    <td className="p-4 sm:p-5">
                      <span className="block font-black text-gray-900 uppercase tracking-wider text-[9px]">Arquitectura Movil</span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">Tipo de descarga e interfaz móvil</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-[#EEF1FE]/10 font-black border-x border-gray-100 text-[#01017b]">
                      📱 React Native Unificada <br className="hidden sm:block" />
                      <span className="text-[9px] text-[#7EC8C8] font-black uppercase">App Unica Multiusuario</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Web Adaptable (No App Nata)</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Múltiples Apps Fragmentadas</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Nativa Tradicional</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5">
                      <span className="block font-black text-gray-900 uppercase tracking-wider text-[9px]">Tiempo de Despliegue</span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">Levantar la intranet escolar</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-[#EEF1FE]/10 font-black border-x border-gray-100 text-[#01017b]">
                      ⚡ Instantáneo <br className="hidden sm:block" />
                      <span className="text-[9px] text-[#7EC8C8] font-black uppercase">Aprovisionamiento en 1 min</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Menos de 1 semana</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Lento (Semanas o Meses)</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Promedio</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5">
                      <span className="block font-black text-gray-900 uppercase tracking-wider text-[9px]">Cobranzas e Integración</span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">Conciliación de pensiones</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-[#EEF1FE]/10 font-black border-x border-gray-100 text-[#01017b]">
                      💰 Completa en Vivo <br className="hidden sm:block" />
                      <span className="text-[9px] text-[#7EC8C8] font-black uppercase">Alertas automáticas</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Completa (Bancos)</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Completa (Adquirente)</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Parcial o Limitada</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5">
                      <span className="block font-black text-gray-900 uppercase tracking-wider text-[9px]">Estilo e Identidad VIP</span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">Estética y marca institucional</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-[#EEF1FE]/10 font-black border-x border-gray-100 text-[#01017b]">
                      🎨 Motor HSL VIP 2026 <br className="hidden sm:block" />
                      <span className="text-[9px] text-[#7EC8C8] font-black uppercase">Colores pasteles adaptativos</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Estándar web responsivo</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Clásica / Corporativa Rígida</td>
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-medium">Tradicional Simple</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING & SAAS MONETIZATION (STRATEGY SECTION) --- */}
      <section id="precios" className="py-20 px-4 sm:px-6 bg-[#F4F5F7]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-extrabold bg-[#01017b] text-white px-3 py-1 rounded uppercase tracking-widest">
              Arquitectura Comercial SaaS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Precios Claros y ROI Inmediato
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
              Diseñado bajo esquemas B2B flexibles que mitigan barreras presupuestales y garantizan predictibilidad operativa.
            </p>
          </div>

          {/* Pricing Tiers (Model 2: Flat subscriptions/Tiers) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Basico */}
            <div className="premium-card bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">Plan Básico</span>
                <h3 className="text-base font-black text-gray-900">Instituciones Iniciales</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Ideal para colegios pequeños que dan sus primeros pasos hacia la transformación digital.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-3xl font-black text-[#01017b]">S/. 399</span>
                  <span className="text-xs text-gray-400 font-extrabold uppercase block">al mes (Facturación plana)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Hasta 150 estudiantes</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Matrícula y Finanzas Básicas</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Portal del Docente y Notas</span></li>
                  <li className="flex items-center gap-2">✕ <span className="text-gray-400 line-through">Color VIP Temático</span></li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs rounded-xl transition-all uppercase tracking-wider mt-6 cursor-pointer"
              >
                Registrar Colegio
              </button>
            </div>

            {/* Plan Estandar (Anchored Tier / Recommended) */}
            <div className="premium-card bg-white border-2 border-[#01017b] p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl scale-102">
              <div className="absolute top-0 right-0 bg-[#01017b] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                Recomendado
              </div>
              <div className="space-y-4">
                <span className="text-[9px] font-black bg-[#EEF1FE] text-[#01017b] px-2 py-0.5 rounded uppercase tracking-wider">Plan Estándar</span>
                <h3 className="text-base font-black text-gray-900">Colegios en Crecimiento</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Diseñado para instituciones consolidadas que requieren predictibilidad financiera e inmediatez.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-3xl font-black text-[#01017b]">S/. 799</span>
                  <span className="text-xs text-gray-400 font-extrabold uppercase block">al mes (Facturación plana)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Hasta 400 estudiantes</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Ficha Médica y Justificaciones</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Soporte técnico preferente</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Exportador para SIAGIE / UGEL</span></li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider mt-6 cursor-pointer shadow-md shadow-[#01017b]/20"
              >
                Registrar Colegio
              </button>
            </div>

            {/* Plan Premium VIP */}
            <div className="premium-card bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[9px] font-black bg-purple-50 text-[#9B7FD4] px-2 py-0.5 rounded uppercase tracking-wider">Plan Premium VIP</span>
                <h3 className="text-base font-black text-gray-900">Alto Rendimiento</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Para corporaciones que exigen control absoluto de su marca y soporte 24/7 B2B prioritario.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-3xl font-black text-[#01017b]">S/. 1,199</span>
                  <span className="text-xs text-gray-400 font-extrabold uppercase block">al mes (Facturación plana)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Alumnos Ilimitados</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Motor HSL de Colores VIP</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Soporte 24/7 B2B prioritario</span></li>
                  <li className="flex items-center gap-2">✓ <span className="text-gray-900 font-bold">Estadísticas e IA Avanzada</span></li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider mt-6 cursor-pointer"
              >
                Registrar Colegio
              </button>
            </div>
          </div>

          {/* Pricing Model 1: Pay-per-use & Setup Fee Details (VIP Commercial structure) */}
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#7EC8C8]/10 rounded-full blur-2xl" />
            
            {/* Pay per use block */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF1FE] text-[#01017b] rounded-full text-[9px] font-black uppercase tracking-wider">
                Modelo Alternativo B2B
              </div>
              <h4 className="text-base font-black text-gray-900">
                Pago por Alumno Activo
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                ¿Prefieres pagar por uso real? Cobramos de <strong className="text-gray-900 font-black">S/. 2.00 a S/. 5.00 mensuales por alumno</strong>. Sin costos fijos rígidos, adaptado orgánicamente al crecimiento de tus matrículas anuales.
              </p>
            </div>

            {/* Setup Fee block */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">Setup Fee Único</span>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Inversión Inicial de Configuración: S/. 500</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Este cobro único cubre el onboarding guiado, capacitación intensiva presencial o virtual a docentes, y la migración total de bases de datos desde tus planillas de Excel heredadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PREMIUM FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8 mb-8">
          {/* Logo brand */}
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
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
            <a href="#portales" className="hover:text-white transition-colors">Portales</a>
            <a href="#comparativa" className="hover:text-white transition-colors">Comparativa</a>
            <a href="#precios" className="hover:text-white transition-colors">Planes</a>
          </div>

          <div className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-xl border border-white/5">
            📞 Soporte WhatsApp Directo: +51 987088359
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-550 font-medium text-center">
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
