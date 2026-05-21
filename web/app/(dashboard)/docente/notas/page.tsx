'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Sparkles, 
  Save, 
  Settings, 
  Plus, 
  Trash2, 
  X, 
  Calculator,
  Percent,
  AlertCircle
} from 'lucide-react';
import { 
  getStoredAlumnos, 
  getStoredNotas, 
  saveStoredNotas, 
  getStoredEvaluaciones, 
  saveStoredEvaluaciones, 
  getStoredDocentes,
  AlumnoInfo, 
  NotaInfo, 
  EvaluacionInfo 
} from '@/lib/supabase/client';

export default function CalificacionesPage() {
  const { user } = useAuthStore();
  const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionInfo[]>([]);
  const [notas, setNotas] = useState<NotaInfo[]>([]);
  
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  
  // Matrix/Spreadsheet state: record of studentId -> record of evaluationId -> score
  const [scoresMap, setScoresMap] = useState<Record<string, Record<string, string>>>({});
  
  // Modal configurations
  const [showConfig, setShowConfig] = useState(false);
  const [newEvalName, setNewEvalName] = useState('');
  const [newEvalWeight, setNewEvalWeight] = useState('');
  const [newEvalType, setNewEvalType] = useState<'examen' | 'tarea' | 'taller' | 'participacion'>('examen');

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const allDocentes = getStoredDocentes();
    const activeDocente = allDocentes.find(d => d.email === user?.email);

    if (activeDocente && activeDocente.cursos_asignados.length > 0) {
      const first = activeDocente.cursos_asignados[0];
      setSelectedCurso(first.curso);
      setSelectedSeccion(first.seccion);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedSeccion) return;

    const storedAlumnos = getStoredAlumnos();
    const storedEvaluaciones = getStoredEvaluaciones();
    const storedNotas = getStoredNotas();

    const [grado, seccion] = selectedSeccion.split(' - ');
    const list = storedAlumnos.filter(a => a.grado === grado && a.seccion === seccion);
    setAlumnos(list);

    const filteredEvals = storedEvaluaciones.filter(e => e.curso === selectedCurso);
    setEvaluaciones(filteredEvals);

    setNotas(storedNotas);

    // Map existing scores
    const map: Record<string, Record<string, string>> = {};
    list.forEach(student => {
      map[student.id] = {};
      filteredEvals.forEach(ev => {
        const match = storedNotas.find(
          n => n.alumno_id === student.id && n.evaluacion_id === ev.id
        );
        map[student.id][ev.id] = match ? match.nota.toString() : '';
      });
    });
    setScoresMap(map);
  }, [selectedCurso, selectedSeccion]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleScoreChange = (studentId: string, evalId: string, val: string) => {
    // Only allow numbers between 0 and 20 (standard Peruvian system) or empty
    const num = parseFloat(val);
    if (val !== '' && (isNaN(num) || num < 0 || num > 20)) return;

    setScoresMap({
      ...scoresMap,
      [studentId]: {
        ...scoresMap[studentId],
        [evalId]: val
      }
    });
  };

  const handleAddEvaluacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalName || !newEvalWeight) return;

    const weightNum = parseFloat(newEvalWeight);
    const totalWeight = evaluaciones.reduce((sum, ev) => sum + ev.peso, 0);

    if (totalWeight + weightNum > 100) {
      alert(`Error: La suma de pesos no puede superar el 100%. Actual: ${totalWeight}%, Exceso: ${(totalWeight + weightNum) - 100}%`);
      return;
    }

    const added: EvaluacionInfo = {
      id: 'ev-' + Date.now(),
      colegio_id: user?.colegio_id || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      curso: selectedCurso,
      periodo: 'Bimestre I',
      nombre: newEvalName,
      tipo: newEvalType,
      peso: weightNum
    };

    const storedGlobal = getStoredEvaluaciones();
    const updated = [...storedGlobal, added];
    saveStoredEvaluaciones(updated);
    setEvaluaciones(updated.filter(e => e.curso === selectedCurso));

    // Clear and close
    setNewEvalName('');
    setNewEvalWeight('');
    setShowConfig(false);
    triggerAlert(`Evaluación '${added.nombre}' añadida con éxito.`);
  };

  const handleRemoveEvaluacion = (id: string) => {
    const storedGlobal = getStoredEvaluaciones();
    const updated = storedGlobal.filter(e => e.id !== id);
    saveStoredEvaluaciones(updated);
    setEvaluaciones(updated.filter(e => e.curso === selectedCurso));

    triggerAlert('Evaluación eliminada.');
  };

  const handleSaveScores = () => {
    const storedGlobal = getStoredNotas();
    
    // Filter out existing notes for these students/evals
    const filteredGlobal = storedGlobal.filter(
      n => !(alumnos.some(s => s.id === n.alumno_id) && evaluaciones.some(e => e.id === n.evaluacion_id))
    );

    // Create new records
    const newRecords: NotaInfo[] = [];
    alumnos.forEach(student => {
      evaluaciones.forEach(ev => {
        const val = scoresMap[student.id]?.[ev.id];
        if (val !== '') {
          newRecords.push({
            id: 'nota-' + student.id + '-' + ev.id + '-' + Date.now(),
            colegio_id: student.colegio_id,
            alumno_id: student.id,
            evaluacion_id: ev.id,
            nota: parseFloat(val)
          });
        }
      });
    });

    const updated = [...filteredGlobal, ...newRecords];
    saveStoredNotas(updated);
    setNotas(updated);

    triggerAlert('Calificaciones guardadas y consolidadas con éxito.');
  };

  // Weight Check
  const totalWeight = evaluaciones.reduce((sum, ev) => sum + ev.peso, 0);

  return (
    <div className="space-y-6 relative">
      {/* TOAST ALERTA */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Cuaderno de Calificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Registra, pondera y consolida las notas escolares de tus alumnos en un spreadsheet interactivo.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-250 text-gray-700 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-50 cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5 text-gray-400" />
            Configurar Pesos
          </button>
          <button
            onClick={handleSaveScores}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5BAD8A] hover:bg-[#5BAD8A]/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Save className="w-4.5 h-4.5" />
            Guardar Notas
          </button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="premium-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-455 uppercase tracking-wider mb-1.5">Curso Dictado</label>
          <select
            value={selectedCurso}
            onChange={(e) => setSelectedCurso(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none"
          >
            <option value="Matemática Divertida">Matemática Divertida</option>
            <option value="Lenguaje y Literatura">Lenguaje y Literatura</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-black text-gray-455 uppercase tracking-wider mb-1.5">Sección / Grado</label>
          <select
            value={selectedSeccion}
            onChange={(e) => setSelectedSeccion(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none"
          >
            <option value="1ro Primaria - A">1ro Primaria - Sección A</option>
            <option value="2do Primaria - A">2do Primaria - Sección A</option>
          </select>
        </div>
      </div>

      {/* SPREADSHEET CARD */}
      <div className="premium-card p-6 overflow-hidden">
        {/* Warning weights sum */}
        {totalWeight < 100 && (
          <div className="mb-4 p-3 bg-[#FEF6E8] border border-[#F5A623]/20 rounded-xl flex items-center gap-2 text-xs font-bold text-[#F5A623]">
            <AlertCircle className="w-4 h-4" />
            La suma de los pesos actuales es {totalWeight}%. Falta {100 - totalWeight}% para llegar al 100%. Haz clic en Configurar Pesos para completarlo.
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="p-3">Estudiante</th>
                {evaluaciones.map(ev => (
                  <th key={ev.id} className="p-3 text-center border-l border-gray-100">
                    <span className="block text-gray-950 font-black">{ev.nombre}</span>
                    <span className="block text-[8px] text-gray-400 font-bold tracking-widest">{ev.peso}% (PESO)</span>
                  </th>
                ))}
                <th className="p-3 text-center border-l border-gray-150 bg-[#EEF1FE] text-[#01017b] font-black">
                  PROMEDIO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-xs text-gray-900">
              {alumnos.map((alumno) => {
                // Calculate average based on scores map and weights
                let sum = 0;
                let weightSum = 0;
                
                evaluaciones.forEach(ev => {
                  const valStr = scoresMap[alumno.id]?.[ev.id];
                  if (valStr && valStr !== '') {
                    const score = parseFloat(valStr);
                    sum += score * ev.peso;
                    weightSum += ev.peso;
                  }
                });

                const promedio = weightSum > 0 ? (sum / weightSum) : null;

                return (
                  <tr key={alumno.id} className="hover:bg-gray-50/40">
                    <td className="p-3 flex items-center gap-3">
                      <img src={alumno.foto_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-extrabold text-gray-950">{alumno.nombre} {alumno.apellido}</span>
                    </td>
                    
                    {evaluaciones.map(ev => (
                      <td key={ev.id} className="p-3 text-center border-l border-gray-100">
                        <input
                          type="text"
                          value={scoresMap[alumno.id]?.[ev.id] || ''}
                          onChange={(e) => handleScoreChange(alumno.id, ev.id, e.target.value)}
                          placeholder="—"
                          className="w-12 py-1.5 border border-gray-200 rounded-lg text-center font-black focus:outline-none focus:ring-2 focus:ring-[#01017b]/10 focus:border-[#01017b] bg-white font-mono text-xs text-gray-950"
                        />
                      </td>
                    ))}

                    <td className={`p-3 text-center border-l border-gray-150 bg-[#EEF1FE]/30 font-black font-mono text-sm ${
                      promedio !== null 
                        ? promedio >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]' 
                        : 'text-gray-300'
                    }`}>
                      {promedio !== null ? promedio.toFixed(1) : '—'}
                    </td>
                  </tr>
                );
              })}
              {alumnos.length === 0 && (
                <tr>
                  <td colSpan={evaluaciones.length + 2} className="p-12 text-center text-gray-400 font-bold text-sm">
                    No hay estudiantes asignados en esta sección.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: CONFIGURAR PESOS ================= */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowConfig(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <h3 className="text-base font-black text-gray-950 mb-4">Configurar Evaluaciones y Pesos</h3>
            
            {/* List of existing evals */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Evaluaciones Activas (Suma: {totalWeight}%)</span>
              
              <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl bg-gray-50 p-1">
                {evaluaciones.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between p-2.5">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{ev.nombre}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">{ev.tipo} • peso: {ev.peso}%</p>
                    </div>
                    <button
                      onClick={() => handleRemoveEvaluacion(ev.id)}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-[#E07B6A] rounded-lg cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {evaluaciones.length === 0 && (
                  <p className="p-6 text-center text-gray-400 text-xs font-bold">Sin evaluaciones creadas.</p>
                )}
              </div>
            </div>

            {/* Create form */}
            <form onSubmit={handleAddEvaluacion} className="p-4 border border-gray-150 rounded-xl space-y-3.5 bg-gray-50/50">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider block">Crear Nueva Evaluación</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tarea Académica"
                    value={newEvalName}
                    onChange={(e) => setNewEvalName(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/10"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Peso (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    placeholder="30"
                    value={newEvalWeight}
                    onChange={(e) => setNewEvalWeight(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#01017b]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Tipo de Tarea</label>
                <select
                  value={newEvalType}
                  onChange={(e) => setNewEvalType(e.target.value as any)}
                  className="block w-full rounded-xl border border-gray-300 py-2 px-2 bg-white text-xs font-semibold focus:outline-none"
                >
                  <option value="examen">Examen Escrito</option>
                  <option value="tarea">Tarea Virtual</option>
                  <option value="taller">Taller Dinámico</option>
                  <option value="participacion">Participación Oral</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#01017b] hover:bg-[#01017b]/95 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all"
              >
                Añadir Evaluación
              </button>
            </form>

            <div className="flex justify-end pt-4 border-t border-gray-150 mt-4">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cerrar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
