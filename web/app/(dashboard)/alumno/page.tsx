'use client';

import { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  TrendingUp,
  FileText
} from 'lucide-react';

const UPCOMING_TASKS = [
  { id: '1', titulo: 'Resolver ejercicios de Fracciones algebraicas', curso: 'Matemática Divertida', vencimiento: 'Hoy, 23:59', prioridad: 'alta', color: '#E07B6A' },
  { id: '2', titulo: 'Ensayo sobre Don Quijote de la Mancha', curso: 'Comunicación Integral', vencimiento: 'Viernes, 14:00', prioridad: 'media', color: '#4F6AF0' },
  { id: '3', titulo: 'Reporte del experimento sobre la Fotosíntesis', curso: 'Ciencia y Tecnología', vencimiento: 'Próxima semana', prioridad: 'baja', color: '#5BAD8A' },
];

const CALENDAR_EVENTS = [
  { hora: '08:00 - 09:30', titulo: 'Matemática Divertida', aula: 'Aula 101', docente: 'María Gutiérrez', color: '#4F6AF0' },
  { hora: '09:45 - 11:15', titulo: 'Comunicación Integral', aula: 'Aula 101', docente: 'Juan Pérez', color: '#9B7FD4' },
];

export default function AlumnoDashboard() {
  const [tasks, setTasks] = useState(UPCOMING_TASKS);
  const [asistenciaMes, setAsistenciaMes] = useState(92); // 92% asistencia

  const handleCompleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    alert('¡Excelente trabajo! Tarea entregada con éxito a Supabase Storage.');
  };

  return (
    <div className="space-y-6">
      {/* 1. SALUDO PERSONALIZADO */}
      <div className="bg-gradient-to-r from-[#4F6AF0] to-[#9B7FD4] p-6 rounded-2xl text-white shadow-lg shadow-[#4F6AF0]/10">
        <h1 className="text-2xl font-black font-sans">¡Hola, Mateo! 👋</h1>
        <p className="text-xs text-white/80 mt-1 font-semibold">Hoy es miércoles, 20 de mayo. Tienes {tasks.length} entregas pendientes para esta semana.</p>
      </div>

      {/* 2. KPIs RÁPIDOS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* KPI: Asistencia */}
        <div className="premium-card p-5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Asistencia del Mes</span>
          <div className="flex items-center gap-3.5 mt-3">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#EAECF0" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="#5BAD8A" strokeWidth="4" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 20} 
                        strokeDashoffset={2 * Math.PI * 20 * (1 - asistenciaMes / 100)} />
              </svg>
              <span className="absolute text-xs font-black text-gray-900">{asistenciaMes}%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-800">Al día con tus clases</span>
              <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Falta justificada: 1</span>
            </div>
          </div>
        </div>

        {/* KPI: Promedio General */}
        <div className="premium-card p-5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Promedio Bimestral</span>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-10 w-10 bg-[#EEF1FE] text-[#4F6AF0] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-900">12.75</span>
              <span className="block text-[10px] text-[#5BAD8A] font-bold mt-0.5">Rendimiento Aceptable</span>
            </div>
          </div>
        </div>

        {/* KPI: Tareas Completadas */}
        <div className="premium-card p-5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Entregas Realizadas</span>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-10 w-10 bg-[#EAF5EF] text-[#5BAD8A] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-900">8 / 10</span>
              <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">80% completado</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTENIDO CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entregas y Tareas (2/3) */}
        <div className="premium-card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Mis Próximas Entregas</h3>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <CheckCircle className="w-12 h-12 text-[#5BAD8A] opacity-30" />
              <span className="text-sm font-bold text-gray-700">¡Al día con todo!</span>
              <span className="text-xs text-gray-400">No tienes tareas pendientes para entregar.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-250 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-auto rounded-full" style={{ backgroundColor: task.color }} />
                    <div>
                      <span className="block text-xs font-bold text-gray-950">{task.titulo}</span>
                      <span className="block text-[10px] text-gray-400 mt-1 font-bold">{task.curso}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Límite: {task.vencimiento}
                    </span>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="px-3.5 py-1.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                    >
                      Subir Trabajo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Horario de Clases de Hoy (1/3) */}
        <div className="premium-card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Clases de Hoy</h3>
          <div className="space-y-4">
            {CALENDAR_EVENTS.map((ev, index) => (
              <div key={index} className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-[#4F6AF0] bg-[#EEF1FE] px-2 py-1 rounded-lg">
                    {ev.hora.split(' ')[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-gray-950 truncate">{ev.titulo}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-0.5 truncate">{ev.docente} • {ev.aula}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
