'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  Settings
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, colegio, logout, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4F6AF0] border-t-transparent"></div>
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
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden">
      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Cabecera Sidebar */}
          <div className="flex items-center h-16 px-6 border-b border-gray-150 gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F6AF0] text-white">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-gray-900">Linkedu</span>
              <span className="text-[10px] text-gray-400 font-bold -mt-0.5 uppercase tracking-wide">Intranet</span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.path);
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-[#EEF1FE] text-[#4F6AF0]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-[#4F6AF0]' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1 h-5 rounded-full bg-[#4F6AF0]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Perfil del Usuario al Fondo */}
          <div className="p-4 border-t border-gray-150 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(user.rol === 'director' ? '/director/settings' : `/${user.rol}/settings`)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer group"
              >
                <img 
                  src={user.foto_url} 
                  alt={`${user.nombre} ${user.apellido}`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-250 bg-gray-100 group-hover:border-[#4F6AF0] transition-colors" 
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-905 text-gray-900 truncate leading-tight group-hover:text-[#4F6AF0] transition-colors">
                    {user.nombre} {user.apellido}
                  </span>
                  <span className="text-[10px] font-bold text-[#4F6AF0] uppercase tracking-wide mt-0.5">
                    {user.rol}
                  </span>
                </div>
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
      <div className="flex flex-col flex-1 md:pl-64 overflow-hidden">
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
            <button className="relative p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span className="sr-only">Notificaciones</span>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E07B6A]" />
            </button>
            <div className="h-5 w-[1px] bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400">Año Académico 2026</span>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#F8F9FB]">
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F6AF0] text-white">
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

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      router.push(item.path);
                    }}
                    className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#EEF1FE] text-[#4F6AF0]' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-[#4F6AF0]' : 'text-gray-400'}`} />
                    {item.name}
                  </a>
                );
              })}
            </nav>

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
                    <span className="text-[10px] font-bold text-[#4F6AF0] uppercase mt-0.5">{user.rol}</span>
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
    </div>
  );
}
