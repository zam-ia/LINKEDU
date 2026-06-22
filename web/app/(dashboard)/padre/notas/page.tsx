'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  User, 
  Activity, 
  Calendar 
} from 'lucide-react';
import { 
  getStoredAlumnos, 
  getStoredNotas, 
  getStoredEvaluaciones, 
  AlumnoInfo, 
  NotaInfo, 
  EvaluacionInfo 
} from '@/lib/supabase/client';

export default function BoletaNotasPadre() {
  const { user } = useAuthStore();
  const [hijos, setHijos] = useState<AlumnoInfo[]>([]);
  const [selectedHijoId, setSelectedHijoId] = useState('');
  const [notas, setNotas] = useState<NotaInfo[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionInfo[]>([]);
  const [activeCourseFilter, setActiveCourseFilter] = useState('todos');

  useEffect(() => {
    const storedAlumnos = getStoredAlumnos();
    const storedNotas = getStoredNotas();
    const storedEvaluaciones = getStoredEvaluaciones();

    if (user) {
      // Find students whose tutor contact email matches the logged-in parent's email
      const matchedHijos = storedAlumnos.filter(
        a => a.contacto_tutor.email === user.email
      );
      setHijos(matchedHijos);
      if (matchedHijos.length > 0) {
        setSelectedHijoId(matchedHijos[0].id);
      }
      setNotas(storedNotas);
      setEvaluaciones(storedEvaluaciones);
    }
  }, [user]);

  const currentHijo = hijos.find(h => h.id === selectedHijoId);

  // Filter evaluations and notes for the selected child
  const childNotas = notas.filter(n => n.alumno_id === selectedHijoId);
  const courses = Array.from(new Set(evaluaciones.map(e => e.curso)));

  const reportCard = courses.map(courseName => {
    const courseEvals = evaluaciones.filter(e => e.curso === courseName);
    const courseScores = childNotas.filter(n => courseEvals.some(ev => ev.id === n.evaluacion_id));

    let sum = 0;
    let weightSum = 0;
    
    const gradesDesglose = courseEvals.map(ev => {
      const matchScore = courseScores.find(s => s.evaluacion_id === ev.id);
      if (matchScore) {
        sum += matchScore.nota * ev.peso;
        weightSum += ev.peso;
      }
      return {
        evalName: ev.nombre,
        peso: ev.peso,
        nota: matchScore ? matchScore.nota : null
      };
    });

    const promedio = weightSum > 0 ? (sum / weightSum) : null;

    return {
      curso: courseName,
      promedio,
      desglose: gradesDesglose
    };
  }).filter(r => activeCourseFilter === 'todos' || r.curso === activeCourseFilter);

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Boleta de Calificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Monitorea el progreso escolar, promedios bimestrales y detalles evaluativos de tus hijos.</p>
        </div>

        {/* Child Selector */}
        {hijos.length > 1 && (
          <div className="flex gap-2">
            {hijos.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHijoId(h.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedHijoId === h.id 
                    ? 'border-[#1D1D1F] bg-[#1D1D1F]/5 text-[#1D1D1F] shadow-xs'
                    : 'border-gray-250 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {h.nombre} ({h.grado})
              </button>
            ))}
          </div>
        )}
      </div>

      {currentHijo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar summary of the selected child */}
          <div className="premium-card p-5 space-y-4 h-fit">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-150">
              <img src={currentHijo.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border" />
              <div>
                <h3 className="font-extrabold text-sm text-gray-950 leading-snug">{currentHijo.nombre} {currentHijo.apellido}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{currentHijo.grado} - {currentHijo.seccion}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 font-semibold">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span>Situación: <span className="text-[9px] font-black uppercase bg-[#EAF5EF] text-[#5BAD8A] px-2 py-0.5 rounded-full">Activo</span></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Año Académico: <span className="font-black text-gray-800">2026</span></span>
              </div>
            </div>

            {/* Course Filter */}
            <div className="pt-3 border-t border-gray-150 space-y-2">
              <span className="text-[10px] font-black text-gray-405 uppercase tracking-wider block">Filtro rápido</span>
              <select
                value={activeCourseFilter}
                onChange={(e) => setActiveCourseFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-2 px-2.5 bg-white text-xs font-semibold focus:outline-none"
              >
                <option value="todos">Todos los Cursos</option>
                {courses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grades Card List */}
          <div className="lg:col-span-2 space-y-5">
            {reportCard.map((card) => (
              <div key={card.curso} className="premium-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-gray-400" />
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">{card.curso}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Promedio: </span>
                    <span className={`text-base font-black font-mono ${
                      card.promedio !== null 
                        ? card.promedio >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]' 
                        : 'text-gray-300'
                    }`}>
                      {card.promedio !== null ? card.promedio.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {card.desglose.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50/50 border border-gray-150 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <span className="text-[10px] text-gray-950 font-bold block truncate" title={item.evalName}>
                          {item.evalName}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase block mt-0.5">Peso {item.peso}%</span>
                      </div>
                      <span className={`text-xs font-black font-mono ${
                        item.nota !== null 
                          ? item.nota >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]' 
                          : 'text-gray-300'
                      }`}>
                        {item.nota !== null ? item.nota.toFixed(1) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {reportCard.length === 0 && (
              <div className="premium-card p-12 text-center text-gray-400 font-bold text-xs">
                No hay calificaciones registradas para este alumno.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="premium-card p-12 text-center text-gray-400 font-bold text-sm">
          No tienes hijos registrados en la plataforma.
        </div>
      )}

    </div>
  );
}
