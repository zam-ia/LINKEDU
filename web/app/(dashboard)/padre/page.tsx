'use client';

import { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  FileText,
  DollarSign
} from 'lucide-react';

interface HijoData {
  id: string;
  nombre: string;
  seccion: string;
  asistenciaHoy: 'P' | 'T' | 'F';
  pensionEstado: 'vencido' | 'al_dia' | 'pendiente';
  pensionMonto: number;
  pensionMes: string;
  boleta: { curso: string; promedio: number; tendencia: 'up' | 'down' | 'stable'; desglose: { eval: string; peso: number; nota: number }[] }[];
}

const HIJOS_MOCK: Record<string, HijoData> = {
  'mateo': {
    id: 'a2222222-2222-2222-2222-222222222222',
    nombre: 'Mateo Castro',
    seccion: '1ro Primaria - A',
    asistenciaHoy: 'F', // Falta hoy (coincide con seed/docente)
    pensionEstado: 'vencido',
    pensionMonto: 380,
    pensionMes: 'Mayo',
    boleta: [
      { 
        curso: 'Matemática Divertida', 
        promedio: 11, 
        tendencia: 'down',
        desglose: [
          { eval: 'Examen Parcial', peso: 30, nota: 11 },
          { eval: 'Tareas y Talleres', peso: 30, nota: 12 },
          { eval: 'Examen Bimestral', peso: 40, nota: 10 }
        ]
      },
      { 
        curso: 'Comunicación Integral', 
        promedio: 14.5, 
        tendencia: 'up',
        desglose: [
          { eval: 'Proyecto de Lectura', peso: 50, nota: 15 },
          { eval: 'Cuaderno y Ortografía', peso: 50, nota: 14 }
        ]
      }
    ]
  },
  'lucas': {
    id: 'a3333333-3333-3333-3333-333333333333',
    nombre: 'Lucas Castro',
    seccion: '2do Primaria - A',
    asistenciaHoy: 'P',
    pensionEstado: 'pendiente',
    pensionMonto: 380,
    pensionMes: 'Mayo',
    boleta: [
      { 
        curso: 'Matemática Divertida', 
        promedio: 16.8, 
        tendencia: 'up',
        desglose: [
          { eval: 'Examen Parcial', peso: 50, nota: 17 },
          { eval: 'Tareas', peso: 50, nota: 16.6 }
        ]
      },
      { 
        curso: 'Ciencia y Tecnología', 
        promedio: 15.5, 
        tendencia: 'stable',
        desglose: [
          { eval: 'Experimento Semanal', peso: 100, nota: 15.5 }
        ]
      }
    ]
  }
};

