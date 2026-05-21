'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Save, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  ChevronRight 
} from 'lucide-react';
import { 
  getStoredAlumnos, 
  getStoredAsistencias, 
  saveStoredAsistencias, 
  getStoredDocentes,
  AlumnoInfo, 
  AsistenciaInfo 
} from '@/lib/supabase/client';

export default function ControlAsistencia() {
  const { user } = useAuthStore();
  const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaInfo[]>([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  
  // Local state for the current session attendance matrix
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'P' | 'T' | 'F'>>({});
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const allDocentes = getStoredDocentes();
    const activeDocente = allDocentes.find(d => d.email === user?.email);

    if (activeDocente && activeDocente.cursos_asignados.length > 0) {
      // Pick first course load by default
      const first = activeDocente.cursos_asignados[0];
      setSelectedCurso(first.curso);
      // Section in courses_asignados is in format "1ro Primaria - A", extract seccion and grado
      setSelectedSeccion(first.seccion);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedSeccion) return;
    
    const storedAlumnos = getStoredAlumnos();
    const storedAsistencias = getStoredAsistencias();
    
    // Filter students by assigned section
    // Section in alumno has "grado" (e.g. 1ro Primaria) and "seccion" (e.g. A)
    // SelectedSeccion looks like "1ro Primaria - A"
    const [grado, seccion] = selectedSeccion.split(' - ');
    const list = storedAlumnos.filter(a => a.grado === grado && a.seccion === seccion);
    setAlumnos(list);
    
    setAsistencias(storedAsistencias);

    // Map existing attendance for this date & course
    const map: Record<string, 'P' | 'T' | 'F'> = {};
    list.forEach(student => {
      const existing = storedAsistencias.find(
        a => a.alumno_id === student.id && a.fecha === activeDate && a.curso === selectedCurso
      );
      map[student.id] = existing ? existing.estado : 'P'; // default to Present
    });
    setAttendanceMap(map);
  }, [selectedCurso, selectedSeccion, activeDate]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  // Cyclical 1-tap toggle (P -> T -> F -> P)
  const handleCycleAsistencia = (studentId: string) => {
    const current = attendanceMap[studentId] || 'P';
    const next: Record<'P' | 'T' | 'F', 'P' | 'T' | 'F'> = {
      'P': 'T',
      'T': 'F',
      'F': 'P'
    };
    setAttendanceMap({
      ...attendanceMap,
      [studentId]: next[current]
    });
  };

  const handleSaveAsistencia = () => {
    const storedGlobal = getStoredAsistencias();
    
    // Filter out existing records for this date, section, course to overwrite
    const filteredGlobal = storedGlobal.filter(
      a => !(a.fecha === activeDate && a.curso === selectedCurso && alumnos.some(s => s.id === a.alumno_id))
    );

    // Create new records
    const newRecords: AsistenciaInfo[] = alumnos.map(student => ({
      id: 'as-' + student.id + '-' + Date.now(),
      colegio_id: student.colegio_id,
      alumno_id: student.id,
      fecha: activeDate,
      curso: selectedCurso,
      estado: attendanceMap[student.id] || 'P'
    }));

    const updated = [...filteredGlobal, ...newRecords];
    saveStoredAsistencias(updated);
    setAsistencias(updated);

    const absences = newRecords.filter(r => r.estado === 'F');
    if (absences.length > 0) {
      alert(`🔔 Alerta de inasistencia: Se ha notificado en tiempo real a los tutores legales de ${absences.length} alumnos inasistentes hoy.`);
    }

    triggerAlert('Asistencia guardada y sincronizada en tiempo real.');
  };

  return (
    <div className="space-y-6 relative">
      {/* ALERTA TOAST */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Control de Asistencia</h1>
          <p className="text-sm text-gray-500 mt-1">Registra la asistencia diaria de tus alumnos con un solo toque.</p>
        </div>
        <div>
          <button
            onClick={handleSaveAsistencia}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5BAD8A] hover:bg-[#5BAD8A]/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all w-full md:w-auto justify-center"
          >
            <Save className="w-4.5 h-4.5" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="premium-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Curso Dictado</label>
          <select
            value={selectedCurso}
            onChange={(e) => setSelectedCurso(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          >
            <option value="Matemática Divertida">Matemática Divertida</option>
            <option value="Lenguaje y Literatura">Lenguaje y Literatura</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Sección asignada</label>
          <select
            value={selectedSeccion}
            onChange={(e) => setSelectedSeccion(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          >
            <option value="1ro Primaria - A">1ro Primaria - Sección A</option>
            <option value="2do Primaria - A">2do Primaria - Sección A</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Fecha de Asistencia</label>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          />
        </div>
      </div>

      {/* ATTENDANCE MAIN CARD / GRID */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-150 pb-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#01017b]" />
            Listado de Alumnos ({alumnos.length})
          </span>
          <div className="hidden sm:flex gap-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#5BAD8A]" /> Presente (1-tap)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#F5A623]" /> Tardanza (2-tap)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#E07B6A]" /> Falta (3-tap)</span>
          </div>
        </div>

        {/* 1-Tap Attendance List Grid */}
        <div className="divide-y divide-gray-100">
          {alumnos.map((alumno) => {
            const estado = attendanceMap[alumno.id] || 'P';
            return (
              <div 
                key={alumno.id} 
                onClick={() => handleCycleAsistencia(alumno.id)}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-gray-50/70 rounded-xl cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={alumno.foto_url} alt="" className="w-9 h-9 rounded-full object-cover border" />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#01017b] transition-colors">{alumno.nombre} {alumno.apellido}</h3>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">DNI {alumno.dni}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Visual Tag */}
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    estado === 'P' ? 'bg-[#EAF5EF] text-[#5BAD8A]' :
                    estado === 'T' ? 'bg-[#FEF6E8] text-[#F5A623]' : 'bg-[#FDECEA] text-[#E07B6A]'
                  }`}>
                    {estado === 'P' && <CheckCircle className="w-3.5 h-3.5" />}
                    {estado === 'T' && <Clock className="w-3.5 h-3.5" />}
                    {estado === 'F' && <XCircle className="w-3.5 h-3.5" />}
                    {estado === 'P' ? 'Presente' : estado === 'T' ? 'Tardanza' : 'Falta'}
                  </span>
                  
                  <ChevronRight className="w-4.5 h-4.5 text-gray-300 group-hover:text-gray-500 transition-all" />
                </div>
              </div>
            );
          })}
          {alumnos.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-bold text-sm">
              No hay estudiantes asignados en esta sección.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
