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
  Check
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

export default function SuperAdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState(tabParam);
  const [colegios, setColegios] = useState<ColegioInfo[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  
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
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#4F6AF0]/20 cursor-pointer"
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
              ? 'bg-[#EEF1FE] text-[#4F6AF0]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Métricas Globales
        </button>
        <button
          onClick={() => handleTabChange('colegios')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'colegios'
              ? 'bg-[#EEF1FE] text-[#4F6AF0]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Gestionar Colegios ({colegios.length})
        </button>
        <button
          onClick={() => handleTabChange('usuarios')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-[#EEF1FE] text-[#4F6AF0]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Control de Usuarios
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F6AF0]/10 text-[#4F6AF0]">
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
                <p className="text-xs text-gray-500 font-bold mt-1">Ecosistema Linkedu</p>
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
                      <stop offset="5%" stopColor="#4F6AF0" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4F6AF0" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #EAECF0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  />
                  <Area type="monotone" dataKey="Ingresos" stroke="#4F6AF0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaaS)" />
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
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] text-sm font-semibold"
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
                          ? 'bg-[#EEF1FE] text-[#4F6AF0]'
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
                    className="block w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15"
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
                            <span className="text-[10px] text-gray-400 truncate mt-0.5">{usr.email || 'sin-correo@linkedu.com'}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-xs text-gray-500">{usr.dni}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            usr.rol === 'director' ? 'bg-[#EEF1FE] text-[#4F6AF0]' :
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

      {/* ================= MODAL: NUEVO COLEGIO ================= */}
      {showAddColegio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAddColegio(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4F6AF0]" />
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
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] text-sm"
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
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] text-sm"
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
                        className="flex-1 rounded-xl border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-xs"
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
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-sm"
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
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-sm"
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
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-sm"
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
                  className="px-4 py-2 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Dar de Alta
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
