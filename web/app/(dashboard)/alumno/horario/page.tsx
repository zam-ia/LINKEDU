'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface HorarioItem {
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  hora: string;
  curso: string;
  aula: string;
  docente: string;
  color: string;
}

const MOCK_HORARIO: HorarioItem[] = [
  { dia: 'Lunes', hora: '08:00 - 09:30', curso: 'Matemática Divertida', aula: 'Aula 101', docente: 'María Gutiérrez', color: '#1D1D1F' },
  { dia: 'Lunes', hora: '09:45 - 11:15', curso: 'Lenguaje y Literatura', aula: 'Aula 101', docente: 'Juan Pérez', color: '#9B7FD4' },
  { dia: 'Martes', hora: '08:00 - 09:30', curso: 'Historia del Perú', aula: 'Aula 101', docente: 'Carlos Prado', color: '#F5A623' },
  { dia: 'Martes', hora: '09:45 - 11:15', curso: 'Matemática Divertida', aula: 'Aula 101', docente: 'María Gutiérrez', color: '#1D1D1F' },
  { dia: 'Miércoles', hora: '08:00 - 09:30', curso: 'Ciencias Naturales', aula: 'Laboratorio A', docente: 'Rosa Luna', color: '#5BAD8A' },
  { dia: 'Miércoles', hora: '09:45 - 11:15', curso: 'Lenguaje y Literatura', aula: 'Aula 101', docente: 'Juan Pérez', color: '#9B7FD4' },
  { dia: 'Jueves', hora: '08:00 - 09:30', curso: 'Matemática Divertida', aula: 'Aula 101', docente: 'María Gutiérrez', color: '#1D1D1F' },
  { dia: 'Jueves', hora: '09:45 - 11:15', curso: 'Inglés Avanzado', aula: 'Aula 102', docente: 'Wilson Smith', color: '#E07B6A' },
  { dia: 'Viernes', hora: '08:00 - 09:30', curso: 'Ciencias Naturales', aula: 'Laboratorio A', docente: 'Rosa Luna', color: '#5BAD8A' },
  { dia: 'Viernes', hora: '09:45 - 11:15', curso: 'Historia del Perú', aula: 'Aula 101', docente: 'Carlos Prado', color: '#F5A623' },
];

export default function HorarioAlumno() {
  const [selectedDia, setSelectedDia] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'>('Lunes');

  const dias: ('Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes')[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mi Horario Escolar</h1>
        <p className="text-sm text-gray-500 mt-1">Revisa tu cronograma de cursos, aulas y profesores para la semana académica.</p>
      </div>

      {/* Week day filters (Mobile friendly switching) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        {dias.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDia(d)}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedDia === d 
                ? 'bg-white text-[#1D1D1F] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Daily schedule layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_HORARIO.filter(h => h.dia === selectedDia).map((item, idx) => (
          <div key={idx} className="premium-card p-5 border-l-4 space-y-4" style={{ borderLeftColor: item.color }}>
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <span className="text-xs font-black text-gray-950 uppercase tracking-wider">{item.curso}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {item.hora}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-600 font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Ubicación: <span className="font-bold text-gray-900">{item.aula}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>Profesor: <span className="font-bold text-gray-900">{item.docente}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly konsolidated view for Desktop */}
      <div className="hidden lg:block premium-card p-6">
        <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Horario Consolidado Semanal</h3>
        <div className="grid grid-cols-5 gap-4">
          {dias.map(d => (
            <div key={d} className="space-y-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center pb-2 border-b border-gray-150">{d}</span>
              <div className="space-y-2.5">
                {MOCK_HORARIO.filter(h => h.dia === d).map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border rounded-xl space-y-1.5 hover:border-gray-300 transition-all text-center">
                    <span className="block text-[10px] font-black text-gray-950 truncate leading-snug">{item.curso}</span>
                    <span className="block text-[8px] text-gray-400 font-bold uppercase">{item.hora.split(' - ')[0]}</span>
                    <span className="block text-[8px] text-[#1D1D1F] font-black uppercase tracking-widest">{item.aula}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
