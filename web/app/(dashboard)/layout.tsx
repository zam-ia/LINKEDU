'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  FileSpreadsheet, 
  LogOut, 
  Menu, 
  X,
  Bell,
  BookOpen,
  UserCheck,
  ClipboardList,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';

// Componente de navegación de escritorio que usa useSearchParams de forma segura
function SidebarNav({ menuItems, isCollapsed }: { menuItems: any[]; isCollapsed: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
      {menuItems.map((item) => {
        let isActive = false;
        if (item.path.includes('?')) {
          const parts = item.path.split('?');
          const pathNamePart = parts[0];
          const queryPart = parts[1];
          const itemTab = new URLSearchParams(queryPart).get('tab');
          isActive = pathname === pathNamePart && tab === itemTab;
        } else {
          isActive = pathname === item.path && (!tab || item.path !== '/superadmin');
        }
        return (
          <a
            key={item.name}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              router.push(item.path);
            }}
            title={isCollapsed ? item.name : undefined}
            className={`flex items-center p-3.5 text-sm font-semibold rounded-xl transition-all group ${
              isCollapsed ? 'justify-center' : 'px-4'
            } ${
              isActive 
                ? 'bg-[#EEF1FE] text-[#01017b]' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`h-5 w-5 transition-colors shrink-0 ${
              isCollapsed ? '' : 'mr-3'
            } ${
              isActive ? 'text-[#01017b]' : 'text-gray-400 group-hover:text-gray-600'
            }`} />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
            {!isCollapsed && isActive && (
              <div className="ml-auto w-1 h-5 rounded-full bg-[#01017b]" />
            )}
          </a>
        );
      })}
    </nav>
  );
}

// Componente de navegación móvil que usa useSearchParams de forma segura
function MobileSidebarNav({ menuItems, onClose }: { menuItems: any[]; onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      {menuItems.map((item) => {
        let isActive = false;
        if (item.path.includes('?')) {
          const parts = item.path.split('?');
          const pathNamePart = parts[0];
          const queryPart = parts[1];
          const itemTab = new URLSearchParams(queryPart).get('tab');
          isActive = pathname === pathNamePart && tab === itemTab;
        } else {
          isActive = pathname === item.path && (!tab || item.path !== '/superadmin');
        }
        return (
          <a
            key={item.name}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              onClose();
              router.push(item.path);
            }}
            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              isActive 
                ? 'bg-[#EEF1FE] text-[#01017b]' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-[#01017b]' : 'text-gray-400'}`} />
            {item.name}
          </a>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, colegio, logout, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [styleContent, setStyleContent] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linkedu_sidebar_collapsed');
      if (saved) {
        setIsSidebarCollapsed(saved === 'true');
      }
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('linkedu_sidebar_collapsed', String(nextState));
    }
  };

  // --- NOTIFICATIONS & ANNOUNCEMENTS SYSTEM ---
  interface Comunicado {
    id: string;
    titulo: string;
    categoria: 'General' | 'Evento' | 'Examen';
    mensaje: string;
    remitente: string;
    remitenteRol: 'director' | 'docente';
    fecha: string;
    curso?: string;
    colegioId: string;
  }

  const DEFAULT_COMUNICADOS: Comunicado[] = [
    {
      id: 'com-1',
      titulo: 'Gran Kermesse Familiar Linkedu 2026',
      categoria: 'Evento',
      mensaje: 'Los invitamos a participar de nuestra Kermesse este sábado desde las 9:00 AM. Habrá juegos, comida típica y presentaciones artísticas de todos los grados.',
      remitente: 'Director Roberto Mendoza',
      remitenteRol: 'director',
      fecha: '2026-05-20',
      colegioId: 'all'
    },
    {
      id: 'com-2',
      titulo: 'Simulacro de Examen Bimestral',
      categoria: 'Examen',
      mensaje: 'Se comunica a todos los alumnos que el día lunes 25 de mayo realizaremos el primer simulacro general presencial. Repasar los temas del bloque I.',
      remitente: 'Dirección Académica',
      remitenteRol: 'director',
      fecha: '2026-05-19',
      colegioId: 'all'
    },
    {
      id: 'com-3',
      titulo: 'Entrega de Proyecto Bimestral de Matemática',
      categoria: 'Examen',
      mensaje: 'Estimados alumnos, recuerden subir su video y reporte del proyecto de ecuaciones a más tardar el viernes 22 de mayo a las 11:59 PM.',
      remitente: 'Prof. María Gutiérrez',
      remitenteRol: 'docente',
      fecha: '2026-05-21',
      curso: 'Matemática Divertida',
      colegioId: 'all'
    }
  ];

  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showCreateNotifModal, setShowCreateNotifModal] = useState(false);
  const [notifFiltro, setNotifFiltro] = useState<'Todos' | 'Evento' | 'Examen' | 'General'>('Todos');

  // High Priority Exam Notification and Chime Sound states
  const [activeHighPriorityNotif, setActiveHighPriorityNotif] = useState<Comunicado | null>(null);
  const prevLengthRef = useRef<number | null>(null);

  const playNotificationSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Chime 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.25);
      
      // Chime 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn('Web Audio API not supported or blocked by browser policy:', err);
    }
  };

  // Monitor changes in announcement list to trigger sound
  useEffect(() => {
    if (comunicados.length > 0) {
      if (prevLengthRef.current !== null && comunicados.length > prevLengthRef.current) {
        playNotificationSound();
      }
      prevLengthRef.current = comunicados.length;
    }
  }, [comunicados]);

  // Monitor unread high-priority exam notification on login/mount
  useEffect(() => {
    if (user && comunicados.length > 0) {
      const examNotifications = comunicados.filter(c => c.categoria === 'Examen');
      if (examNotifications.length > 0) {
        const latest = examNotifications[0];
        const dismissed = localStorage.getItem(`linkedu_dismissed_announcement_${user.id}_${latest.id}`);
        if (dismissed !== 'true') {
          setActiveHighPriorityNotif(latest);
        }
      }
    }
  }, [comunicados, user]);
  
  // Form State for new Notification
  const [newNotif, setNewNotif] = useState({
    titulo: '',
    categoria: 'General' as 'General' | 'Evento' | 'Examen',
    mensaje: '',
    curso: ''
  });

  const [teacherCourses, setTeacherCourses] = useState<string[]>([]);

  // Load and seed announcements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linkedu_comunicados');
      if (saved) {
        try {
          setComunicados(JSON.parse(saved));
        } catch (e) {
          setComunicados(DEFAULT_COMUNICADOS);
        }
      } else {
        localStorage.setItem('linkedu_comunicados', JSON.stringify(DEFAULT_COMUNICADOS));
        setComunicados(DEFAULT_COMUNICADOS);
      }
    }
  }, []);

  // Fetch teacher's courses if docente is logged in
  useEffect(() => {
    if (user && user.rol === 'docente') {
      const { getStoredDocentes } = require('@/lib/supabase/client');
      const allDocentes = getStoredDocentes();
      const activeDocente = allDocentes.find((d: any) => d.email === user.email);
      if (activeDocente && activeDocente.cursos_asignados.length > 0) {
        const distinct = Array.from(new Set(activeDocente.cursos_asignados.map((c: any) => c.curso)));
        setTeacherCourses(distinct as string[]);
        setNewNotif(prev => ({ ...prev, curso: (distinct[0] || '') as string }));
      }
    }
  }, [user]);

  const handleCreateNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotif.titulo || !newNotif.mensaje) return;

    let remitenteName = user ? `${user.nombre} ${user.apellido}` : 'Usuario';
    if (user?.rol === 'director') {
      remitenteName = `Director ${user.nombre} ${user.apellido}`;
    } else if (user?.rol === 'docente') {
      remitenteName = `Prof. ${user.nombre} ${user.apellido}`;
    }

    const created: Comunicado = {
      id: 'com-' + Date.now(),
      titulo: newNotif.titulo,
      categoria: newNotif.categoria,
      mensaje: newNotif.mensaje,
      remitente: remitenteName,
      remitenteRol: user?.rol as 'director' | 'docente',
      fecha: new Date().toISOString().split('T')[0],
      curso: user?.rol === 'docente' ? newNotif.curso : undefined,
      colegioId: user?.colegio_id || 'all'
    };

    const updated = [created, ...comunicados];
    localStorage.setItem('linkedu_comunicados', JSON.stringify(updated));
    setComunicados(updated);
    
    // Reset Form
    setNewNotif({
      titulo: '',
      categoria: 'General',
      mensaje: '',
      curso: teacherCourses[0] || ''
    });
    setShowCreateNotifModal(false);
    alert('¡Anuncio publicado y notificado con éxito!');
  };

  const handleDeleteNotif = (id: string) => {
    const updated = comunicados.filter(c => c.id !== id);
    localStorage.setItem('linkedu_comunicados', JSON.stringify(updated));
    setComunicados(updated);
  };

  // --- VIP 2026 DYNAMIC THEMING AND HARMONIZATION MOTOR ---
  useEffect(() => {
    if (colegio && colegio.plan === 'Premium SaaS' && colegio.color_primario) {
      const hex = colegio.color_primario;
      
      const parseHexToHsl = (hexColor: string) => {
        let cleanHex = hexColor.replace(/^#/, '');
        if (cleanHex.length === 3) {
          cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
        }
        let r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        let g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        let b = parseInt(cleanHex.substring(4, 6), 16) / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          let d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return {
          h: Math.round(h * 360),
          s: Math.round(s * 100),
          l: Math.round(l * 100)
        };
      };

      const hslToHex = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

        let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
        let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
        let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
      };

      const originalHsl = parseHexToHsl(hex);

      // Primary Color Harmonization: Saturation max 65%, Lightness 22% - 32%
      const primaryS = Math.min(originalHsl.s, 65);
      const primaryL = Math.max(22, Math.min(originalHsl.l, 32));
      const harmonizedPrimary = hslToHex(originalHsl.h, primaryS, primaryL);

      // Secondary Color Harmonization (Soft tint): Saturation max 40%, Lightness 96%
      const lightS = Math.min(originalHsl.s, 40);
      const lightL = 96;
      const harmonizedLight = hslToHex(originalHsl.h, lightS, lightL);

      // Generate the raw dynamic CSS override block
      const cssRules = `
        :root {
          --primary-custom: ${harmonizedPrimary};
          --primary-light-custom: ${harmonizedLight};
        }
        
        .bg-\\[\\#01017b\\] {
          background-color: var(--primary-custom) !important;
        }
        .text-\\[\\#01017b\\] {
          color: var(--primary-custom) !important;
        }
        .border-\\[\\#01017b\\] {
          border-color: var(--primary-custom) !important;
        }
        .hover\\:bg-\\[\\#01017b\\]\\/90:hover {
          background-color: var(--primary-custom) !important;
          opacity: 0.95 !important;
        }
        .hover\\:bg-\\[\\#01017b\\]\\/80:hover {
          background-color: var(--primary-custom) !important;
          opacity: 0.85 !important;
        }
        .focus-visible\\:outline-\\[\\#01017b\\]:focus-visible {
          outline-color: var(--primary-custom) !important;
        }
        
        .bg-\\[\\#EEF1FE\\] {
          background-color: var(--primary-light-custom) !important;
        }
        .text-\\[\\#EEF1FE\\] {
          color: var(--primary-custom) !important;
        }
        .border-\\[\\#EEF1FE\\] {
          border-color: var(--primary-light-custom) !important;
        }
        .hover\\:bg-\\[\\#EEF1FE\\]:hover {
          background-color: var(--primary-light-custom) !important;
          opacity: 0.9 !important;
        }
        
        /* Highlight icon / sidebar elements */
        .group:hover .group-hover\\:text-\\[\\#01017b\\] {
          color: var(--primary-custom) !important;
        }
        .group:hover .group-hover\\:border-\\[\\#01017b\\] {
          border-color: var(--primary-custom) !important;
        }
        .group-hover\\:text-\\[\\#01017b\\] {
          color: var(--primary-custom) !important;
        }
        
        /* Soft shadows */
        .shadow-\\[\\#01017b\\]\\/10 {
          box-shadow: 0 4px 6px -1px rgba(1, 1, 123, 0.04), 0 2px 4px -1px rgba(1, 1, 123, 0.02) !important;
        }
        .shadow-\\[\\#01017b\\]\\/20 {
          box-shadow: 0 10px 15px -3px rgba(1, 1, 123, 0.06), 0 4px 6px -2px rgba(1, 1, 123, 0.03) !important;
        }
        .shadow-\\[\\#01017b\\]\\/30 {
          box-shadow: 0 20px 25px -5px rgba(1, 1, 123, 0.08), 0 10px 10px -5px rgba(1, 1, 123, 0.04) !important;
        }
        
        /* Ring focuses */
        .focus\\:ring-\\[\\#01017b\\]\\/15:focus {
          --tw-ring-color: rgba(1, 1, 123, 0.15) !important;
        }
        .focus\\:border-\\[\\#01017b\\]:focus {
          border-color: var(--primary-custom) !important;
        }
      `;
      setStyleContent(cssRules);
    } else {
      setStyleContent('');
    }
  }, [colegio]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F5F7]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#01017b] border-t-transparent"></div>
      </div>
    );
  }

  // Definir menú de navegación según el rol
  const getMenuItems = () => {
    switch (user.rol) {
      case 'superadmin':
        return [
          { name: 'Dashboard Global', icon: LayoutDashboard, path: '/superadmin' },
          { name: 'Gestión Colegios', icon: BookOpen, path: '/superadmin?tab=colegios' },
          { name: 'Control de Usuarios', icon: Users, path: '/superadmin?tab=usuarios' },
          { name: 'Configuración', icon: Settings, path: '/superadmin/settings' },
        ];
      case 'director':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/director' },
          { name: 'Caja y Finanzas', icon: CreditCard, path: '/director/finanzas' },
          { name: 'Alumnado y Matrícula', icon: Users, path: '/director/alumnos' },
          { name: 'Personal Docente', icon: UserCheck, path: '/director/docentes' },
          { name: 'Reportes Tempranos', icon: FileSpreadsheet, path: '/director/reportes' },
          { name: 'Configuración', icon: Settings, path: '/director/settings' },
        ];
      case 'docente':
        return [
          { name: 'Mi Horario', icon: Calendar, path: '/docente' },
          { name: 'Control Asistencias', icon: UserCheck, path: '/docente/asistencias' },
          { name: 'Calificaciones', icon: ClipboardList, path: '/docente/notas' },
          { name: 'Repositorio', icon: BookOpen, path: '/docente/materiales' },
          { name: 'Configuración', icon: Settings, path: '/docente/settings' },
        ];
      case 'padre':
        return [
          { name: 'Mi Familia', icon: Users, path: '/padre' },
          { name: 'Boletas de Notas', icon: ClipboardList, path: '/padre/notas' },
          { name: 'Estado de Cuenta', icon: CreditCard, path: '/padre/pagos' },
          { name: 'Justificaciones', icon: FileSpreadsheet, path: '/padre/justificaciones' },
          { name: 'Configuración', icon: Settings, path: '/padre/settings' },
        ];
      case 'alumno':
        return [
          { name: 'Inicio', icon: LayoutDashboard, path: '/alumno' },
          { name: 'Mi Horario', icon: Calendar, path: '/alumno/horario' },
          { name: 'Entregas', icon: ClipboardList, path: '/alumno/tareas' },
          { name: 'Mis Cursos', icon: BookOpen, path: '/alumno/cursos' },
          { name: 'Configuración', icon: Settings, path: '/alumno/settings' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
      {/* 1. SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
      }`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Cabecera Sidebar */}
          <div className={`flex items-center h-16 border-b border-gray-150 gap-2 shrink-0 ${
            isSidebarCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'
          }`}>
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#01017b] text-white shrink-0">
                    <GraduationCap className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-extrabold tracking-tight text-gray-900 truncate">Linkedu</span>
                    <span className="text-[10px] text-gray-400 font-bold -mt-0.5 uppercase tracking-wide truncate">Intranet</span>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#01017b] hover:bg-[#EEF1FE] transition-all cursor-pointer shrink-0"
                  title="Contraer menú"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-400 hover:text-[#01017b] hover:bg-[#EEF1FE] transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Expandir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Menú de Navegación */}
          <Suspense fallback={<div className="flex-1 px-4 py-6 space-y-3"><div className="h-10 bg-gray-100 animate-pulse rounded-xl" /><div className="h-10 bg-gray-100 animate-pulse rounded-xl" /></div>}>
            <SidebarNav menuItems={menuItems} isCollapsed={isSidebarCollapsed} />
          </Suspense>

          {/* Perfil del Usuario al Fondo */}
          <div className="p-4 border-t border-gray-150 bg-gray-50/50">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'flex-col justify-center' : ''}`}>
              <button
                onClick={() => router.push(user.rol === 'director' ? '/director/settings' : `/${user.rol}/settings`)}
                className={`flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer group ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                title={isSidebarCollapsed ? `${user.nombre} ${user.apellido} (${user.rol})` : undefined}
              >
                <img 
                  src={user.foto_url} 
                  alt={`${user.nombre} ${user.apellido}`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-250 bg-gray-100 group-hover:border-[#01017b] transition-colors" 
                />
                {!isSidebarCollapsed && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-900 truncate leading-tight group-hover:text-[#01017b] transition-colors">
                      {user.nombre} {user.apellido}
                    </span>
                    <span className="text-[10px] font-bold text-[#01017b] uppercase tracking-wide mt-0.5">
                      {user.rol}
                    </span>
                  </div>
                )}
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. AREA DE CONTENIDO PRINCIPAL */}
      <div className={`flex flex-col flex-1 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      } overflow-hidden transition-all duration-300`}>
        {/* Cabecera Superior */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shrink-0 z-20">
          {/* Botón de Menú Móvil */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-500 md:hidden hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Colegio Activo o Panel Global */}
          <div className="hidden sm:flex items-center gap-2">
            {colegio ? (
              <>
                <img 
                  src={colegio.logo} 
                  alt="Logo" 
                  className="w-7 h-7 rounded object-cover"
                />
                <span className="text-xs font-bold text-gray-500">
                  {colegio.nombre}
                </span>
              </>
            ) : (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9B7FD4]/10 text-[#9B7FD4] text-xs">
                  🌐
                </div>
                <span className="text-xs font-extrabold text-[#9B7FD4] uppercase tracking-wide">
                  Administrador Global
                </span>
              </>
            )}
          </div>

          {/* Acciones de la Cabecera */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-1.5 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <span className="sr-only">Notificaciones</span>
              <Bell className="w-5 h-5" />
              {comunicados.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E07B6A]" />
              )}
            </button>
            <div className="h-5 w-[1px] bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400">Año Académico 2026</span>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#F4F5F7]">
          {children}
        </main>
      </div>

      {/* 3. SIDEBAR / MENÚ MÓVIL OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer Menu */}
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#01017b] text-white">
                  <GraduationCap className="h-5.5 w-5.5" />
                </div>
                <span className="text-sm font-extrabold tracking-tight text-gray-900">Linkedu</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Suspense fallback={<div className="flex-1 px-4 py-6 space-y-3"><div className="h-10 bg-gray-100 animate-pulse rounded-xl" /><div className="h-10 bg-gray-100 animate-pulse rounded-xl" /></div>}>
              <MobileSidebarNav menuItems={menuItems} onClose={() => setMobileMenuOpen(false)} />
            </Suspense>

            <div className="p-4 border-t border-gray-150 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(user.rol === 'director' ? '/director/settings' : `/${user.rol}/settings`);
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <img 
                    src={user.foto_url} 
                    alt={user.nombre}
                    className="w-10 h-10 rounded-full object-cover border border-gray-250 bg-gray-100" 
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-900 truncate">{user.nombre} {user.apellido}</span>
                    <span className="text-[10px] font-bold text-[#01017b] uppercase mt-0.5">{user.rol}</span>
                  </div>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TABLÓN DE COMUNICADOS SLIDING DRAWER (ACCESIBLE POR TODOS DESDE LA CAMPANA) */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowNotifDrawer(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity" 
          />

          {/* Sliding Pane */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-150 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#01017b]" />
                <div>
                  <h3 className="text-sm font-black text-gray-955">Tablón de Comunicados</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avisos y Eventos VIP</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotifDrawer(false)}
                className="p-1.5 hover:bg-gray-150 rounded-xl transition-all cursor-pointer text-gray-450 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-3.5 border-b border-gray-100 bg-gray-50/20 overflow-x-auto custom-scrollbar">
              {(['Todos', 'Evento', 'Examen', 'General'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setNotifFiltro(tab)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    notifFiltro === tab
                      ? 'bg-[#01017b] text-white font-bold'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'Todos' ? '📂 Todos' : tab === 'Evento' ? '🎉 Eventos' : tab === 'Examen' ? '📝 Exámenes' : '📢 Avisos'}
                </button>
              ))}
            </div>

            {/* Create Announcement Button (Only Director or Docente) */}
            {(user.rol === 'director' || user.rol === 'docente') && (
              <div className="p-4 border-b border-gray-100 bg-[#EEF1FE]/30">
                <button
                  onClick={() => setShowCreateNotifModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm shadow-[#01017b]/10 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  Publicar Comunicado {user.rol === 'docente' ? 'de Asignatura' : 'General'}
                </button>
              </div>
            )}

            {/* Announcements List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-left">
              {comunicados
                .filter(c => notifFiltro === 'Todos' || c.categoria === notifFiltro)
                .map(c => {
                  const isOwner = user.rol === 'director' || (user.rol === 'docente' && c.remitente.includes(user.nombre));
                  return (
                    <div 
                      key={c.id} 
                      className={`p-4 border rounded-2xl relative group transition-all duration-300 hover:border-gray-300 hover:shadow-xs ${
                        c.categoria === 'Evento' ? 'border-[#5BAD8A]/20 bg-[#EAF5EF]/10' :
                        c.categoria === 'Examen' ? 'border-[#9B7FD4]/20 bg-[#F3EFFE]/10' :
                        'border-gray-200 bg-gray-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-xs ${
                          c.categoria === 'Evento' ? 'bg-[#5BAD8A]/10 text-[#5BAD8A]' :
                          c.categoria === 'Examen' ? 'bg-[#9B7FD4]/10 text-[#9B7FD4]' :
                          'bg-[#01017b]/10 text-[#01017b]'
                        }`}>
                          {c.categoria === 'Evento' ? '🎉' : c.categoria === 'Examen' ? '📝' : '📢'}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            c.categoria === 'Evento' ? 'bg-[#EAF5EF] text-[#5BAD8A]' :
                            c.categoria === 'Examen' ? 'bg-[#F3EFFE] text-[#9B7FD4]' :
                            'bg-[#EEF1FE] text-[#01017b]'
                          }`}>
                            {c.categoria} {c.curso ? `• ${c.curso}` : ''}
                          </span>
                          <h4 className="text-xs font-black text-gray-955 mt-2 leading-snug">{c.titulo}</h4>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1.5 whitespace-pre-line">{c.mensaje}</p>
                          
                          <div className="flex items-center gap-1.5 mt-3 border-t border-gray-100 pt-2 text-[9px] text-gray-450 font-bold uppercase tracking-wider">
                            <span>✍️ {c.remitente}</span>
                            <span>•</span>
                            <span>📅 {c.fecha}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Action Button (Visible to publishers/directors on hover) */}
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteNotif(c.id)}
                          className="absolute top-3 right-3 p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-lg hover:shadow-xs transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Eliminar comunicado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

              {comunicados.filter(c => notifFiltro === 'Todos' || c.categoria === notifFiltro).length === 0 && (
                <div className="py-12 text-center text-xs font-bold text-gray-400">
                  No hay comunicados registrados en esta categoría.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: PUBLICAR NUEVO COMUNICADO */}
      {showCreateNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowCreateNotifModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3.5 mb-4">
              <h3 className="text-base font-black text-gray-955 flex items-center gap-2">
                📢 Publicar Comunicado
              </h3>
              <button 
                onClick={() => setShowCreateNotifModal(false)}
                className="text-gray-450 hover:text-gray-650 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotifSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Categoría</label>
                <select
                  value={newNotif.categoria}
                  onChange={(e) => setNewNotif({ ...newNotif, categoria: e.target.value as any })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                >
                  <option value="General">📢 Aviso General</option>
                  <option value="Evento">🎉 Evento Escolar</option>
                  <option value="Examen">📝 Notificación de Examen</option>
                </select>
              </div>

              {user.rol === 'docente' && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Asignatura (Ámbito Parcial)</label>
                  <select
                    value={newNotif.curso}
                    onChange={(e) => setNewNotif({ ...newNotif, curso: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                  >
                    {teacherCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-gray-400 mt-1 font-semibold">
                    * Como docente, tu publicación se asocia de forma parcial a tu curso asignado.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Título del Anuncio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cambio de horario o Material necesario"
                  value={newNotif.titulo}
                  onChange={(e) => setNewNotif({ ...newNotif, titulo: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Mensaje o Detalle</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe el contenido detallado de la comunicación para los alumnos y padres..."
                  value={newNotif.mensaje}
                  onChange={(e) => setNewNotif({ ...newNotif, mensaje: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateNotifModal(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Publicar Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL FLOTANTE: COMUNICADO CRÍTICO DE ALTA IMPORTANCIA */}
      {activeHighPriorityNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 text-left animate-in zoom-in-95 duration-200">
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#01017b]/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header / Accent Badge */}
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-full ring-1 ring-red-500/20 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                🚨 Notificación Académica Crítica
              </span>
              <button
                onClick={() => {
                  if (user) {
                    localStorage.setItem(`linkedu_dismissed_announcement_${user.id}_${activeHighPriorityNotif.id}`, 'true');
                  }
                  setActiveHighPriorityNotif(null);
                  playNotificationSound();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="Cerrar y recordar luego"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Announcement Title & Details */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-black text-gray-955 leading-tight">
                {activeHighPriorityNotif.titulo}
              </h3>
              
              <div className="p-4 bg-white/50 border border-white/60 rounded-2xl">
                <p className="text-xs md:text-sm text-gray-700 font-semibold leading-relaxed whitespace-pre-line">
                  {activeHighPriorityNotif.mensaje}
                </p>
              </div>

              {/* Sender & Date Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-400 font-extrabold uppercase tracking-wide border-t border-gray-150/40 pt-4">
                <div className="flex items-center gap-1">
                  <span>✍️ Emisor:</span>
                  <span className="text-gray-600 font-black">{activeHighPriorityNotif.remitente}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅 Publicado:</span>
                  <span className="text-gray-600 font-black">{activeHighPriorityNotif.fecha}</span>
                </div>
              </div>
            </div>

            {/* CTA Close Action */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (user) {
                    localStorage.setItem(`linkedu_dismissed_announcement_${user.id}_${activeHighPriorityNotif.id}`, 'true');
                  }
                  setActiveHighPriorityNotif(null);
                  playNotificationSound();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-750 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-red-500/20 active:scale-98 transition-all cursor-pointer text-center font-bold"
              >
                Entendido, marcar como leído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
