'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  DollarSign,
  UserPlus,
  RefreshCw,
  Eye,
  Check,
  Edit,
  Tv,
  Sliders,
  Play,
  Volume2,
  VolumeX,
  MessageSquare,
  Menu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  getStoredColegios, 
  saveStoredColegios, 
  getStoredUsers, 
  saveStoredUsers, 
  getStoredAlumnos,
  ColegioInfo, 
  UserProfile 
} from '@/lib/supabase/client';

// Gráfico de crecimiento de la suscripción SaaS
const saasGrowthData = [
  { mes: 'Ene', Ingresos: 5000 },
  { mes: 'Feb', Ingresos: 7500 },
  { mes: 'Mar', Ingresos: 12000 },
  { mes: 'Abr', Ingresos: 15400 },
  { mes: 'May', Ingresos: 18900 },
];

const PRESET_1 = {
  heroTitle: "Todo tu colegio conectado en",
  heroGradient: "un solo ecosistema digital All-in-One.",
  heroTitleEnd: "",
  heroSubtitle: "Moderniza tu institución educativa. Integra pensiones, matrículas, notas, asistencias y comunicación instantánea en una plataforma con app móvil para padres, docentes y alumnos.",
  heroBullets: [
    "Control de pensiones y morosidad integrado.",
    "App móvil para padres y alumnos en tiempo real.",
    "Registro digital de notas, promedios y asistencia.",
    "Dashboard unificado para dirección y promotores.",
    "Demo personalizada para tu institución."
  ],
  videoUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  whatsappNumber: "51987088359",
  whatsappTemplate: 'Hola Doce! Me interesa el plan de Ecosistema Premium SaaS para mi colegio. Quisiera agendar una demo en vivo. Mi colegio: "{schoolName}", correo: "{directorEmail}".',
  subtitles: [
    "Orquesta tu colegio con el Ecosistema Premium Doce All-in-One.",
    "Centraliza tesorería, notas de alumnos, reportes de asistencia y avisos en un solo lugar.",
    "Cada portal se adapta dinámicamente con accesos independientes.",
    "Reduce la burocracia docente y aumenta la retención de las familias.",
    "Agenda una demo y mira cómo se vería tu colegio funcionando con Doce."
  ],
  problemTitle: "Tu colegio no necesita más desorden operativo. Necesita control centralizado.",
  problemSubtitle: "La información separada en cuadernos, WhatsApp y Excel crea silos de datos, fugas en cobranzas y cansancio administrativo.",
  problemMessage: "Doce conecta a toda tu comunidad educativa en un único sistema unificado.",
  solutionTitle: "La plataforma que conecta a Dirección, Docentes, Padres y Alumnos.",
  solutionSubtitle: "Una interfaz diseñada para que cada rol acceda exactamente a lo que necesita de forma rápida e intuitiva.",
  benefitsTitle: "Lo que cambia con el Ecosistema Doce:",
  proofTitle: "Explora la plataforma escolar más avanzada del mercado.",
  proofSubtitle: "Nuestra arquitectura multi-tenant permite desplegar tu propio campus digital con logo y colores corporativos de tu colegio al instante.",
  offerTitle: "Solicita hoy tu Demo Personalizada del Ecosistema Escolar.",
  guaranteeTitle: "Prueba sin compromisos hoy.",
  guaranteeText: "Agenda una llamada con uno de nuestros asesores expertos para revisar tu caso y diseñar la mejor configuración para tu colegio.",
  ctaFinalTitle: "Da el salto a la modernización escolar con la plataforma líder.",
  ctaFinalText: "Únete a las instituciones que ya redujeron su morosidad un 40% y eliminaron el papeleo burocrático con Doce."
};

const PRESET_2 = {
  heroTitle: "Controla pensiones, notas y asistencia",
  heroGradient: "reduciendo el caos administrativo de tu colegio.",
  heroTitleEnd: "",
  heroSubtitle: "Ayudamos a dueños y promotores de colegios a erradicar la morosidad y unificar la intranet escolar sin contratar más personal administrativo.",
  heroBullets: [
    "Diagnóstico estratégico de digitalización gratuito.",
    "Estrategia probada para reducir morosidad contable.",
    "App móvil nativa para comunicación pacífica.",
    "Automatización de alertas de deuda recurrentes.",
    "Sesión de consultoría privada 1-a-1 de 30 minutos."
  ],
  videoUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  whatsappNumber: "51987088359",
  whatsappTemplate: 'Hola Doce! Quisiera solicitar el Diagnóstico de Digitalización Gratuito y Demo 1-a-1 de High-Ticket. Mi colegio: "{schoolName}", correo: "{directorEmail}".',
  subtitles: [
    "Bienvenido al Diagnóstico Gratuito de Gestión Escolar Doce.",
    "Descubre los 3 pilares clave para erradicar la morosidad en pensiones en menos de 90 días.",
    "Ahorra miles de horas de trabajo administrativo automatizando tus circulares y recordatorios.",
    "Proyecta una imagen de máxima modernidad y prestigio frente a los padres.",
    "Haz clic abajo y solicita tu diagnóstico privado de 30 minutos sin costo."
  ],
  problemTitle: "Administrar un colegio privado no debería ser un dolor de cabeza diario.",
  problemSubtitle: "Los directores pierden hasta un 30% del tiempo persiguiendo pagos atrasados y atendiendo llamadas repetitivas de padres.",
  problemMessage: "El desorden financiero y operativo deteriora el prestigio y rentabilidad de tu institución.",
  solutionTitle: "Un sistema de alta eficiencia para directores exigentes.",
  solutionSubtitle: "Doce actúa como tu asistente de operaciones invisible, cobrando a tiempo, ordenando notas y enviando reportes a los tutores.",
  benefitsTitle: "Beneficios de nuestra Consultoría de Digitalización:",
  proofTitle: "Mira el sistema financiero y la app móvil en acción.",
  proofSubtitle: "Te mostramos cómo automatizar el envío de recibos electrónicos y cómo gestionar incidencias académicas en vivo.",
  offerTitle: "Reserva una sesión de diagnóstico privado y demo en vivo.",
  guaranteeTitle: "Garantía de Claridad y Diagnóstico.",
  guaranteeText: "Si tras los 30 minutos de consultoría sientes que no aportamos valor, te regalamos una guía de optimización contable para Excel de inmediato.",
  ctaFinalTitle: "Toma el control absoluto del futuro de tu institución hoy.",
  ctaFinalText: "Agenda tu llamada privada de diagnóstico gratuito con nuestro equipo y asegura las vacantes de tu colegio para el próximo ciclo."
};

