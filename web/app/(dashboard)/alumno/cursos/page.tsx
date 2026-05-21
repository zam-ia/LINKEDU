'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  BookOpen, 
  Folder, 
  Download, 
  Link, 
  GraduationCap, 
  Sparkles, 
  FileText,
  Activity
} from 'lucide-react';
import { 
  getStoredAlumnos, 
  getStoredNotas, 
  getStoredEvaluaciones, 
  NotaInfo, 
  EvaluacionInfo 
} from '@/lib/supabase/client';

interface MaterialItem {
  id: string;
  nombre: string;
  tipo: 'archivo' | 'link';
  url: string;
  tamano?: string;
  fecha: string;
  curso: string;
}

export default function CursosAlumno() {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState<string[]>([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionInfo[]>([]);
  const [notas, setNotas] = useState<NotaInfo[]>([]);
  const [materiales, setMateriales] = useState<MaterialItem[]>([]);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const storedAlumnos = getStoredAlumnos();
    const storedNotas = getStoredNotas();
    const storedEvaluaciones = getStoredEvaluaciones();

    const currentStudent = storedAlumnos.find(a => a.email === user?.email);

    if (currentStudent) {
      // Fetch evaluations to extract all distinct courses taught in this school
      const schoolEvals = storedEvaluaciones.filter(e => e.colegio_id === currentStudent.colegio_id);
      const distinctCursos = Array.from(new Set(schoolEvals.map(e => e.curso)));
      setCursos(distinctCursos);
      if (distinctCursos.length > 0) {
        setSelectedCurso(distinctCursos[0]);
      }
      
      setEvaluaciones(schoolEvals);
      setNotas(storedNotas.filter(n => n.alumno_id === currentStudent.id));
    }

    // Load materials shared by teachers
    const saved = localStorage.getItem('linkedu_materiales');
    if (saved) {
      try {
        setMateriales(JSON.parse(saved));
      } catch (e) {
        // use fallback initial list
      }
    }
  }, [user]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const activeEvals = evaluaciones.filter(e => e.curso === selectedCurso);
  const activeMateriales = materiales.filter(m => m.curso === selectedCurso);

  return (
    <div className="space-y-6 relative">
      {/* TOAST ALERTA */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#5BAD8A] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mis Cursos</h1>
        <p className="text-sm text-gray-500 mt-1">Revisa el syllabus, descarga guías de estudio y monitorea tus calificaciones curso por curso.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Folder list */}
        <div className="premium-card p-5 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Cursos de este año</h3>
          <div className="space-y-2">
            {cursos.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCurso(c)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedCurso === c 
                    ? 'border-[#01017b] bg-[#01017b]/5 text-[#01017b] font-bold shadow-xs' 
                    : 'border-gray-150 hover:bg-gray-50 text-gray-500'
                }`}
              >
                <BookOpen className="w-4.5 h-4.5 text-gray-400" />
                <span className="text-xs font-bold truncate">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 space-y-6">
          {selectedCurso ? (
            <>
              {/* Material de Estudio */}
              <div className="premium-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Carpeta de Recursos de Estudio</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{activeMateriales.length} archivos</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMateriales.map((mat) => (
                    <div key={mat.id} className="p-4 border border-gray-150 bg-gray-50/50 rounded-2xl flex items-center justify-between group hover:border-[#01017b]/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg shadow-xs">
                          {mat.tipo === 'archivo' ? '📄' : '🔗'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-950 truncate leading-snug">{mat.nombre}</p>
                          <p className="text-[10px] text-gray-450 font-semibold mt-0.5">
                            {mat.tipo === 'archivo' ? mat.tamano : 'Enlace Web'} • {mat.fecha}
                          </p>
                        </div>
                      </div>

                      {mat.tipo === 'archivo' ? (
                        <button 
                          onClick={() => triggerAlert('Descargando archivo...')}
                          className="p-2 hover:bg-[#EEF1FE] text-gray-400 hover:text-[#01017b] rounded-xl cursor-pointer"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <a 
                          href={mat.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 hover:bg-[#EEF1FE] text-gray-400 hover:text-[#01017b] rounded-xl cursor-pointer"
                          title="Abrir Enlace"
                        >
                          <Link className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                  {activeMateriales.length === 0 && (
                    <p className="col-span-2 text-center py-6 text-gray-400 text-xs font-bold">
                      Aún no se han cargado guías o lecturas para este curso.
                    </p>
                  )}
                </div>
              </div>

              {/* Notas del curso */}
              <div className="premium-card p-6 space-y-4">
                <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Mis Notas del Bimestre I</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-450 uppercase">PROMEDIO: </span>
                    <span className="text-sm font-black font-mono text-[#5BAD8A]">
                      {(() => {
                        let sum = 0;
                        let weightSum = 0;
                        activeEvals.forEach(ev => {
                          const match = notas.find(n => n.evaluacion_id === ev.id);
                          if (match) {
                            sum += match.nota * ev.peso;
                            weightSum += ev.peso;
                          }
                        });
                        return weightSum > 0 ? (sum / weightSum).toFixed(1) : '—';
                      })()}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="p-3">Evaluación</th>
                        <th className="p-3">Peso</th>
                        <th className="p-3 text-right">Tu Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {activeEvals.map(ev => {
                        const match = notas.find(n => n.evaluacion_id === ev.id);
                        return (
                          <tr key={ev.id}>
                            <td className="p-3 font-bold text-gray-950">{ev.nombre}</td>
                            <td className="p-3 text-gray-400">{ev.peso}%</td>
                            <td className={`p-3 text-right font-black font-mono text-xs ${
                              match 
                                ? match.nota >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]'
                                : 'text-gray-300'
                            }`}>
                              {match ? match.nota.toFixed(1) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="premium-card p-12 text-center text-gray-400 font-bold text-sm">
              Selecciona un curso de la barra lateral para ver su syllabus, materiales y calificaciones.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
