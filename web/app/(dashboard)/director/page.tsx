'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  ArrowUpRight, 
  Users, 
  CalendarCheck,
  Send,
  Plus,
  FileDown
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
  Cell 
} from 'recharts';

// Datos de flujo de caja simulados (basados en seed.sql)
const cashFlowData = [
  { mes: 'Ene', Ingresos: 12000, Egresos: 8000 },
  { mes: 'Feb', Ingresos: 13500, Egresos: 7500 },
  { mes: 'Mar', Ingresos: 18500, Egresos: 11000 }, // Inicio año escolar
  { mes: 'Abr', Ingresos: 14000, Egresos: 9000 },
  { mes: 'May', Ingresos: 15800, Egresos: 12350 }, // Mes actual (Ingresos: 4 matrículas/pagos = 1730, etc.)
];

// Datos de rendimiento académico (Pie Chart)
const academicPerformance = [
  { name: 'Aprobados', value: 85, color: '#5BAD8A' },
  { name: 'En Riesgo (<11)', value: 15, color: '#E07B6A' },
];

const MOCK_DEUDORES = [
  { id: '1', nombre: 'Mateo Castro', seccion: '1ro Primaria - A', deuda: 'S/. 380.00', diasAtraso: 15, estado: 'Moroso' },
  { id: '2', nombre: 'Lucas Castro', seccion: '2do Primaria - A', deuda: 'S/. 380.00', diasAtraso: 5, estado: 'Pendiente' },
];

