'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle, Sparkles, X, Phone, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('director');
  const { login, loading, user } = useAuthStore();
  const router = useRouter();

  // Redirigir al panel si ya hay un usuario autenticado
  useEffect(() => {
    if (user) {
      window.location.href = `/${user.rol}`;
    }
  }, [user]);

  // Detección de Magic Links con expiración controlada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const magicEmail = params.get('magic_email');
      const expiresAt = params.get('expires_at');
      if (magicEmail) {
        if (expiresAt) {
          const expirationTime = Number(expiresAt);
          if (expirationTime > 0 && Date.now() > expirationTime) {
            setError('⚠️ El enlace demo ha caducado por límite de tiempo de seguridad. Solicita un nuevo acceso al administrador de Linkedu.');
            return;
          }
        }
        handleQuickLogin(magicEmail, true);
      }
    }
  }, []);

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowSuperAdmin(true);
        return 0;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    const isSuperAdmin = email.toLowerCase().trim() === 'superadmin@linkedu.com';
    if (isSuperAdmin && !password) {
      setError('Por favor, ingresa la contraseña de Super Administrador.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      const activeUser = useAuthStore.getState().user;
      if (activeUser) {
        window.location.href = `/${activeUser.rol}`;
      } else {
        window.location.href = '/';
      }
    } else {
      if (isSuperAdmin) {
        setError('Contraseña incorrecta para el Super Administrador (la clave es admin123).');
      } else {
        setError('Credenciales inválidas o contraseña incorrecta. Por favor, verifica tus datos.');
      }
    }
  };

  const handleQuickLogin = async (demoEmail: string, isMagic: boolean = false) => {
    if (demoEmail === 'superadmin@linkedu.com' && !isMagic) {
      setEmail('superadmin@linkedu.com');
      setPassword('');
      setError('Por favor, ingresa tu contraseña de Super Administrador (la clave es admin123).');
      return;
    }
    setEmail(demoEmail);
    setError('');
    const success = await login(demoEmail, demoEmail === 'superadmin@linkedu.com' ? 'admin123' : undefined);
    if (success) {
      const activeUser = useAuthStore.getState().user;
      if (activeUser) {
        window.location.href = `/${activeUser.rol}`;
      } else {
        window.location.href = '/';
      }
    } else {
      setError('Error al iniciar sesión con Magic Link. Verifica que el correo sea válido.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F4F5F7] px-6 py-12 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo con gradientes suaves */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#01017b] opacity-5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#7EC8C8] opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div 
          onClick={handleLogoClick}
          className="flex items-center justify-center gap-3 cursor-pointer select-none active:scale-[0.95] transition-all duration-150"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#01017b] text-white shadow-md shadow-[#01017b]/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Link<span className="text-[#01017b]">edu</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Iniciar sesión en tu intranet
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Introduce tus credenciales institucionales para acceder.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[460px] z-10">
        <div className="bg-white py-10 px-8 shadow-sm border border-gray-200/80 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex gap-3 text-sm text-red-600">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@colegio.edu.pe"
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-[#01017b] hover:text-[#01017b]/80 transition-colors">
                    ¿La olvidaste?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#01017b] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#01017b]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01017b] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Ingresar a la Plataforma
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enlace de Captación Comercial */}
          <div className="mt-6 pt-6 border-t border-gray-150 text-center">
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#01017b] hover:text-[#01017b]/80 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Sparkles className="h-4 w-4 text-[#01017b] group-hover:animate-pulse" />
              ¿No eres cliente? Descubre la plataforma y prueba la demo aquí
            </button>
          </div>
        </div>
      </div>

      {/* Modal Premium: Tour Interactivo y Captación */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Botón Cerrar */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Encabezado del Modal */}
            <div className="p-6 pb-4 border-b border-gray-100 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-[#01017b] mb-3">
                <Sparkles className="h-3 w-3" />
                Tour de Linkedu
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Experimenta la Gestión Escolar Inteligente
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                Explora las ventajas que ofrece Linkedu para cada miembro de la comunidad educativa.
              </p>
            </div>

            {/* Cuerpo del Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Pestañas de Roles (Navegación del Tour) */}
              <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none">
                {[
                  { id: 'director', label: 'Director', icon: '📊' },
                  { id: 'docente', label: 'Docente', icon: '👩‍🏫' },
                  { id: 'padre', label: 'Padre / Tutor', icon: '👨‍👩‍👦' },
                  { id: 'alumno', label: 'Alumno', icon: '🎒' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[100px] text-center pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#01017b] text-[#01017b]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Contenido de la Pestaña Activa */}
              <div className="space-y-4 py-2">
                {activeTab === 'director' && (
                  <div className="space-y-3.5">
                    <span className="block text-xs font-extrabold text-[#01017b] uppercase tracking-wider">Centro de Mando Contable y Operativo</span>
                    <div className="grid gap-3.5">
                      {[
                        { title: 'Caja chica y Finanzas', desc: 'Gestiona egresos y planillas docentes en tiempo real. Visualiza gráficos interactivos de ingresos vs gastos de tu institución.' },
                        { title: 'Matrícula Digital 3 Pasos', desc: 'Registra estudiantes con fichas médicas, carga de fotos a base de datos y emisión automática de cuotas y conceptos de pago.' },
                        { title: 'Reportes de Alerta Temprana', desc: 'Detección automática de morosidad comercial y alumnos con riesgo de deserción por inasistencias acumuladas.' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3.5 bg-indigo-50/20 border border-indigo-50/40 rounded-xl">
                          <CheckCircle2 className="h-5 w-5 text-[#01017b] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'docente' && (
                  <div className="space-y-3.5">
                    <span className="block text-xs font-extrabold text-[#7EC8C8] uppercase tracking-wider">Herramientas del Aula Digital</span>
                    <div className="grid gap-3.5">
                      {[
                        { title: 'Asistencias en 1-Tap', desc: 'Registra la asistencia diaria tocando cíclicamente (Presente, Tardanza, Falta). Sincronización instantánea con los padres.' },
                        { title: 'Spreadsheet de Calificaciones', desc: 'Cuaderno de notas tipo Excel con cálculo de promedios ponderados en tiempo real según los pesos académicos de cada evaluación.' },
                        { title: 'Repositorio de Recursos', desc: 'Sube y comparte de forma estructurada diapositivas, guías PDF y enlaces educativos con tus alumnos de manera directa.' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3.5 bg-teal-50/10 border border-teal-50/20 rounded-xl">
                          <CheckCircle2 className="h-5 w-5 text-[#7EC8C8] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'padre' && (
                  <div className="space-y-3.5">
                    <span className="block text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">Monitoreo Familiar e Intranet Contable</span>
                    <div className="grid gap-3.5">
                      {[
                        { title: 'Boleta de Calificaciones en Vivo', desc: 'Visualiza la libreta académica de tu hijo al instante con desglose completo por periodo y comentarios del profesor.' },
                        { title: 'Estado de Cuenta y Pasarela', desc: 'Historial de mensualidades al día y pasarela de pago premium simulada que registra transacciones y notifica a la dirección.' },
                        { title: 'Justificaciones Formales', desc: 'Presenta solicitudes para justificar inasistencias adjuntando recetas y certificados médicos directo desde tu perfil.' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3.5 bg-amber-50/15 border border-amber-50/30 rounded-xl">
                          <CheckCircle2 className="h-5 w-5 text-[#F5A623] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'alumno' && (
                  <div className="space-y-3.5">
                    <span className="block text-xs font-extrabold text-[#9B7FD4] uppercase tracking-wider">Tu Agenda y Aula Escolar</span>
                    <div className="grid gap-3.5">
                      {[
                        { title: 'Horarios Interactivos', desc: 'Calendario y grid semanal interactivo que detalla tus clases, salones y docentes de tu sección activa.' },
                        { title: 'Buzón de Entregas', desc: 'Control de tareas y deberes pendientes con soporte para subir archivos y PDFs directos al casillero virtual del profesor.' },
                        { title: 'Mi Historial de Notas', desc: 'Acceso a tus evaluaciones del bimestre para estar al día de tus avances y revisar los materiales de clase compartidos.' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3.5 bg-purple-50/20 border border-purple-50/30 rounded-xl">
                          <CheckCircle2 className="h-5 w-5 text-[#9B7FD4] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Banner de Captación Comercial a WhatsApp */}
              <div className="p-5 bg-gradient-to-br from-[#01017b]/5 to-[#7EC8C8]/5 border border-[#01017b]/10 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    ✨ ¡Digitaliza tu institución hoy!
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                    Solicita tu acceso personalizado de administrador para configurar RUC, logo y planes.
                  </p>
                </div>
                <a
                  href="https://wa.me/51987088359?text=Hola,%20me%20interesa%20adquirir%20la%20plataforma%20Linkedu%20para%20mi%20instituci%C3%B3n.%20Quisiera%20m%C3%A1s%20informaci%C3%B3n."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  <Phone className="h-4 w-4" />
                  Solicitar Acceso (WhatsApp)
                </a>
              </div>

              {/* Panel de Demo Rápida */}
              <div className="pt-5 border-t border-gray-150">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
                  🚀 Probar Demo al Instante
                </span>
                
                <div className="space-y-3">
                  {showSuperAdmin && (
                    <button
                      onClick={() => {
                        handleQuickLogin('superadmin@linkedu.com');
                        setShowDemoModal(false);
                      }}
                      disabled={loading}
                      className="flex items-center justify-between w-full p-3.5 border border-[#9B7FD4]/30 bg-[#F3EFFE]/20 hover:bg-[#F3EFFE]/70 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌐</span>
                        <div className="text-left">
                          <span className="block text-xs font-extrabold text-gray-800">Super Administrador Global</span>
                          <span className="block text-[10px] text-gray-400 mt-0.5 group-hover:text-[#9B7FD4] transition-colors">superadmin@linkedu.com</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9B7FD4] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        handleQuickLogin('director@linkedu.com');
                        setShowDemoModal(false);
                      }}
                      disabled={loading}
                      className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#EEF1FE] hover:border-[#01017b]/30 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-gray-800">Dirección</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#01017b] transition-colors">director@linkedu.com</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQuickLogin('docente@linkedu.com');
                        setShowDemoModal(false);
                      }}
                      disabled={loading}
                      className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#EAF7F7] hover:border-[#7EC8C8]/30 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-gray-800">Docente</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#7EC8C8] transition-colors">docente@linkedu.com</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQuickLogin('padre@linkedu.com');
                        setShowDemoModal(false);
                      }}
                      disabled={loading}
                      className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#FEF6E8] hover:border-[#F5A623]/30 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-gray-800">Padre / Tutor</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#F5A623] transition-colors">padre@linkedu.com</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQuickLogin('alumno@linkedu.com');
                        setShowDemoModal(false);
                      }}
                      disabled={loading}
                      className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#F3EFFE]/40 hover:border-[#9B7FD4]/20 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-gray-800">Alumno</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#9B7FD4] transition-colors">alumno@linkedu.com</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
