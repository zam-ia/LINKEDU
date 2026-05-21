'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  ArrowUpRight, 
  Users, 
  Plus, 
  FileDown, 
  Search, 
  Send, 
  Check, 
  DollarSign, 
  Lock, 
  ChevronRight,
  Sparkles,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  getStoredPagos, 
  saveStoredPagos, 
  getStoredAlumnos, 
  saveStoredAlumnos,
  getStoredDocentes,
  getStoredColegios,
  PagoInfo,
  AlumnoInfo,
  DocenteInfo
} from '@/lib/supabase/client';

export default function FinanzasPage() {
  const { user, colegio } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'cobrar' | 'egresos' | 'planillas' | 'dashboard'>('cobrar');
  const [pagos, setPagos] = useState<PagoInfo[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
  const [docentes, setDocentes] = useState<DocenteInfo[]>([]);
  const [schoolPlan, setSchoolPlan] = useState('Premium SaaS');

  // Filters & State for Cuentas por Cobrar
  const [searchCobrar, setSearchCobrar] = useState('');
  const [filterEstadoCobrar, setFilterEstadoCobrar] = useState<'todos' | 'pendiente' | 'vencido' | 'pagado'>('todos');
  const [filterGradoCobrar, setFilterGradoCobrar] = useState('todos');

  // Filters for Egresos
  const [filterCatEgreso, setFilterCatEgreso] = useState('todos');

  // Modals
  const [showAddEgreso, setShowAddEgreso] = useState(false);
  const [newEgreso, setNewEgreso] = useState({ categoria: 'Servicios', descripcion: '', monto: '' });

  const [showRegistrarPago, setShowRegistrarPago] = useState(false);
  const [activePagoToRegister, setActivePagoToRegister] = useState<PagoInfo | null>(null);
  const [pagoMetodo, setPagoMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [pagoReferencia, setPagoReferencia] = useState('');

  // Toast / Alerts
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    // Cargar datos de localStorage
    const storedPagos = getStoredPagos();
    const storedAlumnos = getStoredAlumnos();
    const storedDocentes = getStoredDocentes();
    const storedColegios = getStoredColegios();

    if (colegio) {
      const matchCol = storedColegios.find(c => c.id === colegio.id);
      if (matchCol) {
        setSchoolPlan(matchCol.plan || 'Premium SaaS');
      }
      
      // Filtrar por el colegio activo
      setPagos(storedPagos.filter(p => p.colegio_id === colegio.id));
      setAlumnos(storedAlumnos.filter(a => a.colegio_id === colegio.id));
      setDocentes(storedDocentes.filter(d => d.colegio_id === colegio.id));
    }
  }, [colegio]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  // Validaciones de plan
  const isBasico = schoolPlan.includes('Básico');
  const isEstandar = schoolPlan.includes('Estandar') || schoolPlan.includes('Estándar');

  // ── MÉTODOS DE CAJA ────────────────────────────────────────────────

  const handleAddEgreso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colegio || !newEgreso.descripcion || !newEgreso.monto) return;

    const added: PagoInfo = {
      id: 'eg-' + Date.now(),
      colegio_id: colegio.id,
      alumno_id: null,
      concepto: newEgreso.descripcion,
      monto: parseFloat(newEgreso.monto),
      tipo: 'egreso',
      categoria: newEgreso.categoria as any,
      fecha: new Date().toISOString().split('T')[0],
      vencimiento: null,
      estado: 'pagado',
      metodo: 'Efectivo',
      comprobante: 'comprobante_egreso.pdf'
    };

    const storedGlobalPagos = getStoredPagos();
    const updated = [added, ...storedGlobalPagos];
    saveStoredPagos(updated);

    setPagos(updated.filter(p => p.colegio_id === colegio.id));
    setShowAddEgreso(false);
    setNewEgreso({ categoria: 'Servicios', descripcion: '', monto: '' });
    triggerAlert(`Egreso de S/. ${added.monto} registrado exitosamente.`);
  };

  const handleOpenRegistrarPago = (pago: PagoInfo) => {
    setActivePagoToRegister(pago);
    setPagoReferencia('');
    setShowRegistrarPago(true);
  };

  const handleSavePago = () => {
    if (!activePagoToRegister) return;

    const storedGlobalPagos = getStoredPagos();
    const updated = storedGlobalPagos.map(p => {
      if (p.id === activePagoToRegister.id) {
        return {
          ...p,
          estado: 'pagado' as const,
          metodo: pagoMetodo,
          comprobante: pagoReferencia ? `REF-${pagoReferencia}` : 'PAGO_MANUAL.pdf',
          fecha: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });

    saveStoredPagos(updated);
    setPagos(updated.filter(p => p.colegio_id === colegio?.id));

    // Sincronizar estado financiero del alumno
    if (activePagoToRegister.alumno_id) {
      const storedGlobalAlumnos = getStoredAlumnos();
      const updatedAlumnos = storedGlobalAlumnos.map(a => {
        if (a.id === activePagoToRegister.alumno_id) {
          // Si no tiene más pagos vencidos, pasa a 'al_dia'
          const remainingVencidos = updated.filter(p => p.alumno_id === a.id && p.estado === 'vencido' && p.id !== activePagoToRegister.id);
          return {
            ...a,
            financiero: remainingVencidos.length > 0 ? ('en_mora' as const) : ('al_dia' as const)
          };
        }
        return a;
      });
      saveStoredAlumnos(updatedAlumnos);
    }

    setShowRegistrarPago(false);
    setActivePagoToRegister(null);
    triggerAlert('Pago registrado y validado con éxito. Caja chica actualizada.');
  };

  const handleSendReminder = (pago: PagoInfo) => {
    const student = alumnos.find(a => a.id === pago.alumno_id);
    if (!student) return;

    // Simular llamada de recordatorio
    alert(`Notificación enviada a ${student.contacto_tutor.nombre} (${student.contacto_tutor.relacion} de ${student.nombre}):
🔔 "Recordatorio: Se encuentra pendiente de pago la pensión '${pago.concepto}' por un monto de S/. ${pago.monto}. Vencimiento: ${pago.vencimiento}."`);
    triggerAlert(`Recordatorio enviado a tutor de ${student.nombre}.`);
  };

  const handlePagarPlanilla = (docente: DocenteInfo) => {
    if (!colegio) return;
    
    // Crear egreso automático
    const added: PagoInfo = {
      id: 'eg-planilla-' + Date.now(),
      colegio_id: colegio.id,
      alumno_id: null,
      concepto: `Pago Planilla Docente - ${docente.nombre} ${docente.apellido}`,
      monto: docente.salario,
      tipo: 'egreso',
      categoria: 'Planilla',
      fecha: new Date().toISOString().split('T')[0],
      vencimiento: null,
      estado: 'pagado',
      metodo: 'Transferencia',
      comprobante: `RECIBO_PLANILLA_${docente.dni}.pdf`
    };

    const storedGlobalPagos = getStoredPagos();
    saveStoredPagos([added, ...storedGlobalPagos]);

    setPagos([added, ...pagos]);
    triggerAlert(`Planilla de S/. ${docente.salario} pagada a ${docente.nombre} ${docente.apellido}.`);
  };

  // ── FILTROS Y DATOS DE VISTA ────────────────────────────────────────

  const listCobrar = pagos.filter(p => {
    if (p.tipo !== 'ingreso') return false;
    const student = alumnos.find(a => a.id === p.alumno_id);
    
    const matchesSearch = student 
      ? `${student.nombre} ${student.apellido}`.toLowerCase().includes(searchCobrar.toLowerCase()) || student.dni.includes(searchCobrar)
      : false;
      
    const matchesEstado = filterEstadoCobrar === 'todos' || p.estado === filterEstadoCobrar;
    const matchesGrado = filterGradoCobrar === 'todos' || (student && student.grado === filterGradoCobrar);

    return matchesSearch && matchesEstado && matchesGrado;
  });

  const listEgresos = pagos.filter(p => {
    if (p.tipo !== 'egreso') return false;
    const matchesCat = filterCatEgreso === 'todos' || p.categoria === filterCatEgreso;
    return matchesCat;
  });

  // Totales
  const totalIngresos = pagos.filter(p => p.tipo === 'ingreso' && p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0);
  const totalPendientes = pagos.filter(p => p.tipo === 'ingreso' && p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0);
  const totalVencidos = pagos.filter(p => p.tipo === 'ingreso' && p.estado === 'vencido').reduce((sum, p) => sum + p.monto, 0);
  const totalEgresos = pagos.filter(p => p.tipo === 'egreso').reduce((sum, p) => sum + p.monto, 0);
  const saldoNeto = totalIngresos - totalEgresos;

  // Recharts Cashflow Data (Simulada mensual)
  const cashFlowData = [
    { mes: 'Ene', Ingresos: 12000, Egresos: 8000 },
    { mes: 'Feb', Ingresos: 13500, Egresos: 7500 },
    { mes: 'Mar', Ingresos: 18500, Egresos: 11000 },
    { mes: 'Abr', Ingresos: 14000, Egresos: 9000 },
    { mes: 'May', Ingresos: totalIngresos, Egresos: totalEgresos },
  ];

  // Recharts Egresos Categorías
  const egresosPorCategoria = [
    { name: 'Planillas', value: pagos.filter(p => p.tipo === 'egreso' && p.categoria === 'Planilla').reduce((sum, p) => sum + p.monto, 0), color: '#9B7FD4' },
    { name: 'Servicios', value: pagos.filter(p => p.tipo === 'egreso' && p.categoria === 'Servicios').reduce((sum, p) => sum + p.monto, 0), color: '#7EC8C8' },
    { name: 'Proveedores', value: pagos.filter(p => p.tipo === 'egreso' && p.categoria === 'Proveedores').reduce((sum, p) => sum + p.monto, 0), color: '#F5A623' },
    { name: 'Mantenimiento', value: pagos.filter(p => p.tipo === 'egreso' && p.categoria === 'Mantenimiento').reduce((sum, p) => sum + p.monto, 0), color: '#E07B6A' },
  ].filter(c => c.value > 0);

  // Grados únicos para filtro
  const gradosDisponibles = Array.from(new Set(alumnos.map(a => a.grado)));

  return (
    <div className="space-y-6 relative">
      {/* ALERTA FLOTANTE PREMIUM */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* 1. ENCABEZADO DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Caja y Finanzas</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisión contable, facturación mensual de pensiones y nómina de docentes.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-250 text-gray-700 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-50 cursor-pointer"
          >
            <Printer className="w-4.5 h-4.5 text-gray-400" />
            Imprimir Reporte
          </button>
          {!isBasico && (
            <button 
              onClick={() => setShowAddEgreso(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#4F6AF0]/20 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Registrar Egreso
            </button>
          )}
        </div>
      </div>

      {/* 2. PLAN STATUS INDICATOR (SAAS TIERING) */}
      <div className="flex items-center justify-between p-3.5 bg-white border border-gray-150 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#4F6AF0] animate-pulse" />
          <span className="text-xs font-semibold text-gray-500">Plan del Colegio:</span>
          <span className="text-xs font-black uppercase tracking-wider text-[#4F6AF0]">{schoolPlan}</span>
        </div>
        {isBasico && (
          <span className="text-[10px] font-bold text-[#E07B6A] bg-[#FDECEA] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Funcionalidad de Finanzas Bloqueada
          </span>
        )}
      </div>

      {/* RENDERIZADO CONDICIONAL DE BLOQUEO SAAS DE PLAN BÁSICO */}
      {isBasico ? (
        <div className="relative premium-card p-12 overflow-hidden bg-white/60 backdrop-blur-md border border-gray-100 flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-16 w-16 bg-[#EEF1FE] rounded-2xl flex items-center justify-center text-3xl shadow-md">
            🔒
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-black text-gray-900">Módulo de Finanzas Exclusivo</h2>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              El portal de Caja, Egresos, Cuentas por Cobrar y Planilla de docentes se encuentra habilitado únicamente para colegios en planes **Estándar** o **Premium**.
            </p>
          </div>
          <button 
            onClick={() => alert('¡Solicitud de Upgrade enviada! Nuestro equipo comercial se comunicará contigo en breve para activar tu Plan Premium.')}
            className="px-6 py-3 bg-[#4F6AF0] text-white hover:bg-[#4F6AF0]/90 font-bold text-xs rounded-xl shadow-lg shadow-[#4F6AF0]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4.5 h-4.5 text-[#F5A623]" />
            Solicitar Upgrade a Plan Premium
          </button>
        </div>
      ) : (
        <>
          {/* 3. TARJETAS DE KPIs FINANCIEROS REALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI: Ingresos de Pensiones */}
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ingresos Mayo (Cobrados)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BAD8A]/10 text-[#5BAD8A]">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3.5">
                <span className="text-2xl font-black text-gray-900">S/. {totalIngresos.toLocaleString()}</span>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-gray-400">
                  <span>De un total facturado de S/. {(totalIngresos + totalPendientes + totalVencidos).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* KPI: Egresos Reales */}
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Egresos Mayo (Gastos)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E07B6A]/10 text-[#E07B6A]">
                  <TrendingDown className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3.5">
                <span className="text-2xl font-black text-gray-900">S/. {totalEgresos.toLocaleString()}</span>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-gray-400">
                  <span>Incluye Planillas y Servicios</span>
                </div>
              </div>
            </div>

            {/* KPI: Saldo Neto en Caja */}
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saldo de Caja Neto</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F6AF0]/10 text-[#4F6AF0]">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3.5">
                <span className={`text-2xl font-black ${saldoNeto >= 0 ? 'text-gray-900' : 'text-[#E07B6A]'}`}>
                  S/. {saldoNeto.toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-gray-400">
                  <span>Cobros cobrados menos egresos</span>
                </div>
              </div>
            </div>

            {/* KPI: Pensiones Vencidas / Por cobrar */}
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mora Vencida Actual</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#F5A623]">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3.5">
                <span className="text-2xl font-black text-[#E07B6A]">S/. {totalVencidos.toLocaleString()}</span>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-[#F5A623]">
                  <span>S/. {totalPendientes.toLocaleString()} pendientes por cobrar</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SUB-TABS INTERNOS DE NAVEGACIÓN */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('cobrar')}
              className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'cobrar'
                  ? 'border-[#4F6AF0] text-[#4F6AF0]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Cuentas por Cobrar
            </button>
            <button
              onClick={() => setActiveTab('egresos')}
              className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'egresos'
                  ? 'border-[#4F6AF0] text-[#4F6AF0]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Egresos / Gastos
            </button>
            <button
              onClick={() => setActiveTab('planillas')}
              className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'planillas'
                  ? 'border-[#4F6AF0] text-[#4F6AF0]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Planilla de Docentes
              {isEstandar && <Lock className="w-3 h-3 text-gray-400" />}
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-[#4F6AF0] text-[#4F6AF0]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Dashboard Financiero
            </button>
          </div>

          {/* ── CONTENIDO DEL SUB-TAB: CUENTAS POR COBRAR ── */}
          {activeTab === 'cobrar' && (
            <div className="premium-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-150 pb-4">
                <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                  <select
                    value={filterEstadoCobrar}
                    onChange={(e) => setFilterEstadoCobrar(e.target.value as any)}
                    className="rounded-xl border border-gray-300 py-1.5 px-3 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="vencido">Vencidos</option>
                    <option value="pagado">Pagados</option>
                  </select>
                  <select
                    value={filterGradoCobrar}
                    onChange={(e) => setFilterGradoCobrar(e.target.value)}
                    className="rounded-xl border border-gray-300 py-1.5 px-3 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15"
                  >
                    <option value="todos">Todos los Grados</option>
                    {gradosDisponibles.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchCobrar}
                    onChange={(e) => setSearchCobrar(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 pl-9 pr-3 py-1.5 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15"
                  />
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      <th className="p-3">Estudiante</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Vencimiento</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listCobrar.map((pago) => {
                      const student = alumnos.find(a => a.id === pago.alumno_id);
                      return (
                        <tr key={pago.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            {student && (
                              <>
                                <img src={student.foto_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex flex-col min-w-0">
                                  <span className="font-extrabold text-gray-950 truncate leading-snug">{student.nombre} {student.apellido}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{student.grado} - {student.seccion}</span>
                                </div>
                              </>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-xs text-gray-800">{pago.concepto}</td>
                          <td className="p-3 font-black text-xs text-gray-950">S/. {pago.monto.toFixed(2)}</td>
                          <td className="p-3 text-xs text-gray-400 font-bold">{pago.vencimiento || '—'}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              pago.estado === 'pagado' ? 'bg-[#EAF5EF] text-[#5BAD8A]' :
                              pago.estado === 'vencido' ? 'bg-[#FDECEA] text-[#E07B6A]' : 'bg-[#FEF6E8] text-[#F5A623]'
                            }`}>
                              {pago.estado}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {pago.estado !== 'pagado' && (
                                <>
                                  <button
                                    onClick={() => handleOpenRegistrarPago(pago)}
                                    className="px-2.5 py-1.5 bg-[#5BAD8A]/10 hover:bg-[#5BAD8A]/20 text-[#5BAD8A] text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                    title="Registrar Pago Manual"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Cobrar
                                  </button>
                                  <button
                                    onClick={() => handleSendReminder(pago)}
                                    className="p-1.5 bg-gray-50 hover:bg-[#EEF1FE] hover:text-[#4F6AF0] rounded-lg text-gray-400 transition-all cursor-pointer"
                                    title="Enviar Recordatorio"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {pago.estado === 'pagado' && (
                                <span className="text-[10px] font-bold text-gray-400 italic">Completado por {pago.metodo || 'Pasarela'}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {listCobrar.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-400 font-bold text-sm">
                          No hay obligaciones de cobro que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CONTENIDO DEL SUB-TAB: EGRESOS / GASTOS ── */}
          {activeTab === 'egresos' && (
            <div className="premium-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                <select
                  value={filterCatEgreso}
                  onChange={(e) => setFilterCatEgreso(e.target.value)}
                  className="rounded-xl border border-gray-300 py-1.5 px-3 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15"
                >
                  <option value="todos">Todas las Categorías</option>
                  <option value="Planilla">Planilla</option>
                  <option value="Servicios">Servicios Básicos</option>
                  <option value="Proveedores">Proveedores</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Otro">Otros Gastos</option>
                </select>
                <div className="text-xs font-bold text-gray-500">
                  Total Egresos: <span className="text-gray-950 font-black">S/. {totalEgresos.toLocaleString()}</span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      <th className="p-3">Concepto/Gasto</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Fecha de Pago</th>
                      <th className="p-3">Método</th>
                      <th className="p-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listEgresos.map((egreso) => (
                      <tr key={egreso.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-extrabold text-gray-950 text-xs">{egreso.concepto}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            egreso.categoria === 'Planilla' ? 'bg-[#F3EFFE] text-[#9B7FD4]' :
                            egreso.categoria === 'Servicios' ? 'bg-[#EAF7F7] text-[#7EC8C8]' : 'bg-[#FEF6E8] text-[#F5A623]'
                          }`}>
                            {egreso.categoria}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-400 font-bold">{egreso.fecha}</td>
                        <td className="p-3 text-xs text-gray-500 font-semibold">{egreso.metodo || 'Efectivo'}</td>
                        <td className="p-3 text-right font-black text-xs text-gray-950">S/. {egreso.monto.toFixed(2)}</td>
                      </tr>
                    ))}
                    {listEgresos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-sm">
                          No hay egresos registrados en este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CONTENIDO DEL SUB-TAB: PLANILLAS DOCENTES (BLOQUEO ESTÁNDAR) ── */}
          {activeTab === 'planillas' && (
            <div className="relative">
              {isEstandar && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl">
                  <div className="h-12 w-12 bg-[#FEF6E8] rounded-xl flex items-center justify-center text-xl shadow-xs border border-[#F5A623]/20">
                    🔒
                  </div>
                  <div className="max-w-xs">
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">Planillas de Personal Premium</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-normal">
                      La nómina automatizada de personal docente y su integración en egresos está habilitada únicamente para suscripciones **Premium SaaS**.
                    </p>
                  </div>
                  <button 
                    onClick={() => alert('Contáctanos al soporte para hacer el upgrade inmediato a tu Plan Premium.')}
                    className="px-4 py-2 bg-[#F5A623] hover:bg-[#F5A623]/95 text-white font-bold text-[10px] rounded-xl shadow-md cursor-pointer"
                  >
                    Desbloquear en Plan Premium
                  </button>
                </div>
              )}

              <div className="premium-card p-6 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Carga de Nómina del Mes</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Calcula los sueldos en base al contrato y permite el pago inmediato mediante transferencia simulada.</p>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <th className="p-3">Docente</th>
                        <th className="p-3">DNI</th>
                        <th className="p-3">Especialidad</th>
                        <th className="p-3">Contrato</th>
                        <th className="p-3">Sueldo Base</th>
                        <th className="p-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {docentes.map((doc) => {
                        const yaPagado = pagos.some(p => p.concepto.includes(doc.nombre) && p.concepto.includes(doc.apellido));
                        return (
                          <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 flex items-center gap-3">
                              <img src={doc.foto_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <span className="font-extrabold text-gray-955 text-xs">{doc.nombre} {doc.apellido}</span>
                            </td>
                            <td className="p-3 font-semibold text-xs text-gray-500">{doc.dni}</td>
                            <td className="p-3 font-semibold text-xs text-gray-500">{doc.especialidad}</td>
                            <td className="p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                {doc.contrato === 'planilla' ? 'Planilla' : 'Recibos'}
                              </span>
                            </td>
                            <td className="p-3 font-black text-xs text-gray-950">S/. {doc.salario.toFixed(2)}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handlePagarPlanilla(doc)}
                                disabled={yaPagado}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg shadow-xs cursor-pointer ${
                                  yaPagado 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                                    : 'bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white shadow-[#4F6AF0]/10'
                                }`}
                              >
                                {yaPagado ? 'Pagado ✓' : 'Pagar Sueldo'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTENIDO DEL SUB-TAB: DASHBOARD DE ANALÍTICAS ── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Flujo de caja histórico */}
                <div className="premium-card p-5 lg:col-span-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Flujo de Caja Real (Ingresos vs Egresos)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                        <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip 
                          contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #EAECF0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                          cursor={{ fill: 'rgba(79, 106, 240, 0.03)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                        <Bar dataKey="Ingresos" fill="#4F6AF0" name="Ingresos Cobrados" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Egresos" fill="#E07B6A" name="Gastos Reales" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie chart egresos */}
                <div className="premium-card p-5">
                  <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Distribución de Gastos</h3>
                  <div className="h-48 w-full flex items-center justify-center relative">
                    {egresosPorCategoria.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={egresosPorCategoria}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={65}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {egresosPorCategoria.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                          <span className="text-sm font-black text-gray-900">S/. {totalEgresos}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-bold">Sin egresos en el mes</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {egresosPorCategoria.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}</span>
                        </div>
                        <span className="text-gray-900">S/. {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= MODAL: REGISTRAR EGRESO ================= */}
      {showAddEgreso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs animate-fade-in" onClick={() => setShowAddEgreso(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-950 mb-4">Registrar Egreso Manual</h3>
            <form onSubmit={handleAddEgreso} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría del Gasto</label>
                <select
                  value={newEgreso.categoria}
                  onChange={(e) => setNewEgreso({ ...newEgreso, categoria: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-sm font-semibold"
                >
                  <option value="Servicios">Servicios Básicos (Luz, internet, agua)</option>
                  <option value="Proveedores">Proveedores Académicos</option>
                  <option value="Mantenimiento">Mantenimiento e Infraestructura</option>
                  <option value="Planilla">Honorarios Extraordinarios</option>
                  <option value="Otro">Otros Gastos Varios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Concepto / Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Pago de recibo de internet fibra óptica Claro"
                  value={newEgreso.descripcion}
                  onChange={(e) => setNewEgreso({ ...newEgreso, descripcion: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-sm font-semibold text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monto del Egreso (S/.)</label>
                <input
                  type="number"
                  placeholder="350.00"
                  value={newEgreso.monto}
                  onChange={(e) => setNewEgreso({ ...newEgreso, monto: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 text-sm font-black text-gray-900"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddEgreso(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E07B6A] hover:bg-[#E07B6A]/95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR COBRO / PAGO MANUAL ================= */}
      {showRegistrarPago && activePagoToRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowRegistrarPago(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-950 mb-1">Registrar Cobro de Pensión</h3>
            <p className="text-[10px] text-gray-400 font-semibold mb-4">Ingresa el pago manual realizado en efectivo o transferencia por el padre de familia.</p>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Concepto:</span>
                  <span className="font-extrabold text-gray-900">{activePagoToRegister.concepto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Monto:</span>
                  <span className="font-black text-[#5BAD8A]">S/. {activePagoToRegister.monto.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Método de Pago</label>
                <select
                  value={pagoMetodo}
                  onChange={(e) => setPagoMetodo(e.target.value as any)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BAD8A]/15 text-sm font-semibold"
                >
                  <option value="Efectivo">Efectivo Directo</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Tarjeta">Tarjeta (P.O.S.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">N° Referencia o Recibo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: BCP-1928372"
                  value={pagoReferencia}
                  onChange={(e) => setPagoReferencia(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#5BAD8A]/15 text-sm font-semibold text-gray-900"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => { setShowRegistrarPago(false); setActivePagoToRegister(null); }}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePago}
                  className="px-4 py-2 bg-[#5BAD8A] hover:bg-[#5BAD8A]/95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Completar Cobro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
