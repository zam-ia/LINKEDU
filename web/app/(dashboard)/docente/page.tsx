'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  AlertTriangle, 
  Save, 
  Plus, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface AlumnoAsistencia {
  id: string;
  nombre: string;
  estado: 'P' | 'T' | 'F'; // P: Presente, T: Tardanza, F: Falta
}

const MOCK_ALUMNOS: AlumnoAsistencia[] = [
  { id: 'a1111111-1111-1111-1111-111111111111', nombre: 'Ana Díaz', estado: 'P' },
  { id: 'a2222222-2222-2222-2222-222222222222', nombre: 'Mateo Castro', estado: 'P' },
];

interface Evaluacion {
  id: string;
  nombre: string;
  tipo: string;
  peso: number;
}

const INITIAL_EVALUACIONES: Evaluacion[] = [
  { id: '1', nombre: 'Examen Parcial', tipo: 'examen', peso: 30 },
  { id: '2', nombre: 'Tareas y Talleres', tipo: 'tarea', peso: 30 },
  { id: '3', nombre: 'Examen Bimestral', tipo: 'examen', peso: 40 },
];

export default function DocenteDashboard() {
  // Estados para Asistencia
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>(MOCK_ALUMNOS);
  const [selectedClase, setSelectedClase] = useState('Matemática Divertida - 1ro A');
  const [asistenciaGuardada, setAsistenciaGuardada] = useState(false);

  // Estados para Evaluaciones y Notas
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>(INITIAL_EVALUACIONES);
  const [showConfigEvaluacion, setShowConfigEvaluacion] = useState(false);
  const [newEvalName, setNewEvalName] = useState('');
  const [newEvalPeso, setNewEvalPeso] = useState('');
  const [newEvalTipo, setNewEvalTipo] = useState('tarea');
  
  // Notas de alumnos simuladas
  const [notas, setNotas] = useState<Record<string, Record<string, number>>>({
    'a1111111-1111-1111-1111-111111111111': { '1': 16.5, '2': 18, '3': 15 },
    'a2222222-2222-2222-2222-222222222222': { '1': 11, '2': 12, '3': 10 },
  });

  // 1-Tap Asistencia Cíclica (P -> T -> F -> P)
  const handleToggleAsistencia = (alumnoId: string) => {
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(al => {
        if (al.id === alumnoId) {
          const nextEstado: Record<'P' | 'T' | 'F', 'P' | 'T' | 'F'> = {
            'P': 'T',
            'T': 'F',
            'F': 'P',
          };
          return { ...al, estado: nextEstado[al.estado] };
        }
        return al;
      })
    );
    setAsistenciaGuardada(false);
  };

  const handleSaveAsistencia = () => {
    setAsistenciaGuardada(true);
    const faltasCount = alumnos.filter(a => a.estado === 'F').length;
    alert(`Asistencia guardada con éxito. Se enviaron ${faltasCount} notificaciones de inasistencia a los padres.`);
  };

  // Agregar Evaluación con validación de Peso <= 100%
  const handleAddEvaluacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalName || !newEvalPeso) return;

    const pesoNum = parseInt(newEvalPeso);
    const totalActual = evaluaciones.reduce((acc, curr) => acc + curr.peso, 0);

    if (totalActual + pesoNum > 100) {
      alert(`Error: La suma de pesos no puede superar el 100%. Total actual: ${totalActual}%, faltante: ${100 - totalActual}%.`);
      return;
    }

    setEvaluaciones([...evaluaciones, {
      id: Date.now().toString(),
      nombre: newEvalName,
      tipo: newEvalTipo,
      peso: pesoNum
    }]);

    setShowConfigEvaluacion(false);
    setNewEvalName('');
    setNewEvalPeso('');
  };

  // Calcular suma total de pesos
  const totalPesos = evaluaciones.reduce((acc, curr) => acc + curr.peso, 0);

  // Modificar nota de celda interactiva
  const handleNotaChange = (alumnoId: string, evalId: string, val: string) => {
    let notaNum = parseFloat(val);
    if (isNaN(notaNum)) notaNum = 0;
    if (notaNum < 0) notaNum = 0;
    if (notaNum > 20) notaNum = 20;

    setNotas({
      ...notas,
      [alumnoId]: {
        ...notas[alumnoId],
        [evalId]: notaNum
      }
    });
  };

  // Calcular promedio en base a ponderaciones reales
  const calculatePromedio = (alumnoId: string) => {
    const alumnoNotas = notas[alumnoId] || {};
    let totalPonderado = 0;
    let sumaPesos = 0;

    evaluaciones.forEach(ev => {
      const nota = alumnoNotas[ev.id] || 0;
      totalPonderado += nota * (ev.peso / 100);
      sumaPesos += ev.peso;
    });

    // Escalar al porcentaje configurado por si no suma 100% aún
    if (sumaPesos === 0) return 0;
    const finalProm = (totalPonderado / (sumaPesos / 100));
    return parseFloat(finalProm.toFixed(2));
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-sans">Portal del Docente</h1>
        <p className="text-sm text-gray-500 mt-1">Registra la asistencia diaria y configura las evaluaciones del periodo activo.</p>
      </div>

      {/* 2. REGISTRO DE ASISTENCIA RÁPIDA (Optimizada para Móvil y Web) */}
      <div className="premium-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Control de Asistencia Rápida</h3>
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Clase activa: Matemática Divertida - 1ro A (08:00 - 09:30)
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSaveAsistencia}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5BAD8A] hover:bg-[#5BAD8A]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#5BAD8A]/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Asistencia
            </button>
          </div>
        </div>

        {/* Indicaciones visuales */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold text-gray-500">
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#5BAD8A]" /> Verde: Presente (1 tap)</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#F5A623]" /> Amarillo: Tardanza (2 taps)</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#E07B6A]" /> Rojo: Falta (3 taps)</span>
        </div>

        {/* Lista de Alumnos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alumnos.map((alumno) => (
            <div 
              key={alumno.id} 
              onClick={() => handleToggleAsistencia(alumno.id)}
              className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
                alumno.estado === 'P' ? 'border-[#5BAD8A]/35 bg-[#EAF5EF]/30 hover:bg-[#EAF5EF]/50' :
                alumno.estado === 'T' ? 'border-[#F5A623]/35 bg-[#FEF6E8]/30 hover:bg-[#FEF6E8]/50' :
                'border-[#E07B6A]/35 bg-[#FDECEA]/30 hover:bg-[#FDECEA]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  alumno.estado === 'P' ? 'bg-[#5BAD8A] text-white' :
                  alumno.estado === 'T' ? 'bg-[#F5A623] text-white' :
                  'bg-[#E07B6A] text-white'
                }`}>
                  {alumno.estado}
                </div>
                <span className="text-sm font-bold text-gray-900">{alumno.nombre}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                {alumno.estado === 'P' ? 'Presente' : alumno.estado === 'T' ? 'Tardanza' : 'Falta'}
              </span>
            </div>
          ))}
        </div>
        {asistenciaGuardada && (
          <div className="mt-4 p-3 bg-[#EAF5EF] border border-[#5BAD8A]/30 rounded-xl text-xs text-[#5BAD8A] font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            Asistencia guardada y sincronizada correctamente en tiempo real.
          </div>
        )}
      </div>

      {/* 3. CALIFICACIONES Y EVALUACIONES (TIPO HOJA DE CÁLCULO) */}
      <div className="premium-card p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cuadro de Calificaciones - Bimestre I</h3>
            <p className="text-xs text-gray-400 mt-1 font-semibold">Configura evaluaciones y ponderaciones. Modifica notas en las celdas directamente.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowConfigEvaluacion(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-250 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-400" />
              Configurar Criterios
            </button>
          </div>
        </div>

        {/* Suma de pesos actual y barra de progreso */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
            <span>Suma de Criterios (Debe ser 100%):</span>
            <span className={totalPesos === 100 ? 'text-[#5BAD8A]' : 'text-[#F5A623]'}>{totalPesos}% / 100%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${totalPesos === 100 ? 'bg-[#5BAD8A]' : 'bg-[#F5A623]'}`}
              style={{ width: `${totalPesos}%` }}
            />
          </div>
          {totalPesos !== 100 && (
            <div className="mt-2 text-[11px] text-[#F5A623] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ajusta las evaluaciones para sumar exactamente el 100% del periodo.</span>
            </div>
          )}
        </div>

        {/* Cuadro Interactivo */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="p-3 font-bold">Estudiante</th>
                {evaluaciones.map((ev) => (
                  <th key={ev.id} className="p-3 text-center font-bold min-w-[100px]">
                    <span className="block font-bold text-gray-900 leading-tight">{ev.nombre}</span>
                    <span className="block text-[8.5px] text-gray-400 font-bold tracking-normal mt-0.5">{ev.peso}% ({ev.tipo})</span>
                  </th>
                ))}
                <th className="p-3 text-right font-bold min-w-[90px]">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ALUMNOS.map((al) => {
                const prom = calculatePromedio(al.id);
                return (
                  <tr key={al.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 font-bold text-gray-950">{al.nombre}</td>
                    {evaluaciones.map((ev) => (
                      <td key={ev.id} className="p-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          value={notas[al.id]?.[ev.id] ?? ''}
                          onChange={(e) => handleNotaChange(al.id, ev.id, e.target.value)}
                          className="w-16 rounded-lg border border-gray-200 py-1 px-2 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20 focus:border-[#1D1D1F] text-gray-900 bg-white"
                        />
                      </td>
                    ))}
                    <td className="p-3 text-right">
                      <span className={`text-base font-black px-2 py-0.5 rounded-lg ${
                        prom >= 11 ? 'text-[#5BAD8A] bg-[#EAF5EF]' : 'text-[#E07B6A] bg-[#FDECEA]'
                      }`}>
                        {prom}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONFIGURACIÓN DE EVALUACIONES */}
      {showConfigEvaluacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowConfigEvaluacion(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-950">Configurar Evaluación</h3>
              <button onClick={() => setShowConfigEvaluacion(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEvaluacion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Criterio</label>
                <input
                  type="text"
                  placeholder="Ej: Participación en clase"
                  value={newEvalName}
                  onChange={(e) => setNewEvalName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/15 focus:border-[#1D1D1F] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo</label>
                  <select
                    value={newEvalTipo}
                    onChange={(e) => setNewEvalTipo(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/15 focus:border-[#1D1D1F] text-sm"
                  >
                    <option value="examen">Examen</option>
                    <option value="tarea">Tarea</option>
                    <option value="practica">Práctica</option>
                    <option value="participacion">Participación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Peso (%)</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={newEvalPeso}
                    onChange={(e) => setNewEvalPeso(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/15 focus:border-[#1D1D1F] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowConfigEvaluacion(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Agregar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