export default function DirectorDashboard() {
  const [deudores, setDeudores] = useState(MOCK_DEUDORES);
  const [showAddEgreso, setShowAddEgreso] = useState(false);
  const [newEgreso, setNewEgreso] = useState({ categoria: 'Servicios', descripcion: '', monto: '' });
  const [egresosActuales, setEgresosActuales] = useState([
    { id: 1, categoria: 'Planilla', descripcion: 'Planillas docentes Mayo 2026', monto: 1500, fecha: '2026-05-15' },
    { id: 2, categoria: 'Servicios', descripcion: 'Pago de luz e internet', monto: 350, fecha: '2026-05-10' },
  ]);

  const handleSendReminder = (id: string, nombre: string) => {
    alert(`Recordatorio de pago enviado con éxito vía Notificación Push y Email al tutor de ${nombre}`);
  };

  const handleAddEgresoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEgreso.descripcion || !newEgreso.monto) return;

    const added = {
      id: Date.now(),
      categoria: newEgreso.categoria,
      descripcion: newEgreso.descripcion,
      monto: parseFloat(newEgreso.monto),
      fecha: new Date().toISOString().split('T')[0]
    };

    setEgresosActuales([added, ...egresosActuales]);
    setShowAddEgreso(false);
    setNewEgreso({ categoria: 'Servicios', descripcion: '', monto: '' });
  };

  // Calcular totales
  const totalIngresos = 1730; // Simulando ingresos totales de seed.sql pagos
  const totalEgresos = egresosActuales.reduce((acc, curr) => acc + curr.monto, 0);
  const saldoCaja = totalIngresos - totalEgresos;

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Panel Ejecutivo</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisión financiera y rendimiento de tu institución en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-250 text-gray-700 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-50 cursor-pointer">
            <FileDown className="w-4.5 h-4.5 text-gray-400" />
            Exportar PDF
          </button>
          <button 
            onClick={() => setShowAddEgreso(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#4F6AF0]/20 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Registrar Egreso
          </button>
        </div>
      </div>

      {/* 2. TARJETAS DE KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI: Ingresos del Mes */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos del Mes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5BAD8A]/10 text-[#5BAD8A]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-gray-900">S/. {totalIngresos.toLocaleString()}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#5BAD8A]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12.4% vs meta</span>
            </div>
          </div>
        </div>

        {/* KPI: Egresos del Mes */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Egresos del Mes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E07B6A]/10 text-[#E07B6A]">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-gray-900">S/. {totalEgresos.toLocaleString()}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-gray-500">
              <span>S/. 1,850 planificado</span>
            </div>
          </div>
        </div>

        {/* KPI: Saldo de Caja */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo en Caja</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F6AF0]/10 text-[#4F6AF0]">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-2xl font-black ${saldoCaja >= 0 ? 'text-gray-900' : 'text-[#E07B6A]'}`}>
              S/. {saldoCaja.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-gray-500">
              <span>Flujo positivo</span>
            </div>
          </div>
        </div>

        {/* KPI: Alumnos en Mora */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pensiones Vencidas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#F5A623]">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-gray-900">{deudores.filter(d => d.estado === 'Moroso').length}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#E07B6A]">
              <span>Requiere acción rápida</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICOS Y ANALÍTICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Flujo de Caja (2/3 de ancho) */}
        <div className="premium-card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Flujo de Caja Histórico (Últimos 5 meses)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #EAECF0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  cursor={{ fill: 'rgba(79, 106, 240, 0.03)' }}
                />
                <Bar dataKey="Ingresos" fill="#4F6AF0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#E07B6A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Rendimiento Académico (1/3 de ancho) */}
        <div className="premium-card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Rendimiento Académico</h3>
          <div className="h-60 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={academicPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {academicPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-900">85%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aprobados</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {academicPerformance.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN INFERIOR: MOROSIDAD Y EGRESOS RECIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de Alumnos Morosos */}
        <div className="premium-card p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Alertas de Pensiones Vencidas</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-55/15 text-[#E07B6A] uppercase tracking-wide">Prioridad Alta</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Estudiante</th>
                  <th className="pb-3 font-bold">Sección</th>
                  <th className="pb-3 font-bold">Monto</th>
                  <th className="pb-3 font-bold">Atraso</th>
                  <th className="pb-3 text-right font-bold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deudores.map((deudor) => (
                  <tr key={deudor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-gray-950">{deudor.nombre}</td>
                    <td className="py-3.5 text-gray-500 font-semibold">{deudor.seccion}</td>
                    <td className="py-3.5 font-bold text-[#E07B6A]">{deudor.deuda}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECEA] text-[#E07B6A]">
                        {deudor.diasAtraso} días
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleSendReminder(deudor.id, deudor.nombre)}
                        className="p-2 bg-gray-100 hover:bg-[#EEF1FE] hover:text-[#4F6AF0] rounded-xl text-gray-500 transition-all cursor-pointer"
                        title="Enviar recordatorio"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Listado de Egresos Recientes */}
        <div className="premium-card p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Gastos y Egresos del Mes</h3>
            <span className="text-xs font-bold text-gray-500">Últimos registrados</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Concepto</th>
                  <th className="pb-3 font-bold">Categoría</th>
                  <th className="pb-3 font-bold">Fecha</th>
                  <th className="pb-3 text-right font-bold">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {egresosActuales.map((egreso) => (
                  <tr key={egreso.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-gray-950">{egreso.descripcion}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        egreso.categoria === 'Planilla' ? 'bg-[#F3EFFE] text-[#9B7FD4]' : 'bg-[#EAF7F7] text-[#7EC8C8]'
                      }`}>
                        {egreso.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-400 text-xs font-semibold">{egreso.fecha}</td>
                    <td className="py-3.5 text-right font-black text-gray-950">S/. {egreso.monto.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL MOCK DE REGISTRO DE EGRESO */}
      {showAddEgreso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAddEgreso(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-gray-950 mb-4">Registrar Egreso</h3>
            <form onSubmit={handleAddEgresoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</label>
                <select
                  value={newEgreso.categoria}
                  onChange={(e) => setNewEgreso({ ...newEgreso, categoria: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] text-sm"
                >
                  <option value="Planilla">Planilla Docente</option>
                  <option value="Servicios">Servicios Básicos</option>
                  <option value="Proveedores">Proveedores</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Otro">Otro Gasto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Pago de planilla de docentes Mayo"
                  value={newEgreso.descripcion}
                  onChange={(e) => setNewEgreso({ ...newEgreso, descripcion: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monto (S/.)</label>
                <input
                  type="number"
                  placeholder="500.00"
                  value={newEgreso.monto}
                  onChange={(e) => setNewEgreso({ ...newEgreso, monto: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] text-sm"
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
                  className="px-4 py-2 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Guardar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