const PRESET_3 = {
  heroTitle: "Deja de administrar tu colegio entre",
  heroGradient: "Excel, WhatsApp y papeles.",
  heroTitleEnd: "",
  heroSubtitle: "Centraliza pensiones, notas, asistencias, tareas, comunicados y reportes en una sola plataforma con app móvil para dirección, docentes, padres y alumnos.",
  heroBullets: [
    "Control de pensiones y morosidad.",
    "App móvil para padres y alumnos.",
    "Registro digital de notas y asistencias.",
    "Dashboard para dirección.",
    "Demo personalizada para tu colegio."
  ],
  videoUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  whatsappNumber: "51987088359",
  whatsappTemplate: 'Hola! Vengo de la landing page de Doce. Me interesa agendar una demo en vivo de VSL Express. Mi colegio es: "{schoolName}" y mi correo corporativo de contacto es: "{directorEmail}".',
  subtitles: [
    "¿Tu colegio todavía controla pensiones en Excel, notas en hojas sueltas, asistencias en cuadernos y comunicados por WhatsApp?",
    "Presta atención, porque en esta demo te voy a mostrar cómo Doce te ayuda a centralizar la gestión de tu colegio.",
    "Doce es el panel de control que ordena tu colegio y mejora la experiencia de padres, docentes y dirección.",
    "El problema es que la información del colegio está repartida en demasiados lugares.",
    "Con Doce, consigues tres mejoras importantes: más control financiero, menos carga operativa y más prestigio institucional.",
    "Doce: el control de tu colegio en una sola plataforma."
  ],
  problemTitle: "Tu colegio no necesita más papeles. Necesita más control.",
  problemSubtitle: "Cuando la información está repartida entre Excel, WhatsApp, cuadernos y hojas sueltas, el colegio pierde tiempo, claridad y autoridad frente a los padres.",
  problemMessage: "Doce fue creado justamente para resolver ese desorden.",
  solutionTitle: "Todo tu colegio conectado en una sola plataforma.",
  solutionSubtitle: "Dirección controla finanzas, los docentes registran notas, los padres revisan pensiones y los alumnos consultan tareas.",
  benefitsTitle: "Lo que cambia con Doce:",
  proofTitle: "Mira cómo se vería tu colegio dentro de la plataforma.",
  proofSubtitle: "En la demo personalizada revisamos cómo funciona el portal de dirección, cómo un docente registra notas y cómo un padre consulta calificaciones.",
  offerTitle: "Agenda una demo y mira cómo se vería tu colegio dentro de Doce.",
  guaranteeTitle: "No tienes que decidir nada hoy.",
  guaranteeText: "Primero mira la plataforma, revisamos tu caso y te mostramos cuál sería el mejor plan según el tamaño de tu colegio de forma consultiva.",
  ctaFinalTitle: "Agenda una demo y mira cómo se vería tu colegio dentro de Doce.",
  ctaFinalText: "Centraliza pensiones, notas, asistencias, tareas, comunicados y reportes en una sola plataforma con app móvil."
};