export default function PadreDashboard() {
  const [selectedHijoKey, setSelectedHijoKey] = useState<string>('mateo');
  const [pagando, setPagando] = useState(false);
  const [pagadoExito, setPagadoExito] = useState(false);
  const [showDesgloseCurso, setShowDesgloseCurso] = useState<string | null>(null);

  const hijo = HIJOS_MOCK[selectedHijoKey];

  const handleSimulatePayment = () => {
    setPagando(true);
    // Simular webhook de Culqi de 1.2 segundos
    setTimeout(() => {
      setPagando(false);
      setPagadoExito(true);
      hijo.pensionEstado = 'al_dia';
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO CON SELECTOR DE HIJOS (CRÍTICO) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-sans">Portal de Padres</h1>
          <p className="text-sm text-gray-500 mt-1">Monitorea el avance de tus hijos y mantente al día con los pagos.</p>
        </div>
        
        {/* Selector de hijos premium */}
        <div className="flex items-center gap-2 bg-white border border-gray-220 p-1.5 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-gray-400 pl-2 pr-1 uppercase tracking-wider">Hijo:</span>
          <button
            onClick={() => { setSelectedHijoKey('mateo'); setPagadoExito(false); setShowDesgloseCurso(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedHijoKey === 'mateo' ? 'bg-[#EEF1FE] text-[#4F6AF0]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Mateo
          </button>
          <button
            onClick={() => { setSelectedHijoKey('lucas'); setPagadoExito(false); setShowDesgloseCurso(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedHijoKey === 'lucas' ? 'bg-[#EEF1FE] text-[#4F6AF0]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Lucas
          </button>
        </div>
      </div>

      {/* 2. [PRIORIDAD 1] ESTADO DE CUENTA (Prominente en la parte superior) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        hijo.pensionEstado === 'vencido' && !pagadoExito
          ? 'bg-[#FDECEA] border-[#E07B6A]/30 text-gray-900'
          : hijo.pensionEstado === 'pendiente' && !pagadoExito
          ? 'bg-[#FEF6E8] border-[#F5A623]/30 text-gray-900'
          : 'bg-[#EAF5EF] border-[#5BAD8A]/30 text-gray-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              hijo.pensionEstado === 'vencido' && !pagadoExito ? 'bg-[#E07B6A] text-white' :
              hijo.pensionEstado === 'pendiente' && !pagadoExito ? 'bg-[#F5A623] text-white' : 'bg-[#5BAD8A] text-white'
            }`}>
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide">
                {hijo.pensionEstado === 'vencido' && !pagadoExito ? 'Pensión Vencida' :
                 hijo.pensionEstado === 'pendiente' && !pagadoExito ? 'Pensión Pendiente' : 'Estado de Cuenta al Día'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">
                {hijo.pensionEstado === 'vencido' && !pagadoExito ? `Mayo se encuentra con atraso. Regularice para evitar moras.` :
                 hijo.pensionEstado === 'pendiente' && !pagadoExito ? `Monto a pagar: S/. ${hijo.pensionMonto} antes del fin de mes.` :
                 '¡Excelente! No tienes deudas pendientes para este alumno.'}
              </p>
            </div>
          </div>
          
          {/* Acción financiera */}
          {hijo.pensionEstado !== 'al_dia' && !pagadoExito ? (
            <button 
              onClick={handleSimulatePayment}
              disabled={pagando}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2 ${
                hijo.pensionEstado === 'vencido' 
                  ? 'bg-[#E07B6A] hover:bg-[#E07B6A]/90 text-white shadow-[#E07B6A]/10' 
                  : 'bg-[#F5A623] hover:bg-[#F5A623]/90 text-white shadow-[#F5A623]/10'
              }`}
            >
              {pagando ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Pagar Pensión (S/. {hijo.pensionMonto})
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5BAD8A]">
              <CheckCircle className="w-5 h-5 text-[#5BAD8A]" />
              <span>Al Día</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. [PRIORIDAD 2] ASISTENCIA DE HOY Y EVENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Asistencia de Hoy */}
        <div className="premium-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asistencia de Hoy</span>
            <div className="flex items-center gap-3 mt-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-white ${
                hijo.asistenciaHoy === 'P' ? 'bg-[#5BAD8A]' :
                hijo.asistenciaHoy === 'T' ? 'bg-[#F5A623]' : 'bg-[#E07B6A]'
              }`}>
                {hijo.asistenciaHoy}
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900">
                  {hijo.asistenciaHoy === 'P' ? 'Presente' :
                   hijo.asistenciaHoy === 'T' ? 'Asistió con Tardanza' : 'Falta (Inasistencia)'}
                </span>
                <span className="block text-xs text-gray-400 mt-0.5 font-semibold">Matemática Divertida</span>
              </div>
            </div>
          </div>
          {hijo.asistenciaHoy === 'F' && (
            <div className="mt-4 pt-3 border-t border-gray-150 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold">¿Justificar inasistencia?</span>
              <a href="#" className="font-bold text-[#4F6AF0] hover:underline">Enviar Justificación</a>
            </div>
          )}
        </div>

        {/* Próximos Eventos */}
        <div className="premium-card p-5 md:col-span-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Próximos Eventos Académicos</span>
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E07B6A]" />
              <div className="flex-1">
                <span className="block text-xs font-bold text-gray-800">Examen Bimestral de Matemática</span>
                <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Mañana a las 08:00 AM</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4F6AF0]" />
              <div className="flex-1">
                <span className="block text-xs font-bold text-gray-800">Entrega de Cuaderno de Comunicación</span>
                <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Viernes 22 de Mayo</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOLETA DE NOTAS EN TIEMPO REAL */}
      <div className="premium-card p-5">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Boleta de Calificaciones en Tiempo Real</h3>
        <div className="space-y-4">
          {hijo.boleta.map((cursoObj) => {
            const isDesgloseOpen = showDesgloseCurso === cursoObj.curso;
            return (
              <div key={cursoObj.curso} className="border border-gray-150 rounded-xl overflow-hidden">
                {/* Cabecera del Curso */}
                <div 
                  onClick={() => setShowDesgloseCurso(isDesgloseOpen ? null : cursoObj.curso)}
                  className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#4F6AF0]/10 rounded-lg text-[#4F6AF0]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-950">{cursoObj.curso}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Bimestre I</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Tendencia */}
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <TrendingUp className={`w-4 h-4 ${
                        cursoObj.tendencia === 'up' ? 'text-[#5BAD8A]' :
                        cursoObj.tendencia === 'down' ? 'text-[#E07B6A]' : 'text-gray-400'
                      }`} />
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Estable</span>
                    </div>
                    {/* Promedio */}
                    <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                      cursoObj.promedio >= 11 ? 'text-[#5BAD8A] bg-[#EAF5EF]' : 'text-[#E07B6A] bg-[#FDECEA]'
                    }`}>
                      {cursoObj.promedio}
                    </span>
                  </div>
                </div>

                {/* Desglose de evaluaciones con pesos */}
                {isDesgloseOpen && (
                  <div className="border-t border-gray-150 p-4 bg-white divide-y divide-gray-100 animate-in slide-in-from-top-2 duration-150">
                    {cursoObj.desglose.map((des) => (
                      <div key={des.eval} className="flex justify-between py-2.5 text-xs">
                        <div>
                          <span className="font-bold text-gray-800">{des.eval}</span>
                          <span className="text-[10px] text-gray-400 font-bold ml-2">Peso: {des.peso}%</span>
                        </div>
                        <span className={`font-black ${des.nota >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]'}`}>
                          {des.nota}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