export default function SuperAdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState(tabParam);
  const [colegios, setColegios] = useState<ColegioInfo[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);

  // Demos & Magic Links States
  const [leads, setLeads] = useState<any[]>([]);
  const [magicSchoolId, setMagicSchoolId] = useState('');
  const [magicRole, setMagicRole] = useState('director');
  const [magicDomain, setMagicDomain] = useState('');
  const [magicExpiresIn, setMagicExpiresIn] = useState(15);

  useEffect(() => {
    if (activeTab === 'demos_leads') {
      const { getStoredLeads } = require('@/lib/supabase/client');
      setLeads(getStoredLeads());
    }
  }, [activeTab]);

  useEffect(() => {
    if (colegios.length > 0) {
      const firstSchool = colegios[0];
      setMagicSchoolId(firstSchool.id);
      
      const getSchoolDomain = (schoolName: string) => {
        let clean = schoolName.toLowerCase().replace(/^(colegio|liceo|i\.e\.)\s+/i, '');
        return clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      };
      setMagicDomain(getSchoolDomain(firstSchool.nombre));
    }
  }, [colegios]);

  const handleSchoolChangeForMagic = (schoolId: string) => {
    setMagicSchoolId(schoolId);
    const school = colegios.find(c => c.id === schoolId);
    if (school) {
      const getSchoolDomain = (schoolName: string) => {
        let clean = schoolName.toLowerCase().replace(/^(colegio|liceo|i\.e\.)\s+/i, '');
        return clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      };
      setMagicDomain(getSchoolDomain(school.nombre));
    }
  };

  const handleToggleLeadAtendido = (id: string) => {
    const { getStoredLeads, saveStoredLeads } = require('@/lib/supabase/client');
    const currentLeads = getStoredLeads();
    const updated = currentLeads.map((l: any) => {
      if (l.id === id) {
        const nextState = !l.atendido;
        triggerAlert(`Lead "${l.email}" marcado como ${nextState ? 'atendido' : 'pendiente'}.`);
        return { ...l, atendido: nextState };
      }
      return l;
    });
    setLeads(updated);
    saveStoredLeads(updated);
  };

  const handleLoadLeadToMagic = (lead: any) => {
    let clean = lead.colegio.toLowerCase().replace(/^(colegio|liceo|i\.e\.)\s+/i, '');
    const subdomain = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setMagicDomain(subdomain);
    setMagicRole('director');
    triggerAlert(`Lead de "${lead.colegio}" cargado en el Generador de Magic Links.`);
  };
  
  // Filtros y búsquedas
  const [searchColegio, setSearchColegio] = useState('');
  const [selectedColegioId, setSelectedColegioId] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');
  const [selectedRol, setSelectedRol] = useState('todos');

  // Modales
  const [showAddColegio, setShowAddColegio] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Formularios
  const [newColegio, setNewColegio] = useState({ 
    nombre: '', 
    ruc: '', 
    logo: '', 
    plan: 'Premium SaaS', 
    mensualidad: '1200', 
    vencimiento: '2026-06-21' 
  });
  const [newUser, setNewUser] = useState({ 
    nombre: '', 
    apellido: '', 
    dni: '', 
    email: '', 
    rol: 'director',
    colegio_id: '',
    password: ''
  });
  const [activeUserToReset, setActiveUserToReset] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [showEditColegio, setShowEditColegio] = useState(false);
  const [editingColegio, setEditingColegio] = useState<ColegioInfo | null>(null);
  const [editColegioForm, setEditColegioForm] = useState({ 
    nombre: '', 
    ruc: '', 
    logo: '', 
    plan: 'Premium SaaS', 
    mensualidad: '1200', 
    vencimiento: '2026-06-21',
    limite_alumnos: '150',
    limite_personalizado: '0',
    soporte_prioritario: 'estándar',
    observaciones_comerciales: ''
  });

  // VSL Custom states for Collapsible Panel, Viewport Toggle, Reloading and Upload Mode
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'web' | 'mobile'>('web');
  const [previewKey, setPreviewKey] = useState(0);
  const [bgMode, setBgMode] = useState<'url' | 'upload'>('url');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("El archivo es demasiado grande (límite 8MB para almacenamiento local).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setVslForm(prev => ({
        ...prev,
        videoUrl: base64String
      }));
      triggerAlert("¡Archivo cargado con éxito en memoria! Guarda los cambios para publicarlo.");
    };
    reader.readAsDataURL(file);
  };

  // VSL Config State
  const [vslForm, setVslForm] = useState({
    heroTitle: "El Excel del colegio se quedó en el pasado:",
    heroGradient: "controla pensiones, notas y comunicación",
    heroTitleEnd: " desde una sola plataforma.",
    heroSubtitle: "Centraliza pensiones, notas, asistencias, comunicados, tareas y reportes en una sola plataforma con app móvil para dirección, docentes, padres y alumnos.",
    videoUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    whatsappNumber: "51987088359",
    whatsappTemplate: 'Hola! Vengo de la landing page de Doce. Me interesa agendar una demostración gratuita en vivo. Mi colegio es: "{schoolName}" y mi correo corporativo de contacto es: "{directorEmail}". ¿Cuándo podríamos programarla?',
    subtitles: [
      "Descubre cómo DOCE está eliminando el caos administrativo del Excel...",
      "El 85% de los colegios en América Latina reporta fugas de dinero por morosidad no detectada.",
      "Orquesta matrículas, pensiones, asistencias y libretas en un solo ecosistema integrado.",
      "Ahorra hasta 15 horas semanales a tus profesores y pacifica la comunicación con los padres.",
      "Registra hoy tu institución y despliega tu propia intranet escolar en 60 segundos."
    ]
  });

  // Load VSL config from localStorage on start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linkedu_vsl_config');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setVslForm(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSaveVslConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('linkedu_vsl_config', JSON.stringify(vslForm));
    triggerAlert("¡Configuración del VSL de la Landing Page guardada con éxito!");
    // Recargar el iframe de vista previa
    setPreviewKey(prev => prev + 1);
  };

  // Sincronizar el colegio del nuevo usuario al abrir el modal
  useEffect(() => {
    if (showAddUser) {
      setNewUser(prev => ({
        ...prev,
        colegio_id: prev.colegio_id || selectedColegioId || (colegios.length > 0 ? colegios[0].id : '')
      }));
    }
  }, [showAddUser, selectedColegioId, colegios]);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadedColegios = getStoredColegios();
    const loadedUsers = getStoredUsers();
    setColegios(loadedColegios);
    setUsuarios(loadedUsers);
    if (loadedColegios.length > 0) {
      setSelectedColegioId(loadedColegios[0].id);
    }
  }, []);

  // Escuchar cambios en la URL para cambiar la pestaña activa
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  // Cambiar de pestaña y actualizar la URL
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    router.push(`/superadmin?tab=${tabName}`);
  };

  const triggerAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  // --- ACCIONES DE COLEGIOS ---
  const handleToggleColegio = (id: string) => {
    const updated = colegios.map(c => {
      if (c.id === id) {
        const nextState = !c.activo;
        triggerAlert(`Colegio "${c.nombre}" ${nextState ? 'activado' : 'desactivado'} con éxito.`);
        return { ...c, activo: nextState };
      }
      return c;
    });
    setColegios(updated);
    saveStoredColegios(updated);
  };

  const handleAddColegio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColegio.nombre || !newColegio.ruc) return;

    const newId = crypto.randomUUID();
    const logoUrl = newColegio.logo.trim() || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80';
    
    const added: ColegioInfo = {
      id: newId,
      nombre: newColegio.nombre,
      logo: logoUrl,
      ruc: newColegio.ruc,
      activo: true,
      plan: newColegio.plan,
      mensualidad: Number(newColegio.mensualidad) || 1200,
      vencimiento: newColegio.vencimiento
    };

    const updated = [...colegios, added];
    setColegios(updated);
    saveStoredColegios(updated);
    setShowAddColegio(false);
    setNewColegio({ 
      nombre: '', 
      ruc: '', 
      logo: '', 
      plan: 'Premium SaaS', 
      mensualidad: '1200', 
      vencimiento: '2026-06-21' 
    });
    setSelectedColegioId(newId);
    triggerAlert(`¡Colegio "${added.nombre}" registrado exitosamente en la nube!`);
  };

  const handleOpenEditColegio = (col: ColegioInfo) => {
    setEditingColegio(col);
    setEditColegioForm({
      nombre: col.nombre,
      ruc: col.ruc,
      logo: col.logo || '',
      plan: col.plan || 'Premium SaaS',
      mensualidad: String(col.mensualidad || 1200),
      vencimiento: col.vencimiento || '2026-06-21',
      limite_alumnos: String(col.limite_alumnos || (col.plan === 'Básico SaaS' ? 150 : col.plan === 'Estandar SaaS' ? 400 : 99999)),
      limite_personalizado: String(col.limite_personalizado || 0),
      soporte_prioritario: col.soporte_prioritario || 'estándar',
      observaciones_comerciales: col.observaciones_comerciales || ''
    });
    setShowEditColegio(true);
  };

  const handleEditColegio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColegio || !editColegioForm.nombre || !editColegioForm.ruc) return;

    const updated = colegios.map(c => {
      if (c.id === editingColegio.id) {
        return {
          ...c,
          nombre: editColegioForm.nombre,
          ruc: editColegioForm.ruc,
          logo: editColegioForm.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80',
          plan: editColegioForm.plan,
          mensualidad: Number(editColegioForm.mensualidad) || 1200,
          vencimiento: editColegioForm.vencimiento,
          limite_alumnos: Number(editColegioForm.limite_alumnos) || 150,
          limite_personalizado: Number(editColegioForm.limite_personalizado) || 0,
          soporte_prioritario: editColegioForm.soporte_prioritario as any,
          observaciones_comerciales: editColegioForm.observaciones_comerciales
        };
      }
      return c;
    });

    setColegios(updated);
    saveStoredColegios(updated);
    setShowEditColegio(false);
    setEditingColegio(null);
    triggerAlert(`¡Colegio "${editColegioForm.nombre}" actualizado con éxito!`);
  };

  // --- ACCIONES DE USUARIOS ---
  const handleToggleUser = (id: string) => {
    const updated = usuarios.map(u => {
      if (u.id === id) {
        const nextState = u.activo === false ? true : false;
        triggerAlert(`Usuario "${u.nombre} ${u.apellido}" ${nextState ? 'habilitado' : 'inhabilitado'} con éxito.`);
        return { ...u, activo: nextState };
      }
      return u;
    });
    setUsuarios(updated);
    saveStoredUsers(updated);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nombre || !newUser.apellido || !newUser.dni || !newUser.email || !newUser.password) return;

    const added: UserProfile = {
      id: crypto.randomUUID(),
      colegio_id: newUser.colegio_id || selectedColegioId || (colegios.length > 0 ? colegios[0].id : null),
      rol: newUser.rol as any,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      dni: newUser.dni,
      email: newUser.email.toLowerCase().trim(),
      password: newUser.password, // Contraseña de acceso real
      foto_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      activo: true
    };

    const updated = [...usuarios, added];
    setUsuarios(updated);
    saveStoredUsers(updated);
    setShowAddUser(false);
    setNewUser({ 
      nombre: '', 
      apellido: '', 
      dni: '', 
      email: '', 
      rol: 'director',
      colegio_id: '',
      password: ''
    });
    triggerAlert(`Usuario "${added.nombre} ${added.apellido}" creado con éxito con su contraseña.`);
  };

  const handleOpenResetPassword = (user: UserProfile) => {
    setActiveUserToReset(user);
    setNewPassword('Admin2026!');
    setShowResetPassword(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserToReset) return;

    // Actualizar la contraseña en el listado persistido
    const updatedUsers = usuarios.map(u => {
      if (u.id === activeUserToReset.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setUsuarios(updatedUsers);
    saveStoredUsers(updatedUsers);

    triggerAlert(`Contraseña del usuario ${activeUserToReset.nombre} restablecida a "${newPassword}" con éxito.`);
    setShowResetPassword(false);
    setActiveUserToReset(null);
  };

  // --- FILTROS DE BÚSQUEDA ---
  const filteredColegios = colegios.filter(c => 
    c.nombre.toLowerCase().includes(searchColegio.toLowerCase()) ||
    c.ruc.includes(searchColegio)
  );

  const filteredUsuarios = usuarios.filter(u => {
    const matchesColegio = u.colegio_id === selectedColegioId;
    const matchesSearch = 
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchUsuario.toLowerCase()) ||
      u.dni.includes(searchUsuario) ||
      (u.email && u.email.toLowerCase().includes(searchUsuario.toLowerCase()));
    const matchesRol = selectedRol === 'todos' || u.rol === selectedRol;
    
    return matchesColegio && matchesSearch && matchesRol;
  });

  // Calcular colegios próximos a vencer
  const colegiosPorRenovar = colegios.filter(c => {
    if (!c.activo || !c.vencimiento) return false;
    const fecha = new Date(c.vencimiento);
    const hoy = new Date('2026-05-21');
    const diffTime = fecha.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 10;
  });

  // Sumar ingresos mensuales reales basados en las mensualidades de colegios activos
  const totalIngresosReales = colegios
    .filter(c => c.activo)
    .reduce((sum, c) => sum + (c.mensualidad || 0), 0);

  return (
    <div className="space-y-6">
      {/* ALERTA DE ÉXITO PREMIUM */}
      {alertMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-[#EAF5EF] border border-[#5BAD8A] text-[#5BAD8A] py-3 px-5 rounded-xl shadow-xl animate-in fade-in slide-in-from-top duration-300 font-bold text-sm">
          <Check className="w-5 h-5 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* 1. HEADER DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Control Global</h1>
          <p className="text-sm text-gray-500 mt-1">SaaS de Administración, Control Multi-tenant y Finanzas de Colegios.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'colegios' && (
            <button 
              onClick={() => setShowAddColegio(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#01017b]/20 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Nuevo Colegio
            </button>
          )}
          {activeTab === 'usuarios' && (
            <button 
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#9B7FD4] hover:bg-[#9B7FD4]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#9B7FD4]/20 cursor-pointer"
            >
              <UserPlus className="w-4.5 h-4.5" />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {/* 2. PESTAÑAS DE NAVEGACIÓN MODULARES */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto shrink-0 pb-1">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Métricas Globales
        </button>
        <button
          onClick={() => handleTabChange('colegios')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'colegios'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Gestionar Colegios ({colegios.length})
        </button>
        <button
          onClick={() => handleTabChange('usuarios')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Control de Usuarios
        </button>
        <button
          onClick={() => handleTabChange('landing_vsl')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'landing_vsl'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Configurar Landing VSL
        </button>
        <button
          onClick={() => handleTabChange('demos_leads')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'demos_leads'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Demos y Magic Links
        </button>
      </div>

      {/* 3. CONTENIDO DE LAS PESTAÑAS */}
      
      {/* ================= PESTAÑA: METRICAS GLOBALES ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colegios Totales</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#01017b]/10 text-[#01017b]">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">{colegios.length}</span>
                <p className="text-xs text-gray-500 font-bold mt-1">SaaS registrados</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escuelas Activas</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5BAD8A]/10 text-[#5BAD8A]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">
                  {colegios.filter(c => c.activo).length}
                </span>
                <p className="text-xs text-gray-500 font-bold mt-1">Suscripción activa</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Renovar</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E07B6A]/10 text-[#E07B6A]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">{colegiosPorRenovar.length}</span>
                <p className="text-xs text-[#E07B6A] font-bold mt-1">Vence en &lt; 10 días</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuarios Totales</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9B7FD4]/10 text-[#9B7FD4]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">{usuarios.length}</span>
                <p className="text-xs text-gray-500 font-bold mt-1">Ecosistema Doce</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos SaaS</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#F5A623]">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">S/. {totalIngresosReales.toLocaleString('es-PE')}</span>
                <p className="text-xs text-[#5BAD8A] font-bold mt-1">Facturación recurrente</p>
              </div>
            </div>
          </div>

          {/* Gráfico SaaS */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Crecimiento Mensual de Suscripción SaaS (S/.)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={saasGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSaaS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#01017b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#01017b" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #EAECF0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  />
                  <Area type="monotone" dataKey="Ingresos" stroke="#01017b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaaS)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: GESTIONAR COLEGIOS ================= */}
      {activeTab === 'colegios' && (
        <div className="space-y-6">
          {/* Barra de Filtro */}
          <div className="premium-card p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar por nombre de colegio o RUC..."
              value={searchColegio}
              onChange={(e) => setSearchColegio(e.target.value)}
              className="block w-full focus:outline-none text-sm placeholder-gray-400 text-gray-900"
            />
          </div>

          {/* Grid de Colegios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColegios.map((col) => {
              const userCount = usuarios.filter(u => u.colegio_id === col.id).length;
              return (
                <div key={col.id} className="premium-card p-6 flex flex-col justify-between min-h-[190px]">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={col.logo} 
                          alt={col.nombre} 
                          className="w-11 h-11 rounded-lg object-cover border border-gray-200 bg-gray-50"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900 leading-snug">{col.nombre}</h4>
                          <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 block">RUC: {col.ruc}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenEditColegio(col)}
                        className="p-2 bg-gray-50 hover:bg-[#EEF1FE] hover:text-[#01017b] rounded-xl text-gray-400 transition-all cursor-pointer shrink-0"
                        title="Editar Colegio"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3">
                      <div>
                        <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Plan SaaS</span>
                        <span className="font-extrabold text-gray-800 text-xs">{col.plan || 'Premium SaaS'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mensualidad</span>
                        <span className="font-extrabold text-gray-800 text-xs">S/. {col.mensualidad || 1200}/mes</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Vence/Renueva</span>
                        <span className={`text-xs font-bold ${
                          !col.activo ? 'text-[#E07B6A]' :
                          col.vencimiento && new Date(col.vencimiento) < new Date('2026-05-31') ? 'text-[#F5A623]' : 'text-gray-600'
                        }`}>
                          {col.vencimiento ? new Date(col.vencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : 'Sin fecha'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Estatus</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${col.activo ? 'bg-[#5BAD8A]' : 'bg-[#E07B6A]'}`} />
                          <span className={`text-xs font-bold ${col.activo ? 'text-[#5BAD8A]' : 'text-[#E07B6A]'}`}>
                            {col.activo ? 'Activo' : 'Suspendido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-150 pt-4 mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">
                      {col.activo ? 'Plataforma Habilitada' : 'Plataforma Bloqueada'}
                    </span>
                    <button 
                      onClick={() => handleToggleColegio(col.id)}
                      className="cursor-pointer transition-transform active:scale-95"
                    >
                      {col.activo ? (
                        <ToggleRight className="w-10 h-10 text-[#5BAD8A]" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredColegios.length === 0 && (
              <div className="col-span-full premium-card p-12 text-center text-gray-400 font-bold text-sm">
                No se encontraron colegios con la búsqueda ingresada.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: CONTROL DE USUARIOS ================= */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel de Colegio Seleccionado */}
            <div className="premium-card p-5 lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colegio Activo</h3>
              <div>
                <select
                  value={selectedColegioId}
                  onChange={(e) => setSelectedColegioId(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm font-semibold"
                >
                  {colegios.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-150">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Filtrar por Rol</span>
                <div className="space-y-1.5">
                  {['todos', 'director', 'docente', 'padre', 'alumno'].map((rol) => (
                    <button
                      key={rol}
                      onClick={() => setSelectedRol(rol)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        selectedRol === rol
                          ? 'bg-[#EEF1FE] text-[#01017b]'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {rol === 'todos' ? 'Todos los roles' : rol}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Listado de Usuarios */}
            <div className="premium-card p-6 lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-150 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Gestión de Cuentas</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Crea directores, activa/desactiva cuentas o cambia credenciales en Supabase Auth.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por DNI, correo..."
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                  />
                </div>
              </div>

              {/* Tabla de Usuarios */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      <th className="p-3 font-bold">Usuario</th>
                      <th className="p-3 font-bold">DNI</th>
                      <th className="p-3 font-bold">Rol</th>
                      <th className="p-3 font-bold">Estatus</th>
                      <th className="p-3 text-right font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsuarios.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <img 
                            src={usr.foto_url} 
                            alt={usr.nombre} 
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-gray-50 shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-gray-950 truncate leading-snug">{usr.nombre} {usr.apellido}</span>
                            <span className="text-[10px] text-gray-400 truncate mt-0.5">{usr.email || 'sin-correo@doce.pe'}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-xs text-gray-500">{usr.dni}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            usr.rol === 'director' ? 'bg-[#EEF1FE] text-[#01017b]' :
                            usr.rol === 'docente' ? 'bg-[#EAF7F7] text-[#7EC8C8]' :
                            usr.rol === 'padre' ? 'bg-[#FEF6E8] text-[#F5A623]' :
                            'bg-[#F3EFFE] text-[#9B7FD4]'
                          }`}>
                            {usr.rol}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${usr.activo !== false ? 'bg-[#5BAD8A]' : 'bg-[#E07B6A]'}`} />
                            <span className={`text-xs font-semibold ${usr.activo !== false ? 'text-[#5BAD8A]' : 'text-[#E07B6A]'}`}>
                              {usr.activo !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenResetPassword(usr)}
                              className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-400 transition-all cursor-pointer"
                              title="Restablecer Contraseña"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUser(usr.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                usr.activo !== false
                                  ? 'bg-[#E07B6A]/10 hover:bg-[#E07B6A]/20 text-[#E07B6A]'
                                  : 'bg-[#5BAD8A]/10 hover:bg-[#5BAD8A]/20 text-[#5BAD8A]'
                              }`}
                              title={usr.activo !== false ? 'Inhabilitar' : 'Habilitar'}
                            >
                              {usr.activo !== false ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsuarios.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-sm">
                          No hay usuarios registrados con los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: CONFIGURAR LANDING VSL ================= */}
      {activeTab === 'landing_vsl' && (
        <div className="space-y-6">
          {/* 1. MOCK DE MÉTRICAS DEL VSL EN VIVO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visitas a la Landing</span>
                <span className="text-[10px] text-green-500 font-extrabold bg-green-50 px-2 py-0.5 rounded uppercase">+12%</span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">3,450</span>
                <p className="text-xs text-gray-500 font-bold mt-1">Tránsito B2B orgánico</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visualizaciones VSL</span>
                <span className="text-[10px] text-[#01017b] font-extrabold bg-[#EEF1FE] px-2 py-0.5 rounded uppercase">84% play</span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">2,898</span>
                <p className="text-xs text-gray-500 font-bold mt-1">Tasa de reproducción</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clicks a WhatsApp</span>
                <span className="text-[10px] text-[#7EC8C8] font-extrabold bg-[#EAF7F7] px-2 py-0.5 rounded uppercase">CTR: 15%</span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-gray-900">435</span>
                <p className="text-xs text-gray-500 font-bold mt-1">Clientes potenciales</p>
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversión Demo</span>
                <span className="text-[10px] text-amber-600 font-extrabold bg-[#FEF6E8] px-2 py-0.5 rounded uppercase">Alta</span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-[#5BAD8A]">24.8%</span>
                <p className="text-xs text-gray-500 font-bold mt-1">Reuniones de cierre agendadas</p>
              </div>
            </div>
          </div>

          {/* 2. EDITOR Y PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
            
            {/* FORMULARIO DE EDICIÓN */}
            <form 
              onSubmit={handleSaveVslConfig} 
              className={`${isSettingsCollapsed ? 'hidden' : 'lg:col-span-5'} premium-card p-6 space-y-5 bg-white border transition-all duration-300`}
            >
              <div className="flex items-center justify-between border-b pb-3.5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Editor del VSL & Landing Page</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Configura al vuelo textos, vídeos, contactos y subtítulos de tu estrategia comercial.</p>
                </div>
                <Tv className="w-5 h-5 text-[#01017b]" />
              </div>

              {/* SELECTOR DE PLANTILLAS / PRESETS */}
              <div className="bg-[#EEF1FE]/40 border border-[#01017b]/10 rounded-2xl p-4 space-y-2.5">
                <span className="block text-[10px] font-black text-gray-450 uppercase tracking-widest text-center">
                  💡 Cargar Plantilla Comercial Preset
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVslForm(PRESET_1);
                      triggerAlert("Plantilla 1 (SaaS Premium) cargada. ¡Haz clic en Guardar Cambios para publicarla!");
                    }}
                    className="py-2 px-1 text-[9px] font-black uppercase text-gray-700 bg-white border hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-center"
                  >
                    1. SaaS Premium
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVslForm(PRESET_2);
                      triggerAlert("Plantilla 2 (High-Ticket Call) cargada. ¡Haz clic en Guardar Cambios para publicarla!");
                    }}
                    className="py-2 px-1 text-[9px] font-black uppercase text-gray-700 bg-white border hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-center"
                  >
                    2. High-Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVslForm(PRESET_3);
                      triggerAlert("Plantilla 3 (VSL Express B2B) cargada. ¡Haz clic en Guardar Cambios para publicarla!");
                    }}
                    className="py-2 px-1 text-[9px] font-black uppercase text-gray-700 bg-white border hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-center"
                  >
                    3. VSL Express
                  </button>
                </div>
              </div>

              {/* Headline configuration */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">Titular Hero del VSL (3 partes)</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] text-gray-450 font-bold block mb-1">Parte 1 (Texto Regular inicial)</span>
                    <input 
                      type="text" 
                      value={vslForm.heroTitle}
                      onChange={(e) => setVslForm({ ...vslForm, heroTitle: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold text-gray-950 bg-gray-50/30"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-455 font-bold block mb-1">Parte 2 (Texto en Gradiente Llamativo)</span>
                    <input 
                      type="text" 
                      value={vslForm.heroGradient}
                      onChange={(e) => setVslForm({ ...vslForm, heroGradient: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold text-gray-950 bg-gray-50/30"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-455 font-bold block mb-1">Parte 3 (Texto Regular final)</span>
                    <input 
                      type="text" 
                      value={vslForm.heroTitleEnd}
                      onChange={(e) => setVslForm({ ...vslForm, heroTitleEnd: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold text-gray-950 bg-gray-50/30"
                    />
                  </div>
                </div>
              </div>

              {/* Subheadline config */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Subtítulo Descriptivo (Subheadline)</label>
                <textarea 
                  rows={3}
                  value={vslForm.heroSubtitle}
                  onChange={(e) => setVslForm({ ...vslForm, heroSubtitle: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold text-gray-950 bg-gray-50/30 animate-in fade-in"
                  required
                />
              </div>

              {/* Video URL / Upload backdrop */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">Fondo del VSL Player (Foto o Vídeo)</label>
                  <div className="flex gap-1.5 bg-gray-100 p-0.5 rounded-lg text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBgMode('url')}
                      className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                        bgMode === 'url' ? 'bg-white text-[#01017b] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      🌐 Pegar URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgMode('upload')}
                      className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                        bgMode === 'upload' ? 'bg-white text-[#01017b] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      📤 Subir Archivo
                    </button>
                  </div>
                </div>

                {bgMode === 'url' ? (
                  <div>
                    <input 
                      type="text" 
                      value={vslForm.videoUrl}
                      onChange={(e) => setVslForm({ ...vslForm, videoUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg o video.mp4"
                      className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold text-gray-950 bg-gray-50/30"
                      required
                    />
                    <span className="text-[9px] text-gray-400 font-bold block mt-1">Soporta URLs de imágenes directas o vídeos mp4/webm.</span>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50/50 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-1.5 pointer-events-none">
                      <div className="text-xl">📁</div>
                      <p className="text-xs font-bold text-gray-700">Arrastra o haz clic para subir</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Imágenes o vídeos (Límite 8MB)</p>
                    </div>
                    {vslForm.videoUrl && vslForm.videoUrl.startsWith('data:') && (
                      <div className="mt-3 p-1.5 bg-green-50 border border-green-100 rounded-lg inline-flex items-center gap-1 text-[9px] font-black text-green-700 uppercase">
                        <span>✓ Archivo cargado en memoria</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* WhatsApp B2B config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">WhatsApp Comercial</label>
                  <input 
                    type="text" 
                    value={vslForm.whatsappNumber}
                    onChange={(e) => setVslForm({ ...vslForm, whatsappNumber: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold text-gray-950 bg-gray-50/30"
                    placeholder="Ej: 51987088359"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Mensaje Plantilla</label>
                  <textarea 
                    rows={2}
                    value={vslForm.whatsappTemplate}
                    onChange={(e) => setVslForm({ ...vslForm, whatsappTemplate: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-[10px] font-semibold text-gray-950 bg-gray-50/30 leading-snug font-mono"
                    required
                  />
                </div>
              </div>

              {/* Retaining Subtitles editing list */}
              <div className="space-y-2 border-t pt-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Subtítulos Cíclicos del VSL</label>
                <div className="space-y-2.5">
                  {vslForm.subtitles.map((sub, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-[10px] font-black text-gray-400 self-center w-5 shrink-0">#{idx + 1}</span>
                      <input 
                        type="text" 
                        value={sub}
                        onChange={(e) => {
                          const updatedSubs = [...vslForm.subtitles];
                          updatedSubs[idx] = e.target.value;
                          setVslForm({ ...vslForm, subtitles: updatedSubs });
                        }}
                        className="flex-1 rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold text-gray-955 bg-gray-50/30"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#01017b]/15 cursor-pointer active:scale-98"
                >
                  Guardar y Publicar
                </button>
              </div>
            </form>

            {/* PREVIEW EN VIVO DE ALTA FIDELIDAD CON IFRAME SCROLLABLE */}
            <div className={`${isSettingsCollapsed ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4 sticky top-24 transition-all duration-300 w-full`}>
              
              {/* Preview Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                    className="p-2 text-gray-500 hover:text-[#01017b] hover:bg-gray-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                    title={isSettingsCollapsed ? "Mostrar panel de edición" : "Ocultar panel de edición"}
                  >
                    <Menu className="w-5 h-5 text-gray-650" />
                    <span>{isSettingsCollapsed ? "Mostrar Editor" : "Ocultar Editor"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('web')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewViewport === 'web'
                        ? 'bg-white text-[#01017b] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    💻 Vista Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewViewport === 'mobile'
                        ? 'bg-white text-[#01017b] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    📱 Vista Móvil
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewKey(prev => prev + 1)}
                  className="p-2 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                  title="Recargar vista previa"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Viewport Frame Container */}
              <div className="flex justify-center items-center w-full">
                {previewViewport === 'mobile' ? (
                  <div className="relative mx-auto border-[12px] border-slate-950 rounded-[40px] shadow-2xl bg-white w-[375px] h-[720px] transition-all duration-300">
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                      <div className="w-12 h-1 bg-white/20 rounded-full mb-1" />
                    </div>
                    {/* Iframe pointing to home */}
                    <iframe 
                      key={previewKey}
                      src="/" 
                      className="w-full h-full border-0 rounded-[28px] pt-4" 
                      title="VSL Mobile Preview"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[720px] border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white transition-all duration-300">
                    <iframe 
                      key={previewKey}
                      src="/" 
                      className="w-full h-full border-0" 
                      title="VSL Web Preview"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: NUEVO COLEGIO ================= */}
      {showAddColegio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAddColegio(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#01017b]" />
              Registrar Colegio
            </h3>
            <form onSubmit={handleAddColegio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Colegio</label>
                <input
                  type="text"
                  placeholder="Ej: Colegio San Agustín"
                  value={newColegio.nombre}
                  onChange={(e) => setNewColegio({ ...newColegio, nombre: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">RUC de la Institución</label>
                <input
                  type="text"
                  placeholder="20123456789"
                  maxLength={11}
                  value={newColegio.ruc}
                  onChange={(e) => setNewColegio({ ...newColegio, ruc: e.target.value.replace(/\D/g,'') })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo del Colegio</label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {newColegio.logo ? (
                      <img src={newColegio.logo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🏫</span>
                    )}
                    {newColegio.logo && (
                      <button
                        type="button"
                        onClick={() => setNewColegio({ ...newColegio, logo: '' })}
                        className="absolute inset-0 bg-black/50 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-2.5 py-2 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-[11px] font-bold text-gray-600">
                        📁 Subir Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewColegio({ ...newColegio, logo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-gray-400 self-center font-bold">o</span>
                      <input
                        type="text"
                        placeholder="Pega un URL de imagen"
                        value={newColegio.logo.startsWith('data:') ? '' : newColegio.logo}
                        onChange={(e) => setNewColegio({ ...newColegio, logo: e.target.value })}
                        className="flex-1 rounded-xl border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan SaaS</label>
                  <select
                    value={newColegio.plan}
                    onChange={(e) => setNewColegio({ ...newColegio, plan: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                  >
                    <option value="Premium SaaS">Premium SaaS</option>
                    <option value="Estandar SaaS">Estandar SaaS</option>
                    <option value="Básico SaaS">Básico SaaS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mensualidad (S/.)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={newColegio.mensualidad}
                    onChange={(e) => setNewColegio({ ...newColegio, mensualidad: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={newColegio.vencimiento}
                  onChange={(e) => setNewColegio({ ...newColegio, vencimiento: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddColegio(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Dar de Alta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: DEMOS Y MAGIC LINKS ================= */}
      {activeTab === 'demos_leads' && (
        <div className="space-y-6">
          {/* GRID: GENERADOR Y LEADS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* GENERADOR INTERACTIVO (lg:col-span-5) */}
            <div className="lg:col-span-5 premium-card p-6 space-y-5 bg-white border">
              <div className="flex items-center justify-between border-b pb-3.5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Generador de Magic Links</h3>
                  <p className="text-xs text-gray-450 font-semibold mt-0.5">Acceso directo sin contraseñas para demos y prospección comercial.</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#01017b]/10 text-[#01017b]">
                  <Sliders className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Selector de Colegio */}
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Colegio Pre-instalado</label>
                  <select
                    value={magicSchoolId}
                    onChange={(e) => handleSchoolChangeForMagic(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-bold"
                  >
                    {colegios.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                    <option value="custom">-- Otro Colegio / Subdominio Nuevo --</option>
                  </select>
                </div>

                {/* Subdominio de Destino */}
                <div>
                  <label className="block text-xs font-bold text-gray-455 uppercase tracking-wider mb-2">Subdominio / Prefijo del Colegio</label>
                  <input
                    type="text"
                    value={magicDomain}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setMagicDomain(value);
                      if (magicSchoolId !== 'custom') {
                        setMagicSchoolId('custom');
                      }
                    }}
                    placeholder="ej: san-ignacio"
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    {magicSchoolId === 'custom' 
                      ? '✨ Se auto-aprovisionará y creará este colegio al primer login si no existe.' 
                      : '🔗 Corresponde a la escuela pre-instalada elegida.'}
                  </p>
                </div>

                {/* Selector de Rol */}
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Rol del Magic Link</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'director', label: 'Director', emoji: '📊' },
                      { id: 'docente', label: 'Docente', emoji: '👩‍🏫' },
                      { id: 'padre', label: 'Padre / Tutor', emoji: '👨‍👩‍👦' },
                      { id: 'alumno', label: 'Alumno', emoji: '🎒' }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setMagicRole(r.id)}
                        className={`flex items-center gap-2 py-2 px-3 border rounded-xl text-left text-xs font-bold cursor-pointer transition-all ${
                          magicRole === r.id
                            ? 'bg-[#EEF1FE] border-[#01017b] text-[#01017b]'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expiración del Magic Link */}
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Expiración del Link</label>
                  <div className="flex gap-2">
                    {[
                      { value: 5, label: '5 min' },
                      { value: 10, label: '10 min' },
                      { value: 15, label: '15 min' },
                      { value: 20, label: '20 min' },
                      { value: 60, label: '1 hora' },
                      { value: 0, label: 'Sin límite' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMagicExpiresIn(opt.value)}
                        className={`flex-1 py-2 px-1 border rounded-xl text-center text-[10px] font-black uppercase transition-all cursor-pointer ${
                          magicExpiresIn === opt.value
                            ? 'bg-[#EEF1FE] border-[#01017b] text-[#01017b]'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live URL Output Box */}
                <div className="pt-2">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Magic URL</span>
                  <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800 text-left relative group">
                    <code className="text-[11px] font-mono text-cyan-400 break-all select-all block pr-8">
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/login?magic_email=${magicRole}@${magicDomain || 'demo'}.com${magicExpiresIn > 0 ? `&expires_at=${Date.now() + magicExpiresIn * 60 * 1000}` : ''}`
                        : `/login?magic_email=${magicRole}@${magicDomain || 'demo'}.com${magicExpiresIn > 0 ? `&expires_at=${Date.now() + magicExpiresIn * 60 * 1000}` : ''}`
                      }
                    </code>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = typeof window !== 'undefined'
                        ? `${window.location.origin}/login?magic_email=${magicRole}@${magicDomain || 'demo'}.com${magicExpiresIn > 0 ? `&expires_at=${Date.now() + magicExpiresIn * 60 * 1000}` : ''}`
                        : `/login?magic_email=${magicRole}@${magicDomain || 'demo'}.com${magicExpiresIn > 0 ? `&expires_at=${Date.now() + magicExpiresIn * 60 * 1000}` : ''}`;
                      navigator.clipboard.writeText(url);
                      triggerAlert("¡Magic Link copiado al portapapeles con éxito!");
                    }}
                    className="flex justify-center items-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Copiar Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = typeof window !== 'undefined'
                        ? `${window.location.origin}/login?magic_email=${magicRole}@${magicDomain || 'demo'}.com${magicExpiresIn > 0 ? `&expires_at=${Date.now() + magicExpiresIn * 60 * 1000}` : ''}`
                        : `/login?magic_email=${magicRole}@${magicDomain || 'demo'}.com${magicExpiresIn > 0 ? `&expires_at=${Date.now() + magicExpiresIn * 60 * 1000}` : ''}`;
                      window.open(url, '_blank');
                    }}
                    className="flex justify-center items-center gap-2 py-2.5 px-4 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-bold rounded-xl shadow-md shadow-[#01017b]/10 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Probar Ingreso
                  </button>
                </div>
              </div>
            </div>

            {/* TABLA DE LEADS B2B (lg:col-span-7) */}
            <div className="lg:col-span-7 premium-card p-6 bg-white border">
              <div className="flex items-center justify-between border-b pb-3.5 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Prospectos de la Landing (Leads)</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Capturas automáticas de solicitudes de demo comercial.</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5BAD8A]/10 text-[#5BAD8A]">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-2">📥</span>
                  <p className="text-sm font-bold text-gray-400">No hay leads capturados aún.</p>
                  <p className="text-xs text-gray-300 mt-1">Registra una demo desde la página de inicio para verla aparecer aquí.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-black text-gray-450 uppercase tracking-widest">Institución / Lead</th>
                        <th className="px-3 py-2 text-left text-[10px] font-black text-gray-450 uppercase tracking-widest">Contacto</th>
                        <th className="px-3 py-2 text-center text-[10px] font-black text-gray-450 uppercase tracking-widest">Estado</th>
                        <th className="px-3 py-2 text-right text-[10px] font-black text-gray-450 uppercase tracking-widest">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {leads.map((l: any) => (
                        <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-3">
                            <span className="block font-bold text-gray-900">{l.colegio}</span>
                            <span className="block text-[10px] text-gray-400 font-medium mt-0.5">{l.nombre}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="block font-semibold text-gray-600">{l.email}</span>
                            <span className="block text-[10px] text-gray-400 font-medium mt-0.5">{l.telefono || 'Sin teléfono'}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleLeadAtendido(l.id)}
                              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer transition-all ${
                                l.atendido
                                  ? 'bg-[#EAF5EF] text-[#5BAD8A]'
                                  : 'bg-amber-50 border border-amber-100 text-amber-600'
                              }`}
                            >
                              {l.atendido ? 'Atendido' : 'Pendiente'}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleLoadLeadToMagic(l)}
                              className="px-2 py-1 bg-[#EEF1FE] text-[#01017b] hover:bg-[#01017b] hover:text-white rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                            >
                              Cargar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN DE ENTORNOS DEMO ACTIVOS */}
          <div className="premium-card p-6 bg-white border">
            <div className="flex items-center justify-between border-b pb-3.5 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Entornos Demo Activos (Escuelas en Sandbox)</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Colegios creados mediante auto-provisionamiento. Monitorea su capacidad y accede con un click.</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9B7FD4]/10 text-[#9B7FD4]">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colegios.map((col) => {
                // Count students
                const students = getStoredAlumnos().filter(a => a.colegio_id === col.id);
                const activeCount = students.length;
                
                // Calculate limits
                const limitAlumnosBase = col.limite_alumnos || (col.plan === 'Básico SaaS' ? 150 : col.plan === 'Estandar SaaS' ? 400 : 99999);
                const limitFinal = col.limite_personalizado && col.limite_personalizado > 0 ? col.limite_personalizado : limitAlumnosBase;
                
                // Calculate ratio
                const ratio = Math.min(100, Math.round((activeCount / limitFinal) * 100));
                
                // Get Domain
                const getSchoolDomain = (schoolName: string) => {
                  let clean = schoolName.toLowerCase().replace(/^(colegio|liceo|i\.e\.)\s+/i, '');
                  return clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                };
                const domain = getSchoolDomain(col.nombre);

                // Quick login handler
                const handleQuickOpen = (role: string) => {
                  const url = typeof window !== 'undefined'
                    ? `${window.location.origin}/login?magic_email=${role}@${domain}.com&expires_at=${Date.now() + 15 * 60 * 1000}`
                    : `/login?magic_email=${role}@${domain}.com&expires_at=${Date.now() + 15 * 60 * 1000}`;
                  window.open(url, '_blank');
                };

                return (
                  <div key={col.id} className="p-5 border border-gray-100 rounded-2xl hover:border-gray-250 hover:shadow-lg hover:shadow-gray-100/50 transition-all flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={col.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80'}
                          alt={col.nombre}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-200 bg-gray-50"
                        />
                        <div>
                          <span className="block text-sm font-black text-gray-900 leading-tight">{col.nombre}</span>
                          <span className="block text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">
                            RUC {col.ruc} • Plan {col.plan || 'Premium SaaS'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        col.activo 
                          ? 'bg-[#EAF5EF] text-[#5BAD8A]' 
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {col.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </div>

                    {/* Progress Bar of Capacity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                        <span>Capacidad de Alumnos</span>
                        <span className={activeCount >= limitFinal ? 'text-red-500 font-extrabold' : 'text-gray-700'}>
                          {activeCount} / {limitFinal === 99999 ? 'Ilimitado' : limitFinal}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            ratio >= 100 
                              ? 'bg-red-500' 
                              : ratio >= 80 
                                ? 'bg-amber-500' 
                                : 'bg-[#5BAD8A]'
                          }`}
                          style={{ width: `${limitFinal === 99999 ? 10 : ratio}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Login Shortcuts */}
                    <div className="pt-2 border-t border-gray-50">
                      <span className="block text-[9px] font-black text-gray-455 uppercase tracking-widest mb-2">Ingreso Rápido en Sandbox</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickOpen('director')}
                          className="py-1.5 px-1 border border-gray-150 rounded-lg text-[9px] font-black text-[#01017b] hover:bg-[#EEF1FE] uppercase tracking-wider text-center transition-all cursor-pointer whitespace-nowrap"
                        >
                          Director
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickOpen('docente')}
                          className="py-1.5 px-1 border border-gray-150 rounded-lg text-[9px] font-black text-[#7EC8C8] hover:bg-[#EAF7F7] uppercase tracking-wider text-center transition-all cursor-pointer whitespace-nowrap"
                        >
                          Docente
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickOpen('padre')}
                          className="py-1.5 px-1 border border-gray-150 rounded-lg text-[9px] font-black text-amber-600 hover:bg-[#FEF6E8] uppercase tracking-wider text-center transition-all cursor-pointer whitespace-nowrap"
                        >
                          Padre
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickOpen('alumno')}
                          className="py-1.5 px-1 border border-gray-150 rounded-lg text-[9px] font-black text-purple-600 hover:bg-[#F3EFFE]/40 uppercase tracking-wider text-center transition-all cursor-pointer whitespace-nowrap"
                        >
                          Alumno
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR COLEGIO ================= */}
      {showEditColegio && editingColegio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowEditColegio(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#01017b]" />
              Editar Colegio
            </h3>
            <form onSubmit={handleEditColegio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Colegio</label>
                <input
                  type="text"
                  placeholder="Ej: Colegio San Agustín"
                  value={editColegioForm.nombre}
                  onChange={(e) => setEditColegioForm({ ...editColegioForm, nombre: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">RUC de la Institución</label>
                <input
                  type="text"
                  placeholder="20123456789"
                  maxLength={11}
                  value={editColegioForm.ruc}
                  onChange={(e) => setEditColegioForm({ ...editColegioForm, ruc: e.target.value.replace(/\D/g,'') })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo del Colegio</label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {editColegioForm.logo ? (
                      <img src={editColegioForm.logo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🏫</span>
                    )}
                    {editColegioForm.logo && (
                      <button
                        type="button"
                        onClick={() => setEditColegioForm({ ...editColegioForm, logo: '' })}
                        className="absolute inset-0 bg-black/50 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-2.5 py-2 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-[11px] font-bold text-gray-600">
                        📁 Subir Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditColegioForm({ ...editColegioForm, logo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-gray-400 self-center font-bold">o</span>
                      <input
                        type="text"
                        placeholder="Pega un URL de imagen"
                        value={editColegioForm.logo.startsWith('data:') ? '' : editColegioForm.logo}
                        onChange={(e) => setEditColegioForm({ ...editColegioForm, logo: e.target.value })}
                        className="flex-1 rounded-xl border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan SaaS</label>
                  <select
                    value={editColegioForm.plan}
                    onChange={(e) => setEditColegioForm({ ...editColegioForm, plan: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                  >
                    <option value="Premium SaaS">Premium SaaS</option>
                    <option value="Estandar SaaS">Estandar SaaS</option>
                    <option value="Básico SaaS">Básico SaaS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mensualidad (S/.)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={editColegioForm.mensualidad}
                    onChange={(e) => setEditColegioForm({ ...editColegioForm, mensualidad: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={editColegioForm.vencimiento}
                    onChange={(e) => setEditColegioForm({ ...editColegioForm, vencimiento: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Soporte</label>
                  <select
                    value={editColegioForm.soporte_prioritario}
                    onChange={(e) => setEditColegioForm({ ...editColegioForm, soporte_prioritario: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                  >
                    <option value="estándar">Estándar</option>
                    <option value="preferente">Preferente</option>
                    <option value="prioritario">Prioritario</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Límite Alumnos Base</label>
                  <input
                    type="number"
                    value={editColegioForm.limite_alumnos}
                    onChange={(e) => setEditColegioForm({ ...editColegioForm, limite_alumnos: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Límite Personalizado</label>
                  <input
                    type="number"
                    value={editColegioForm.limite_personalizado}
                    onChange={(e) => setEditColegioForm({ ...editColegioForm, limite_personalizado: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observaciones Comerciales</label>
                <textarea
                  value={editColegioForm.observaciones_comerciales}
                  onChange={(e) => setEditColegioForm({ ...editColegioForm, observaciones_comerciales: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-sm min-h-[60px]"
                  placeholder="Observaciones comerciales de la institución..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowEditColegio(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NUEVO USUARIO ================= */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAddUser(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#9B7FD4]" />
              Crear Usuario Institucional
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    placeholder="Carlos"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#9B7FD4]/15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Apellido</label>
                  <input
                    type="text"
                    placeholder="Quispe"
                    value={newUser.apellido}
                    onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#9B7FD4]/15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">DNI</label>
                  <input
                    type="text"
                    placeholder="44332211"
                    maxLength={8}
                    value={newUser.dni}
                    onChange={(e) => setNewUser({ ...newUser, dni: e.target.value.replace(/\D/g,'') })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#9B7FD4]/15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rol</label>
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2"
                  >
                    <option value="director">Director</option>
                    <option value="docente">Docente</option>
                    <option value="padre">Padre</option>
                    <option value="alumno">Alumno</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Institucional</label>
                <input
                  type="email"
                  placeholder="carlos@colegio.edu.pe"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#9B7FD4]/15 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Colegio de Acceso</label>
                <select
                  value={newUser.colegio_id}
                  onChange={(e) => setNewUser({ ...newUser, colegio_id: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#9B7FD4]/15 text-sm font-semibold"
                  required
                >
                  <option value="" disabled>Selecciona un Colegio</option>
                  {colegios.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña de Acceso</label>
                <input
                  type="password"
                  placeholder="Define una contraseña para este usuario"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#9B7FD4]/15 text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9B7FD4] hover:bg-[#9B7FD4]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESTABLECER CONTRASEÑA ================= */}
      {showResetPassword && activeUserToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowResetPassword(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Restablecer Contraseña
            </h3>
            <p className="text-xs text-gray-400 font-semibold mb-4">
              Restablece las credenciales del usuario <strong className="text-gray-700">{activeUserToReset.nombre} {activeUserToReset.apellido}</strong> en Supabase Auth.
            </p>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/15"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-550 bg-red-500 hover:bg-red-650 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Restablecer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
